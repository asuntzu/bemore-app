import { Navbar } from '../components/Navbar';
import { OrbitNetwork } from '../components/OrbitNetwork';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { WhySection } from '../components/WhySection';
import { AudienceSection } from '../components/AudienceSection';
import { ImpactSection } from '../components/ImpactSection';
import { CtaSection } from '../components/CtaSection';
import { SiteFooter } from '../components/SiteFooter';
import type { Lang, Translations } from '../types';
import './Landing.css';

interface LandingProps {
  t: Translations;
  lang: Lang;
  onLangToggle: () => void;
  onNavigate: (page: 'landing' | 'form' | 'sign' | 'success') => void;
}

export function Landing({ t, lang, onLangToggle, onNavigate }: LandingProps) {
  return (
    <div className="landing">
      <Navbar t={t} lang={lang} onLangToggle={onLangToggle} onNavigate={onNavigate} />

      {/* ── Section 1: Hero ─────────────────────────────────────── */}
      <main className="landing__main" id="community">
        <div className="landing__left">
          <h1 className="landing__headline">
            {t.hero.headline.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p className="landing__sub">{t.hero.subheadline}</p>
          <p className="landing__body">{t.hero.body}</p>
          <button className="landing__cta" onClick={() => onNavigate('form')}>
            {t.hero.cta} <span className="landing__cta-arrow">›</span>
          </button>

          <div className="landing__stats">
            <div className="landing__stat">
              <span className="landing__stat-num">50+</span>
              <span className="landing__stat-label">Storefronts</span>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <span className="landing__stat-num">12</span>
              <span className="landing__stat-label">Neighborhoods</span>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <span className="landing__stat-num">800+</span>
              <span className="landing__stat-label">Voices</span>
            </div>
          </div>
        </div>

        <div className="landing__right" id="operators">
          <OrbitNetwork
            centerLabel={t.hero.networkCenter}
            networkLabel={t.hero.networkLabel}
          />
        </div>
      </main>

      {/* ── Sections 2–7 ────────────────────────────────────────── */}
      <ProblemSection />
      <SolutionSection />
      <WhySection />
      <AudienceSection onNavigate={() => onNavigate('form')} />
      <ImpactSection />
      <CtaSection onNavigate={() => onNavigate('form')} />

      {/* ── Section 8: Footer ───────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
