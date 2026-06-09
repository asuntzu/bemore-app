import { useState } from 'react';
import './AudienceSection.css';

type Audience = 'resident' | 'operator' | 'partner';

interface Pathway {
  id: Audience;
  label: string;
  title: string;
  copy: string;
  cta: string;
}

const PATHWAYS: Pathway[] = [
  {
    id: 'resident',
    label: 'Resident',
    title: 'Resident',
    copy: 'Your neighborhood has untapped power. Tell us what you want. Watch operators listen. See empty spaces transform into something real.',
    cta: 'Share What You Want',
  },
  {
    id: 'operator',
    label: 'Operator',
    title: 'Operator',
    copy: 'Stop guessing about location viability. Access pre-validated demand data. Connect with suppliers who want to reach your market. Open with confidence.',
    cta: 'Find Validated Demand',
  },
  {
    id: 'partner',
    label: 'Partner',
    title: 'Partner',
    copy: "Help neighborhoods drive their own economic growth. Support real entrepreneurship. Transform vacant storefronts into thriving local businesses. That's economic development that sticks.",
    cta: 'Support Entrepreneurship',
  },
];

export function AudienceSection({ onNavigate }: { onNavigate: (page: 'form') => void }) {
  const [active, setActive] = useState<Audience>('resident');
  const current = PATHWAYS.find(p => p.id === active) ?? PATHWAYS[0]!;

  return (
    <section className="audience">
      <div className="section-inner">
        <h2 className="section-headline">Are You a...</h2>

        <div className="audience__tabs">
          {PATHWAYS.map(p => (
            <button
              key={p.id}
              className={`audience__tab ${active === p.id ? 'audience__tab--active' : ''}`}
              onClick={() => setActive(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="audience__panel">
          <h3 className="audience__title">{current.title}</h3>
          <p className="audience__copy">{current.copy}</p>
          <button className="audience__cta" onClick={() => onNavigate('form')}>
            {current.cta} <span>›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
