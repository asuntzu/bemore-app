import './ProblemSection.css';

export function ProblemSection() {
  return (
    <section className="problem">
      <div className="section-inner">
        <h2 className="section-headline">The System Is Broken</h2>
        <div className="problem__pillars">
          <div className="problem__pillar">
            <span className="problem__tag">For Residents</span>
            <h3 className="problem__title">Nobody Asked</h3>
            <p className="problem__copy">
              Storefronts open based on rent prices and developer hunches—not what you want.
              Your neighborhood has real needs. Nobody's collecting them.
            </p>
          </div>
          <div className="problem__pillar">
            <span className="problem__tag">For Operators</span>
            <h3 className="problem__title">You're Guessing</h3>
            <p className="problem__copy">
              You invest everything into a location that sounds right. No data confirms it.
              Half of retail fails because of that guess. Be More ends the guessing.
            </p>
          </div>
          <div className="problem__pillar">
            <span className="problem__tag">For City &amp; Partners</span>
            <h3 className="problem__title">Everyone Loses</h3>
            <p className="problem__copy">
              Every empty storefront is lost revenue, lost foot traffic, lost energy.
              Baltimore's neighborhoods are ready. The system holding them back isn't.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
