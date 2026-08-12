import { parseCountry, parseCourses } from "./pricing"

const API_BASE_URL =
  import.meta.env.VITE_SKILLPATH_API_URL ??
  "https://syncsphere-hiv6.onrender.com"
const REQUEST_TIMEOUT_MS = 20_000

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function getJson(path, parse, externalSignal) {
  const controller = new AbortController()
  const abortFromExternal = () => controller.abort(externalSignal.reason)
  const timeoutId = window.setTimeout(
    () =>
      controller.abort(new DOMException("Request timed out", "TimeoutError")),
    REQUEST_TIMEOUT_MS,
  )

  if (externalSignal.aborted) abortFromExternal()
  externalSignal.addEventListener("abort", abortFromExternal, { once: true })

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new ApiError(
        `Request failed with status ${response.status}.`,
        response.status,
      )
    }

    let value
    try {
      value = await response.json()
    } catch {
      throw new ApiError("The service returned invalid JSON.")
    }

    return parse(value)
  } finally {
    window.clearTimeout(timeoutId)
    externalSignal.removeEventListener("abort", abortFromExternal)
  }
}

export const fetchCourses = (signal) =>
  getJson("/assignment/course-data", parseCourses, signal)

export const fetchCountry = (signal) =>
  getJson("/assignment/country-code", (value) => parseCountry(value), signal)
