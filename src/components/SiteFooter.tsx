import logoSrc from '../assets/logo.png';
import './SiteFooter.css';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-inner site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <img src={logoSrc} alt="Be More Inc." className="site-footer__logo" />
            <p className="site-footer__mission">
              Retail that belongs here. Built by the people who live here.
            </p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer navigation">
            <h4 className="site-footer__nav-title">Company</h4>
            <ul>
              <li><a href="#about">About Be More</a></li>
              <li><a href="#how">How It Works</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#resources">Resources / Blog</a></li>
            </ul>
          </nav>

          <div className="site-footer__social">
            <h4 className="site-footer__nav-title">Follow Us</h4>
            <div className="site-footer__social-links">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Twitter / X">X</a>
              <a href="#" aria-label="LinkedIn">in</a>
            </div>
          </div>

          <div className="site-footer__partners">
            <h4 className="site-footer__nav-title">Partners</h4>
            <p className="site-footer__partners-placeholder">
              Partner logos coming soon
            </p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© 2026 Be More Inc. All rights reserved.</span>
          <div className="site-footer__legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
