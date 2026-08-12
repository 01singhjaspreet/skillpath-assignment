import { Check, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice, priceValue } from "../lib/pricing"
import { useCourses } from "../lib/useCourses"

const COURSE_ACCENTS = ["#f0523a", "#60c4d3", "#e5b64f", "#897cf0", "#75b86b"]

export function accentForCourse(courseCode) {
  const hash = [...courseCode].reduce((total, character) => {
    return (total * 31 + character.charCodeAt(0)) >>> 0
  }, 0)
  return COURSE_ACCENTS[hash % COURSE_ACCENTS.length]
}

export default function CoursesSection({ heading, showRefundableBadges }) {
  const {
    status,
    courses,
    country,
    countryStatus,
    courseRetry,
    reload,
    retryCountry,
  } = useCourses()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("featured")

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const filtered = courses.filter((course) => {
      if (!normalizedQuery) return true
      return [course.courseName, course.mainCategory].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      )
    })

    if (sort === "featured") return filtered
    const direction = sort === "price-asc" ? 1 : -1
    return [...filtered].sort(
      (first, second) =>
        (priceValue(first, country) - priceValue(second, country)) * direction,
    )
  }, [courses, country, query, sort])

  return (
    <section
      id="courses"
      className="catalog"
      aria-busy={status === "loading" || status === "retrying"}
      aria-labelledby="catalog-heading"
    >
      <div className="catalog__inner layout">
        <header className="catalog__header">
          <div>
            <p className="eyebrow eyebrow--dark">
              <span aria-hidden="true" /> Live course catalog
            </p>
            <h2 id="catalog-heading">{heading}</h2>
          </div>
          <p className="catalog__intro">
            Practical paths in content, business, and creative systems. New
            options arrive straight from the catalog.
          </p>
        </header>

        <div className="catalog__bar">
          <PriceRegion
            country={country}
            status={countryStatus}
            onRetry={retryCountry}
          />

          {status === "ready" && (
            <div className="catalog__controls">
              <label className="search-control">
                <span className="visually-hidden">Search courses</span>
                <Search aria-hidden="true" />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by course or category"
                />
              </label>

              <label className="sort-control">
                <span className="visually-hidden">Sort courses</span>
                <NativeSelect
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </NativeSelect>
              </label>
            </div>
          )}
        </div>

        <div className="catalog__results" aria-live="polite">
          {(status === "loading" || status === "retrying") && (
            <SkeletonGrid isRetrying={status === "retrying"} />
          )}
          {status === "error" && (
            <ErrorState courseRetry={courseRetry} onRetry={reload} />
          )}
          {status === "empty" && <EmptyState onRefresh={reload} />}
          {status === "ready" &&
            (visibleCourses.length === 0 ? (
              <SearchEmptyState query={query} onClear={() => setQuery("")} />
            ) : (
              <div className="course-grid" data-testid="course-grid">
                {visibleCourses.map((course) => (
                  <CourseCard
                    key={course.mangoId}
                    course={course}
                    country={country}
                    showRefundableBadge={showRefundableBadges}
                  />
                ))}
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

function PriceRegion({ country, status, onRetry }) {
  if (status === "loading") {
    return (
      <p className="region-note region-note--loading">
        <span className="region-note__pulse" aria-hidden="true" /> Checking
        local pricing…
      </p>
    )
  }

  if (status === "fallback") {
    return (
      <Alert className="region-note region-note--fallback" role="status">
        <span aria-hidden="true">!</span>
        <AlertDescription>
          Region check is unavailable. Showing USD.
        </AlertDescription>
        <Button variant="link" type="button" onClick={onRetry}>
          Retry region
        </Button>
      </Alert>
    )
  }

  return (
    <p className="region-note">
      <span className="region-note__dot" aria-hidden="true" /> Prices shown in{" "}
      {country === "IN" ? "Indian rupees" : "US dollars"}
    </p>
  )
}

function CourseCard({ course, country, showRefundableBadge }) {
  const accent = accentForCourse(course.courseCode)
  const style = { "--course-accent": accent }

  return (
    <Card className="course-card" style={style} data-testid="course-card">
      <div className="course-card__poster" aria-hidden="true">
        <span className="course-card__signal" />
        <span className="course-card__short">{course.shortCourse}</span>
        <svg viewBox="0 0 160 80">
          <path d="M-10 64C28 12 54 93 92 34s65 13 84-4" />
          <path d="M-4 70C24 28 62 85 88 46s48-8 82 4" />
        </svg>
      </div>

      <CardContent className="course-card__body">
        <div className="course-card__meta">
          <span>{course.mainCategory}</span>
          {showRefundableBadge && course.refundable && (
            <Badge className="refundable-badge">
              <Check aria-hidden="true" />
              Refundable
            </Badge>
          )}
        </div>

        <h3>{course.courseName}</h3>
        <p className="course-card__description">{course.description}</p>

        <div className="course-card__price">
          <span>Course fee</span>
          <strong>{formatPrice(course, country)}</strong>
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonGrid({ isRetrying = false }) {
  return (
    <div className="course-grid" aria-label="Loading courses" role="status">
      <span className="visually-hidden">
        {isRetrying
          ? "Retrying the course catalog now…"
          : "Loading the latest courses…"}
      </span>
      {Array.from({ length: 6 }, (_, index) => (
        <Card className="skeleton-card" aria-hidden="true" key={index}>
          <Skeleton className="skeleton-card__poster" />
          <CardContent className="skeleton-card__body">
            <Skeleton className="skeleton--tag" />
            <Skeleton className="skeleton--title" />
            <Skeleton className="skeleton--line" />
            <Skeleton className="skeleton--line-short" />
            <Skeleton className="skeleton--price" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ErrorState({ courseRetry, onRetry }) {
  const retrySeconds = courseRetry
    ? Math.ceil(courseRetry.delayMs / 1_000)
    : null

  return (
    <div className="state-panel" role="alert">
      <span className="state-panel__icon" aria-hidden="true">
        ↻
      </span>
      <p className="eyebrow eyebrow--dark">The catalog took a wrong turn</p>
      <h3>Courses didn’t load this time.</h3>
      {courseRetry ? (
        <p>
          Retrying automatically in about {retrySeconds} seconds. You can retry
          now instead.
        </p>
      ) : (
        <p>Automatic retries are complete. Try again when you’re ready.</p>
      )}
      <Button type="button" onClick={onRetry}>
        Try the catalog again
      </Button>
    </div>
  )
}

function EmptyState({ onRefresh }) {
  return (
    <div className="state-panel" role="status">
      <span className="state-panel__icon" aria-hidden="true">
        0
      </span>
      <p className="eyebrow eyebrow--dark">Catalog is clear</p>
      <h3>No courses are listed right now.</h3>
      <p>
        The request worked, but the catalog came back empty. Check it once more.
      </p>
      <Button type="button" variant="secondary" onClick={onRefresh}>
        Refresh courses
      </Button>
    </div>
  )
}

function SearchEmptyState({ query, onClear }) {
  return (
    <div className="state-panel state-panel--compact" role="status">
      <p className="eyebrow eyebrow--dark">No matching path</p>
      <h3>No courses match “{query}”.</h3>
      <p>Try a broader course name or category.</p>
      <Button type="button" variant="link" onClick={onClear}>
        Clear search
      </Button>
    </div>
  )
}
