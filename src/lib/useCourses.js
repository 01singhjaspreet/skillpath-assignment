import { useCallback, useEffect, useRef, useState } from "react"
import { fetchCountry, fetchCourses } from "./api"

export const COURSE_RETRY_DELAYS_MS = [2_000, 5_000, 10_000]

const wasAborted = (result) =>
  result.status === "rejected" &&
  result.reason instanceof DOMException &&
  result.reason.name === "AbortError"

export function useCourses() {
  const [status, setStatus] = useState("loading")
  const [courses, setCourses] = useState([])
  const [country, setCountry] = useState("US")
  const [countryStatus, setCountryStatus] = useState("loading")
  const [courseRetry, setCourseRetry] = useState(null)
  const requestVersion = useRef(0)
  const fullRequest = useRef(null)
  const courseRetryRequest = useRef(null)
  const countryRequest = useRef(null)
  const courseRetryTimer = useRef(null)
  const courseRetryAttempt = useRef(0)

  const clearCourseRetry = useCallback(() => {
    if (courseRetryTimer.current !== null) {
      window.clearTimeout(courseRetryTimer.current)
      courseRetryTimer.current = null
    }
    courseRetryRequest.current?.abort()
    courseRetryRequest.current = null
    setCourseRetry(null)
  }, [])

  const scheduleCourseRetry = useCallback((version) => {
    const attempt = courseRetryAttempt.current
    const delayMs = COURSE_RETRY_DELAYS_MS[attempt]

    if (delayMs === undefined || version !== requestVersion.current) {
      setCourseRetry(null)
      setStatus("error")
      return
    }

    courseRetryAttempt.current += 1
    setStatus("error")
    setCourseRetry({ attempt: attempt + 1, delayMs, phase: "scheduled" })

    courseRetryTimer.current = window.setTimeout(() => {
      courseRetryTimer.current = null
      if (version !== requestVersion.current) return

      const controller = new AbortController()
      courseRetryRequest.current = controller
      setStatus("retrying")
      setCourseRetry({ attempt: attempt + 1, delayMs, phase: "running" })

      void fetchCourses(controller.signal).then(
        (nextCourses) => {
          if (version !== requestVersion.current || controller.signal.aborted)
            return
          courseRetryRequest.current = null
          courseRetryAttempt.current = 0
          setCourseRetry(null)
          setCourses(nextCourses)
          setStatus(nextCourses.length === 0 ? "empty" : "ready")
        },
        (error) => {
          if (version !== requestVersion.current || controller.signal.aborted)
            return
          courseRetryRequest.current = null
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            scheduleCourseRetry(version)
          }
        },
      )
    }, delayMs)
  }, [])

  const reload = useCallback(() => {
    clearCourseRetry()
    fullRequest.current?.abort()
    countryRequest.current?.abort()

    const version = ++requestVersion.current
    const controller = new AbortController()
    fullRequest.current = controller

    setStatus("loading")
    setCourses([])
    setCountryStatus("loading")
    courseRetryAttempt.current = 0

    void Promise.allSettled([
      fetchCourses(controller.signal),
      fetchCountry(controller.signal),
    ]).then(([coursesResult, countryResult]) => {
      if (version !== requestVersion.current || controller.signal.aborted)
        return

      if (countryResult.status === "fulfilled") {
        setCountry(countryResult.value)
        setCountryStatus("ready")
      } else if (!wasAborted(countryResult)) {
        setCountry("US")
        setCountryStatus("fallback")
      }

      if (coursesResult.status === "rejected") {
        if (!wasAborted(coursesResult)) scheduleCourseRetry(version)
        return
      }

      setCourses(coursesResult.value)
      courseRetryAttempt.current = 0
      setCourseRetry(null)
      setStatus(coursesResult.value.length === 0 ? "empty" : "ready")
    })
  }, [clearCourseRetry, scheduleCourseRetry])

  const retryCountry = useCallback(() => {
    countryRequest.current?.abort()
    const version = requestVersion.current
    const controller = new AbortController()
    countryRequest.current = controller
    setCountryStatus("loading")

    void fetchCountry(controller.signal).then(
      (nextCountry) => {
        if (version !== requestVersion.current || controller.signal.aborted)
          return
        setCountry(nextCountry)
        setCountryStatus("ready")
      },
      (error) => {
        if (version !== requestVersion.current || controller.signal.aborted)
          return
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setCountry("US")
          setCountryStatus("fallback")
        }
      },
    )
  }, [])

  useEffect(() => {
    reload()
    return () => {
      if (courseRetryTimer.current !== null) {
        window.clearTimeout(courseRetryTimer.current)
      }
      fullRequest.current?.abort()
      courseRetryRequest.current?.abort()
      countryRequest.current?.abort()
    }
  }, [reload])

  return {
    status,
    courses,
    country,
    countryStatus,
    courseRetry,
    reload,
    retryCountry,
  }
}
