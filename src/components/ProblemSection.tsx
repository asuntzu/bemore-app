import './ProblemSection.css';

export function ProblemSection() {
  return (
    <section className="problem">
      <div className="section-inner">
        <h2 className="section-headline">Why Baltimore Storefronts Stay Empty</h2>
        <div className="problem__pillars">
          <div className="problem__pillar">
            <span className="problem__tag">For Residents</span>
            <h3 className="problem__title">"No One Asked"</h3>
            <p className="problem__copy">
              Your neighborhood has opinions. Preferences. Real needs. But storefronts open based
              on rent prices and developer guesses—not what you actually want. Your voice gets
              silenced, and the space sits empty.
            </p>
          </div>
          <div className="problem__pillar">
            <span className="problem__tag">For Operators</span>
            <h3 className="problem__title">"You're Guessing"</h3>
            <p className="problem__copy">
              Retail failure rates are brutal because location = everything and nobody knows if
              their concept fits. You invest capital, time, and energy into a location that
              sounded good but didn't deliver. That's not a business problem. That's a data
              problem.
            </p>
          </div>
          <div className="problem__pillar">
            <span className="problem__tag">For City &amp; Partners</span>
            <h3 className="problem__title">"Opportunity Lost"</h3>
            <p className="problem__copy">
              Every empty storefront is tax revenue walking away, foot traffic disappearing, and
              community momentum stalling. Baltimore neighborhoods have enormous potential—they
              just need a system that turns resident input into real economic activity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
