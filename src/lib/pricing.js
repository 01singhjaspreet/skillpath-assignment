const isRecord = (value) => typeof value === "object" && value !== null

export function isCourse(value) {
  if (!isRecord(value)) return false

  return (
    typeof value.courseName === "string" &&
    typeof value.courseCode === "string" &&
    typeof value.description === "string" &&
    typeof value.mainCategory === "string" &&
    typeof value.shortCourse === "string" &&
    typeof value.courseType === "string" &&
    typeof value.pricePaise === "number" &&
    Number.isInteger(value.pricePaise) &&
    value.pricePaise >= 0 &&
    typeof value.priceUsdCents === "number" &&
    Number.isInteger(value.priceUsdCents) &&
    value.priceUsdCents >= 0 &&
    typeof value.mangoId === "string" &&
    typeof value.refundable === "boolean"
  )
}

export function parseCourses(value) {
  if (!Array.isArray(value) || !value.every(isCourse)) {
    throw new Error("The course catalog returned an unexpected response.")
  }
  return value
}

export function parseCountry(value) {
  if (
    !isRecord(value) ||
    (value.country_code !== "IN" && value.country_code !== "US")
  ) {
    throw new Error("The region service returned an unexpected response.")
  }
  return value.country_code
}

export function formatPrice(course, country) {
  const isIndia = country === "IN"
  const value = isIndia ? course.pricePaise / 100 : course.priceUsdCents / 100

  return new Intl.NumberFormat(isIndia ? "en-IN" : "en-US", {
    style: "currency",
    currency: isIndia ? "INR" : "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function priceValue(course, country) {
  return country === "IN" ? course.pricePaise : course.priceUsdCents
}
