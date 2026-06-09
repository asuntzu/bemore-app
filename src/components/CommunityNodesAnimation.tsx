import { useMemo } from 'react';
import './CommunityNodesAnimation.css';

const TO_RAD = Math.PI / 180;

const RAW_NODES = [
  { angle: 15,  clusterR: 62,  scatterR: 130, offsetAngle: -5,  size: 5,   delay: 0.0,  desktopOnly: false },
  { angle: 45,  clusterR: 55,  scatterR: 125, offsetAngle:  8,  size: 4,   delay: 0.3,  desktopOnly: false },
  { angle: 80,  clusterR: 70,  scatterR: 140, offsetAngle:  3,  size: 5.5, delay: 0.6,  desktopOnly: false },
  { angle: 115, clusterR: 58,  scatterR: 130, offsetAngle: -7,  size: 4.5, delay: 0.9,  desktopOnly: false },
  { angle: 150, clusterR: 65,  scatterR: 145, offsetAngle:  5,  size: 5,   delay: 0.2,  desktopOnly: false },
  { angle: 185, clusterR: 52,  scatterR: 120, offsetAngle:  2,  size: 4,   delay: 0.5,  desktopOnly: false },
  { angle: 220, clusterR: 68,  scatterR: 138, offsetAngle: -4,  size: 5.5, delay: 0.8,  desktopOnly: false },
  { angle: 255, clusterR: 60,  scatterR: 128, offsetAngle:  6,  size: 4.5, delay: 0.1,  desktopOnly: false },
  { angle: 290, clusterR: 55,  scatterR: 122, offsetAngle: -3,  size: 4,   delay: 0.4,  desktopOnly: false },
  { angle: 320, clusterR: 72,  scatterR: 142, offsetAngle:  7,  size: 5,   delay: 0.7,  desktopOnly: false },
  { angle: 30,  clusterR: 80,  scatterR: 148, offsetAngle: -6,  size: 4.5, delay: 1.1,  desktopOnly: true  },
  { angle: 165, clusterR: 75,  scatterR: 145, offsetAngle:  4,  size: 4,   delay: 1.3,  desktopOnly: true  },
  { angle: 240, clusterR: 78,  scatterR: 150, offsetAngle: -2,  size: 5,   delay: 1.0,  desktopOnly: true  },
  { angle: 340, clusterR: 73,  scatterR: 143, offsetAngle:  5,  size: 4.5, delay: 1.2,  desktopOnly: true  },
];

interface NodeDatum {
  id: number;
  cx: number;
  cy: number;
  dx: string;
  dy: string;
  r: number;
  delay: number;
  desktopOnly: boolean;
}

export function CommunityNodesAnimation() {
  const nodes = useMemo<NodeDatum[]>(() =>
    RAW_NODES.map((n, i) => {
      const cRad = n.angle * TO_RAD;
      const sRad = (n.angle + n.offsetAngle) * TO_RAD;
      const cx = Math.cos(cRad) * n.clusterR;
      const cy = Math.sin(cRad) * n.clusterR;
      const sx = Math.cos(sRad) * n.scatterR;
      const sy = Math.sin(sRad) * n.scatterR;
      return {
        id: i,
        cx,
        cy,
        dx: `${(sx - cx).toFixed(2)}px`,
        dy: `${(sy - cy).toFixed(2)}px`,
        r: n.size,
        delay: n.delay,
        desktopOnly: n.desktopOnly,
      };
    }), []);

  return (
    <div
      className="cna-wrap"
      role="img"
      aria-label="Animated network of community members connecting around a storefront"
    >
      <svg
        className="cna-svg"
        viewBox="-200 -200 400 400"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Connection lines — drawn first so they sit behind nodes */}
        {nodes.map(n => (
          <line
            key={`line-${n.id}`}
            className={`cna-line${n.desktopOnly ? ' cna-desktop-only' : ''}`}
            x1="0" y1="0"
            x2={n.cx} y2={n.cy}
            style={{ animationDelay: `${n.delay}s` } as React.CSSProperties}
          />
        ))}

        {/* Community nodes */}
        {nodes.map(n => (
          <circle
            key={`node-${n.id}`}
            className={`cna-node${n.desktopOnly ? ' cna-desktop-only' : ''}`}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            style={{
              '--dx': n.dx,
              '--dy': n.dy,
              animationDelay: `${n.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Glow pulse ring behind storefront */}
        <circle className="cna-glow" cx="0" cy="0" r="30" />

        {/* Storefront icon — line-art, 40px approx */}
        <g className="cna-storefront">
          {/* Building outline */}
          <rect x="-18" y="-20" width="36" height="40" rx="1" />
          {/* Awning */}
          <path d="M -20,-20 L 0,-29 L 20,-20" strokeLinejoin="round" />
          {/* Sign bar */}
          <rect className="cna-storefront__sign" x="-13" y="-20" width="26" height="7" rx="1" />
          {/* Left window */}
          <rect className="cna-storefront__window" x="-15" y="-12" width="10" height="9" rx="1" />
          {/* Right window */}
          <rect className="cna-storefront__window" x="5" y="-12" width="10" height="9" rx="1" />
          {/* Door */}
          <rect x="-7" y="4" width="14" height="16" rx="1.5" />
          {/* Door knob */}
          <circle className="cna-storefront__knob" cx="4.5" cy="12.5" r="1.2" />
        </g>
      </svg>
    </div>
  );
}
