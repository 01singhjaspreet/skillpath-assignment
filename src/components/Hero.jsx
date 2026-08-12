function Brand() {
  return (
    <span className="brand" aria-label="Skillpath">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 34 34" role="img">
          <path d="M8 24V10h8.3c5.5 0 8.7 2.5 8.7 7s-3.2 7-8.7 7H8Z" />
          <path d="m23 10 4 4-4 4" />
        </svg>
      </span>
      <span>skillpath</span>
    </span>
  )
}

export default function Hero() {
  return (
    <header className="hero">
      <picture className="hero__media" aria-hidden="true">
        <source
          media="(max-width: 720px)"
          srcSet="/images/skillpath-hero-960.webp"
          type="image/webp"
        />
        <source srcSet="/images/skillpath-hero-1600.webp" type="image/webp" />
        <img
          src="/images/skillpath-hero.jpg"
          alt=""
          width="1600"
          height="900"
          fetchPriority="high"
        />
      </picture>
      <div className="hero__shade" aria-hidden="true" />

      <nav className="nav layout" aria-label="Primary navigation">
        <a href="#top" className="nav__brand">
          <Brand />
        </a>
        <div className="nav__links">
          <a href="#courses">Courses</a>
          <a href="mailto:hello@skillpath.example">Contact</a>
        </div>
        <Button asChild variant="secondary" className="nav__cta">
          <a href="#courses">
            Find your course <span aria-hidden="true">↘</span>
          </a>
        </Button>
      </nav>

      <div className="hero__content layout">
        <p className="eyebrow hero__eyebrow">
          <span aria-hidden="true" /> Practical learning for digital creators
        </p>
        <h1>
          Learn it. Make it.
          <span>Put it out there.</span>
        </h1>
        <p className="hero__lede">
          Focused courses for people who would rather publish the work than keep
          collecting notes.
        </p>
        <Button asChild>
          <a href="#courses">
            Explore live courses
            <ArrowRight aria-hidden="true" />
          </a>
        </Button>
      </div>

      <div className="hero__caption layout" aria-hidden="true">
        <span>Learn by building</span>
        <span>Catalog updates live</span>
      </div>
    </header>
  )
}
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
