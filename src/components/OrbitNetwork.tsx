import './OrbitNetwork.css';

interface OrbitNetworkProps {
  centerLabel: string;
  networkLabel: string;
}

const ICONS = [
  { emoji: '🏪', label: 'Bakery' },
  { emoji: '🧘', label: 'Wellness' },
  { emoji: '🎨', label: 'Arts' },
  { emoji: '🥗', label: 'Food' },
  { emoji: '📚', label: 'Education' },
  { emoji: '💇', label: 'Services' },
  { emoji: '🌱', label: 'Community' },
  { emoji: '☕', label: 'Café' },
  { emoji: '🎵', label: 'Music' },
];

export function OrbitNetwork({ centerLabel, networkLabel }: OrbitNetworkProps) {
  const inner = ICONS.slice(0, 3);
  const mid = ICONS.slice(3, 6);
  const outer = ICONS.slice(6, 9);

  return (
    <div className="orbit-wrap">
      <div className="orbit-scene">
        {/* Orbit rings */}
        <div className="orbit-ring orbit-ring--inner" />
        <div className="orbit-ring orbit-ring--mid" />
        <div className="orbit-ring orbit-ring--outer" />

        {/* Center */}
        <div className="orbit-center">
          <span className="orbit-center__text">{centerLabel}</span>
        </div>

        {/* Inner orbit icons */}
        <div className="orbit orbit--inner">
          {inner.map((icon, i) => (
            <div
              key={icon.label}
              className="orbit-icon"
              style={{ '--delay': `${(i / inner.length) * -30}s` } as React.CSSProperties}
              title={icon.label}
            >
              <span>{icon.emoji}</span>
            </div>
          ))}
        </div>

        {/* Mid orbit icons */}
        <div className="orbit orbit--mid">
          {mid.map((icon, i) => (
            <div
              key={icon.label}
              className="orbit-icon"
              style={{ '--delay': `${(i / mid.length) * -40}s` } as React.CSSProperties}
              title={icon.label}
            >
              <span>{icon.emoji}</span>
            </div>
          ))}
        </div>

        {/* Outer orbit icons */}
        <div className="orbit orbit--outer">
          {outer.map((icon, i) => (
            <div
              key={icon.label}
              className="orbit-icon"
              style={{ '--delay': `${(i / outer.length) * -50}s` } as React.CSSProperties}
              title={icon.label}
            >
              <span>{icon.emoji}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="orbit-label">{networkLabel}</p>
    </div>
  );
}
