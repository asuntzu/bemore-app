import './SolutionSection.css';

const STEPS = [
  {
    num: '01',
    title: 'You Share',
    audience: 'Community Decides',
    copy: "Scan a QR code. Share what you want in 60 seconds. Your neighborhood's real demand—on record.",
  },
  {
    num: '02',
    title: 'We Confirm',
    audience: 'Data Validates',
    copy: "Patterns emerge. Demand concentrates. Clear proof appears: this block wants a coffee shop. Four hundred people said so.",
  },
  {
    num: '03',
    title: 'You Win',
    audience: 'Business Opens',
    copy: "Operators arrive with certainty. The right business opens on the right block. The community gets what it asked for.",
  },
];

export function SolutionSection() {
  return (
    <section className="solution">
      <div className="section-inner">
        <h2 className="section-headline">Three Steps. Zero Guesswork.</h2>
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
