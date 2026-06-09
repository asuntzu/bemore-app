import './WhySection.css';

export function WhySection() {
  return (
    <section className="why">
      <div className="section-inner">
        <div className="why__inner">
          <h2 className="section-headline why__headline">
            Baltimore Has Everything It Needs.
          </h2>
          <div className="why__body">
            <p>
              Dense neighborhoods. Hungry entrepreneurs. A city ready to grow.
              What's been missing is the connection—between what residents want
              and where operators open.
            </p>
            <p>
              <strong>Half of retail fails in five years.</strong> Not from bad operators.
              From wrong locations. Be More removes that failure mode.
              You validate before you commit.
            </p>
            <p className="why__tagline">
              Community voice. Validated demand. Businesses that belong.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
