import './CtaSection.css';

interface CtaSectionProps {
  onNavigate: (page: 'form') => void;
}

export function CtaSection({ onNavigate }: CtaSectionProps) {
  return (
    <section className="cta-section">
      <div className="section-inner cta-section__inner">
        <h2 className="section-headline">Baltimore Is Ready.</h2>
        <p className="cta-section__body">
          The demand is there. The operators are ready. Be More connects them.
          Join the movement building Baltimore from the ground up.
        </p>

        <div className="cta-section__buttons">
          <button className="cta-btn cta-btn--primary" onClick={() => onNavigate('form')}>
            Shape Your Block <span>›</span>
          </button>
          <button className="cta-btn cta-btn--secondary" onClick={() => onNavigate('form')}>
            Open with Confidence <span>›</span>
          </button>
          <button className="cta-btn cta-btn--ghost" onClick={() => onNavigate('form')}>
            Become a Partner <span>›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
