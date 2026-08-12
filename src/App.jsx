import CoursesSection from "./components/CoursesSection"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import { siteConfig } from "./config/site"

export default function App() {
  return (
    <div id="top" className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to course catalog
      </a>
      <Hero />
      <main id="main-content">
        <CoursesSection
          heading={siteConfig.catalogHeading}
          showRefundableBadges={siteConfig.showRefundableBadges}
        />
      </main>
      <Footer />
    </div>
  )
}
