import './ImpactSection.css';

// Placeholder data — replace with real API data as Be More scales
const STATS = [
  { value: 'XXX', label: 'Community Voices Heard' },
  { value: 'XXX', label: 'Storefronts Activated' },
  { value: '50%', label: 'Retail failure rate Be More aims to cut' },
];

const TESTIMONIAL = {
  quote:
    'I came in with a concept. Be More validated it. My customers told me exactly what to stock.',
  name: '[Name]',
  business: '[Business]',
};

export function ImpactSection() {
  return (
    <section className="impact">
      <div className="section-inner">
        <h2 className="section-headline">Be More in Action</h2>

        <div className="impact__stats">
          {STATS.map(s => (
            <div key={s.label} className="impact__stat">
              <span className="impact__stat-val">{s.value}</span>
              <span className="impact__stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <figure className="impact__quote">
          <blockquote>"{TESTIMONIAL.quote}"</blockquote>
          <figcaption>— {TESTIMONIAL.name}, {TESTIMONIAL.business}</figcaption>
        </figure>
      </div>
    </section>
  );
}
