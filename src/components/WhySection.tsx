import './WhySection.css';

export function WhySection() {
  return (
    <section className="why">
      <div className="section-inner">
        <div className="why__inner">
          <h2 className="section-headline why__headline">
            Baltimore Neighborhoods Thrive When Given a Voice
          </h2>
          <div className="why__body">
            <p>
              This isn't about filling storefronts. It's about proving that community input
              transforms neighborhoods. When residents feel heard, when operators feel confident,
              when leaders see clear data—real growth happens. Baltimore has everything needed
              for thriving retail: dense neighborhoods, diverse communities, hungry
              entrepreneurs. What's been missing is a system that connects them.
            </p>
            <p>
              Here's what we know: <strong>50% of retail businesses fail in their first five
              years.</strong> Most don't fail because they're badly run. They fail because
              location mismatch kills them before they start. Be More eliminates that failure
              mode. You don't guess. You validate. You commit with confidence.
            </p>
            <p className="why__tagline">
              This is economic development that actually works: community-driven, data-backed,
              operator-friendly, neighborhood-first.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
