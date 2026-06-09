import './SolutionSection.css';

const QRIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="6" y="6" width="7" height="7" rx="0.5" fill="currentColor" />
    <rect x="20" y="3" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="23" y="6" width="7" height="7" rx="0.5" fill="currentColor" />
    <rect x="3" y="20" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="6" y="23" width="7" height="7" rx="0.5" fill="currentColor" />
    <rect x="20" y="20" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="27" y="20" width="5" height="5" rx="0.5" fill="currentColor" />
    <rect x="20" y="27" width="5" height="5" rx="0.5" fill="currentColor" />
    <rect x="27" y="27" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.4" />
  </svg>
);

const ChartIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect x="4" y="22" width="7" height="10" rx="1" fill="currentColor" />
    <rect x="14.5" y="15" width="7" height="17" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="25" y="8" width="7" height="24" rx="1" fill="currentColor" opacity="0.4" />
    <path d="M5 22L15 15L25.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="7" r="2.5" fill="currentColor" />
  </svg>
);

const StorefrontIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <path d="M5 14L8 5h20l3 9H5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <rect x="5" y="14" width="26" height="17" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="20" width="8" height="11" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="7" y="17" width="7" height="5" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="22" y="17" width="7" height="5" rx="1" fill="currentColor" opacity="0.6" />
  </svg>
);

const STEPS = [
  {
    num: '01',
    label: 'Community Decides',
    title: 'Scan. Share. Done in 30 Seconds.',
    copy: 'Residents scan a QR code on any empty storefront and share what business they want there—no app, no account needed. Within 48 hours, that input joins a live demand signal for the whole block.',
    Icon: QRIcon,
  },
  {
    num: '02',
    label: 'Data Validates',
    title: "Your Block's Demand, Made Visible",
    copy: 'Be More aggregates feedback into clear demand signals. Landlords see: "67% of residents want café + ethnic grocery." Operators see proof their concept fits this street—not a guess from a market report.',
    Icon: ChartIcon,
  },
  {
    num: '03',
    label: 'Operators Succeed',
    title: 'Open With Proof, Not Just Hope',
    copy: 'Operators launch with validated demand data and connections to suppliers, financing partners, and advisors matched to their business type. The community gets what it asked for. The storefront fills.',
    Icon: StorefrontIcon,
  },
];

export function SolutionSection() {
  return (
    <section className="solution">
      <div className="section-inner">
        <h2 className="section-headline">How Be More Works</h2>
        <div className="solution__steps">
          {STEPS.map((step) => (
            <div key={step.num} className="solution__step">
              <div className="solution__step-top">
                <div className="solution__step-num">{step.num}</div>
                <div className="solution__step-icon">
                  <step.Icon />
                </div>
              </div>
              <span className="solution__step-label">{step.label}</span>
              <h3 className="solution__step-title">{step.title}</h3>
              <p className="solution__step-copy">{step.copy}</p>
            </div>
          ))}
        </div>
        <div className="solution__cta">
          <span className="solution__cta-prompt">Got 30 seconds?</span>
          <a href="/feedback" className="solution__cta-link">Tell us what your block needs →</a>
        </div>
      </div>
    </section>
  );
}
