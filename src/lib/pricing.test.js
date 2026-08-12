import { describe, expect, it } from "vitest"
import { makeCourse } from "../test/fixtures"
import { formatPrice, parseCountry, parseCourses, priceValue } from "./pricing"

describe("pricing", () => {
  const course = makeCourse()

  it("converts paise to rupees with Indian formatting", () => {
    expect(formatPrice(course, "IN")).toBe("₹1,999.00")
    expect(priceValue(course, "IN")).toBe(199900)
  })

  it("converts cents to US dollars", () => {
    expect(formatPrice(course, "US")).toBe("$39.99")
    expect(priceValue(course, "US")).toBe(3999)
  })
})

describe("API payload validation", () => {
  it("accepts a complete catalog and supported countries", () => {
    expect(parseCourses([makeCourse()])).toHaveLength(1)
    expect(parseCountry({ country_code: "IN" })).toBe("IN")
    expect(parseCountry({ country_code: "US" })).toBe("US")
  })

  it("rejects malformed catalog and country payloads", () => {
    expect(() => parseCourses([{ courseName: "Incomplete" }])).toThrow(
      /unexpected response/i,
    )
    expect(() => parseCountry({ country_code: "GB" })).toThrow(
      /unexpected response/i,
    )
  })
})
