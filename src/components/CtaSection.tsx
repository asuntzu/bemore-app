import './CtaSection.css';

interface CtaSectionProps {
  onNavigate: (page: 'form') => void;
}

export function CtaSection({ onNavigate }: CtaSectionProps) {
  return (
    <section className="cta-section">
      <div className="section-inner cta-section__inner">
        <h2 className="section-headline">Ready to Change Baltimore?</h2>
        <p className="cta-section__body">
          Every empty storefront is potential. Every neighborhood has voices that want to be
          heard. Every operator deserves a shot at success. Let's build that system
          together—where community decides, data validates, and entrepreneurs win.
        </p>

        <div className="cta-section__buttons">
          <button className="cta-btn cta-btn--primary" onClick={() => onNavigate('form')}>
            Tell Us What You Want <span>›</span>
          </button>
          <button className="cta-btn cta-btn--secondary" onClick={() => onNavigate('form')}>
            Find Your Space <span>›</span>
          </button>
          <button className="cta-btn cta-btn--ghost" onClick={() => onNavigate('form')}>
            Partner With Us <span>›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
