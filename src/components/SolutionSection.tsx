import './SolutionSection.css';

const STEPS = [
  {
    num: '01',
    title: 'You Share',
    audience: 'Community Decides',
    copy: "Scan a QR code. Tell us what you want to see. That's it. Your neighborhood's real demand—not a developer's assumption—gets collected and aggregated.",
  },
  {
    num: '02',
    title: 'We Listen',
    audience: 'Data Validates',
    copy: 'Feedback becomes actionable intelligence. Category patterns emerge. Business types crystallize. You get clear proof: "This neighborhood wants X. They\'re ready for it."',
  },
  {
    num: '03',
    title: 'You Win',
    audience: 'Operators Succeed',
    copy: "Operators get pre-validated demand signals. Distributors connect to vetted businesses. Suppliers reach ready markets. Community gets what it asked for. Economy moves.",
  },
];

export function SolutionSection() {
  return (
    <section className="solution">
      <div className="section-inner">
        <h2 className="section-headline">How Be More Works</h2>
        <div className="solution__steps">
          {STEPS.map((step, i) => (
            <div key={step.num} className="solution__step">
              <div className="solution__step-num">{step.num}</div>
              {i < STEPS.length - 1 && <div className="solution__connector" />}
              <div className="solution__step-body">
                <span className="solution__step-label">{step.audience}</span>
                <h3 className="solution__step-title">{step.title}</h3>
                <p className="solution__step-copy">{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
