import type { Lang, Translations } from '../types';
import logoSrc from '../assets/logo.png';
import './Navbar.css';

interface NavbarProps {
  t: Translations;
  lang: Lang;
  onLangToggle: () => void;
  onNavigate: (page: 'landing' | 'form' | 'sign' | 'success') => void;
}

export function Navbar({ t, lang, onLangToggle, onNavigate }: NavbarProps) {
  return (
    <nav className="navbar">
      <button className="navbar__logo" onClick={() => onNavigate('landing')}>
        <img src={logoSrc} alt="Be More Inc." className="navbar__logo-img" />
      </button>
      <ul className="navbar__links">
        <li><a href="#community">{t.nav.community}</a></li>
        <li><a href="#operators">{t.nav.forOperators}</a></li>
        <li><a href="#resources">{t.nav.resources}</a></li>
      </ul>
      <div className="navbar__actions">
        <button className="navbar__lang" onClick={onLangToggle}>
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
        <button className="navbar__login">{t.nav.login}</button>
        <button className="navbar__signup" onClick={() => onNavigate('form')}>
          {t.nav.signUp}
        </button>
      </div>
    </nav>
  );
}
