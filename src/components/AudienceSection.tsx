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
    copy: "Your block. Your call. Tell us what you want to see. We'll make sure operators hear you.",
    cta: 'Have Your Say',
  },
  {
    id: 'operator',
    label: 'Operator',
    title: 'Operator',
    copy: 'Know before you open. Enter a market that is already waiting for you. Zero guesswork.',
    cta: 'Find Your Market',
  },
  {
    id: 'partner',
    label: 'Partner',
    title: 'Partner',
    copy: 'Help Baltimore grow from within. Real data. Real entrepreneurs. Real results.',
    cta: 'Become a Partner',
  },
];

export function AudienceSection({ onNavigate }: { onNavigate: (page: 'form') => void }) {
  const [active, setActive] = useState<Audience>('resident');
  const current = PATHWAYS.find(p => p.id === active) ?? PATHWAYS[0]!;

  return (
    <section className="audience">
      <div className="section-inner">
        <h2 className="section-headline">Who Are You?</h2>

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
