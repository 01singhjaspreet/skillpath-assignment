import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { makeCourse, makeCourses } from "../test/fixtures"
import CoursesSection from "./CoursesSection"

const mocked = vi.hoisted(() => ({
  state: {
    status: "ready",
    courses: [],
    country: "US",
    countryStatus: "ready",
    reload: vi.fn(),
    retryCountry: vi.fn(),
  },
}))

vi.mock("../lib/useCourses", () => ({
  useCourses: () => mocked.state,
}))

describe("CoursesSection", () => {
  beforeEach(() => {
    mocked.state.status = "ready"
    mocked.state.courses = makeCourses(10)
    mocked.state.country = "US"
    mocked.state.countryStatus = "ready"
    mocked.state.reload.mockReset()
    mocked.state.retryCountry.mockReset()
  })

  it("renders ten live cards without assuming a fixed count", () => {
    render(<CoursesSection heading="Live paths" showRefundableBadges />)
    expect(
      screen.getByRole("heading", { name: "Live paths" }),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId("course-card")).toHaveLength(10)
  })

  it("searches by course name and category, with a distinct no-match state", () => {
    mocked.state.courses = [
      makeCourse({ courseName: "Podcast Launchpad", mainCategory: "Audio" }),
      makeCourse({
        courseName: "Creator Analytics",
        courseCode: "creator-analytics",
        mangoId: "analytics",
        mainCategory: "Data",
      }),
    ]

    render(<CoursesSection heading="Live paths" showRefundableBadges />)
    const search = screen.getByRole("searchbox", { name: "Search courses" })

    fireEvent.change(search, { target: { value: "audio" } })
    expect(
      screen.getByRole("heading", { name: "Podcast Launchpad" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Creator Analytics" }),
    ).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: "nothing here" } })
    expect(screen.getByText(/No courses match/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(screen.getAllByTestId("course-card")).toHaveLength(2)
  })

  it("sorts by the price in the displayed currency", () => {
    mocked.state.courses = [
      makeCourse({ courseName: "Mid", mangoId: "mid", priceUsdCents: 2000 }),
      makeCourse({
        courseName: "Low",
        courseCode: "low",
        mangoId: "low",
        priceUsdCents: 1000,
      }),
      makeCourse({
        courseName: "High",
        courseCode: "high",
        mangoId: "high",
        priceUsdCents: 3000,
      }),
    ]

    render(<CoursesSection heading="Live paths" showRefundableBadges />)
    const sort = screen.getByRole("combobox", { name: "Sort courses" })
    fireEvent.change(sort, { target: { value: "price-asc" } })

    const headings = within(screen.getByTestId("course-grid"))
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent)
    expect(headings).toEqual(["Low", "Mid", "High"])
  })

  it("respects the refundable badge configuration", () => {
    mocked.state.courses = [makeCourse({ refundable: true })]
    const { rerender } = render(
      <CoursesSection heading="Live paths" showRefundableBadges={false} />,
    )
    expect(screen.queryByText("Refundable")).not.toBeInTheDocument()

    rerender(<CoursesSection heading="Live paths" showRefundableBadges />)
    expect(screen.getByText("Refundable")).toBeInTheDocument()
  })

  it("shows a distinct API-empty state", () => {
    mocked.state.status = "empty"
    mocked.state.courses = []
    render(<CoursesSection heading="Live paths" showRefundableBadges />)
    expect(
      screen.getByRole("heading", { name: /No courses are listed/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
  })

  it("labels USD fallback and exposes a region-only retry", () => {
    mocked.state.countryStatus = "fallback"
    render(<CoursesSection heading="Live paths" showRefundableBadges />)
    expect(screen.getByText(/Region check is unavailable/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Retry region" }))
    expect(mocked.state.retryCountry).toHaveBeenCalledOnce()
  })
})
