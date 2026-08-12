import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { makeCourse, makeCourses } from "../test/fixtures"
import { useCourses } from "./useCourses"
import { COURSE_RETRY_DELAYS_MS } from "./useCourses"

const jsonResponse = (value, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(value), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  )

describe("useCourses", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("automatically retries only the failed course request", async () => {
    vi.useFakeTimers()
    vi.mocked(fetch)
      .mockImplementationOnce(() =>
        jsonResponse({ detail: "Unavailable" }, 500),
      )
      .mockImplementationOnce(() => jsonResponse({ country_code: "IN" }))
      .mockImplementationOnce(() => jsonResponse([makeCourse()]))

    const { result } = renderHook(() => useCourses())

    await act(async () => {})
    expect(result.current.status).toBe("error")
    expect(result.current.country).toBe("IN")
    expect(result.current.courseRetry).toEqual({
      attempt: 1,
      delayMs: COURSE_RETRY_DELAYS_MS[0],
      phase: "scheduled",
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(COURSE_RETRY_DELAYS_MS[0])
    })

    expect(result.current.status).toBe("ready")
    expect(result.current.courses).toHaveLength(1)
    expect(result.current.country).toBe("IN")
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it("stops automatic retries after the bounded backoff sequence", async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockImplementation((input) => {
      if (String(input).endsWith("/assignment/country-code")) {
        return jsonResponse({ country_code: "US" })
      }
      return jsonResponse({ detail: "Unavailable" }, 500)
    })

    const { result } = renderHook(() => useCourses())
    await act(async () => {})

    for (const delayMs of COURSE_RETRY_DELAYS_MS) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(delayMs)
      })
    }

    expect(result.current.status).toBe("error")
    expect(result.current.courseRetry).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(2 + COURSE_RETRY_DELAYS_MS.length)
  })

  it("cancels a scheduled automatic retry on unmount", async () => {
    vi.useFakeTimers()
    vi.mocked(fetch)
      .mockImplementationOnce(() =>
        jsonResponse({ detail: "Unavailable" }, 500),
      )
      .mockImplementationOnce(() => jsonResponse({ country_code: "US" }))

    const { result, unmount } = renderHook(() => useCourses())
    await act(async () => {})
    expect(result.current.courseRetry?.phase).toBe("scheduled")

    unmount()
    await vi.advanceTimersByTimeAsync(
      COURSE_RETRY_DELAYS_MS.reduce((total, delay) => total + delay, 0),
    )

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("loads a variable five-course catalog and local country", async () => {
    vi.mocked(fetch)
      .mockImplementationOnce(() => jsonResponse(makeCourses(5)))
      .mockImplementationOnce(() => jsonResponse({ country_code: "IN" }))

    const { result } = renderHook(() => useCourses())

    expect(result.current.status).toBe("loading")
    await waitFor(() => expect(result.current.status).toBe("ready"))
    expect(result.current.courses).toHaveLength(5)
    expect(result.current.country).toBe("IN")
    expect(result.current.countryStatus).toBe("ready")
  })

  it("shows a course error and recovers on retry", async () => {
    vi.mocked(fetch)
      .mockImplementationOnce(() => jsonResponse({ detail: "Not found" }, 404))
      .mockImplementationOnce(() => jsonResponse({ country_code: "US" }))
      .mockImplementationOnce(() => jsonResponse([makeCourse()]))
      .mockImplementationOnce(() => jsonResponse({ country_code: "IN" }))

    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(result.current.status).toBe("error"))

    act(() => result.current.reload())
    await waitFor(() => expect(result.current.status).toBe("ready"))
    expect(result.current.country).toBe("IN")
    expect(result.current.courses).toHaveLength(1)
  })

  it("keeps courses in USD when region fails and retries only the region", async () => {
    vi.mocked(fetch)
      .mockImplementationOnce(() => jsonResponse([makeCourse()]))
      .mockImplementationOnce(() =>
        jsonResponse({ detail: "Unavailable" }, 500),
      )
      .mockImplementationOnce(() => jsonResponse({ country_code: "IN" }))

    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(result.current.status).toBe("ready"))
    expect(result.current.country).toBe("US")
    expect(result.current.countryStatus).toBe("fallback")

    act(() => result.current.retryCountry())
    await waitFor(() => expect(result.current.countryStatus).toBe("ready"))
    expect(result.current.country).toBe("IN")
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it("distinguishes an empty catalog from an error", async () => {
    vi.mocked(fetch)
      .mockImplementationOnce(() => jsonResponse([]))
      .mockImplementationOnce(() => jsonResponse({ country_code: "US" }))

    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(result.current.status).toBe("empty"))
    expect(result.current.courses).toEqual([])
  })

  it("treats malformed course data as a recoverable error", async () => {
    vi.mocked(fetch)
      .mockImplementationOnce(() =>
        jsonResponse([{ courseName: "Incomplete" }]),
      )
      .mockImplementationOnce(() => jsonResponse({ country_code: "US" }))

    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(result.current.status).toBe("error"))
  })

  it("aborts stale requests before applying a newer result", async () => {
    const initialSignals = []
    let call = 0

    vi.mocked(fetch).mockImplementation((_input, init) => {
      call += 1
      const signal = init?.signal
      if (call <= 2) {
        initialSignals.push(signal)
        return new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          })
        })
      }
      if (call === 3)
        return jsonResponse([makeCourse({ courseName: "Fresh result" })])
      return jsonResponse({ country_code: "IN" })
    })

    const { result } = renderHook(() => useCourses())
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))

    act(() => result.current.reload())
    await waitFor(() => expect(result.current.status).toBe("ready"))

    expect(initialSignals).toHaveLength(2)
    expect(initialSignals.every((signal) => signal.aborted)).toBe(true)
    expect(result.current.courses[0].courseName).toBe("Fresh result")
  })
})
