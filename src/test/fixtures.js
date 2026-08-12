export const makeCourse = (overrides = {}) => ({
  courseName: "How To YouTube",
  courseCode: "how-to-youtube",
  description:
    "From concept to creation, learn how to build and grow a channel using practical systems.",
  mainCategory: "Content Creation",
  shortCourse: "YouTube",
  courseType: "Original",
  pricePaise: 199900,
  priceUsdCents: 3999,
  mangoId: "course-1",
  refundable: true,
  ...overrides,
})

export const makeCourses = (count) =>
  Array.from({ length: count }, (_, index) =>
    makeCourse({
      courseName: `Course ${index + 1}`,
      courseCode: `course-${index + 1}`,
      shortCourse: `Path ${index + 1}`,
      mangoId: `course-${index + 1}`,
      pricePaise: (index + 1) * 10000,
      priceUsdCents: (index + 1) * 500,
    }),
  )
