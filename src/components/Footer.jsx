export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner layout">
        <a className="footer__brand" href="#top" aria-label="Skillpath home">
          <span className="footer__mark" aria-hidden="true">
            S<span>↗</span>
          </span>
          <span className="footer__brand-copy">
            <span className="footer__kicker">Skillpath / Learn by making</span>
            <strong>
              Skills that move
              <br /> from screen to world.
            </strong>
          </span>
        </a>

        <nav className="footer__links" aria-label="Footer navigation">
          <a href="#top">
            <span aria-hidden="true">01</span> Home
          </a>
          <a href="#courses">
            <span aria-hidden="true">02</span> Courses
          </a>
          <a href="mailto:hello@skillpath.example">
            <span aria-hidden="true">03</span> Email us
          </a>
        </nav>

        <p className="footer__copyright">
          © {new Date().getFullYear()} Skillpath
          <span>Made for the next thing you’ll ship.</span>
        </p>
      </div>
    </footer>
  )
}
