import { useMemo } from 'react';
import './CommunityNodesAnimation.css';

const TO_RAD = Math.PI / 180;

// Nodes now fill the canvas — clustered at 95-145 units, scattered at 160-190
const RAW_NODES = [
  { angle: 15,  clusterR: 115, scatterR: 172, offsetAngle: -5,  size: 8,   delay: 0.0,  desktopOnly: false },
  { angle: 45,  clusterR: 100, scatterR: 166, offsetAngle:  8,  size: 6.5, delay: 0.3,  desktopOnly: false },
  { angle: 80,  clusterR: 128, scatterR: 182, offsetAngle:  3,  size: 9,   delay: 0.6,  desktopOnly: false },
  { angle: 115, clusterR: 108, scatterR: 172, offsetAngle: -7,  size: 7,   delay: 0.9,  desktopOnly: false },
  { angle: 150, clusterR: 120, scatterR: 184, offsetAngle:  5,  size: 8,   delay: 0.2,  desktopOnly: false },
  { angle: 185, clusterR:  95, scatterR: 161, offsetAngle:  2,  size: 6.5, delay: 0.5,  desktopOnly: false },
  { angle: 220, clusterR: 124, scatterR: 178, offsetAngle: -4,  size: 9,   delay: 0.8,  desktopOnly: false },
  { angle: 255, clusterR: 110, scatterR: 169, offsetAngle:  6,  size: 7,   delay: 0.1,  desktopOnly: false },
  { angle: 290, clusterR: 100, scatterR: 163, offsetAngle: -3,  size: 6.5, delay: 0.4,  desktopOnly: false },
  { angle: 320, clusterR: 132, scatterR: 183, offsetAngle:  7,  size: 8,   delay: 0.7,  desktopOnly: false },
  { angle: 30,  clusterR: 145, scatterR: 188, offsetAngle: -6,  size: 7,   delay: 1.1,  desktopOnly: true  },
  { angle: 165, clusterR: 137, scatterR: 186, offsetAngle:  4,  size: 6.5, delay: 1.3,  desktopOnly: true  },
  { angle: 240, clusterR: 142, scatterR: 189, offsetAngle: -2,  size: 8,   delay: 1.0,  desktopOnly: true  },
  { angle: 340, clusterR: 134, scatterR: 184, offsetAngle:  5,  size: 7,   delay: 1.2,  desktopOnly: true  },
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
        <circle className="cna-glow" cx="0" cy="0" r="60" />

        {/* Storefront icon — scaled 2× from original (~80px at 400px canvas) */}
        <g className="cna-storefront">
          {/* Building outline */}
          <rect x="-40" y="-44" width="80" height="88" rx="2" />
          {/* Awning */}
          <path d="M -44,-44 L 0,-64 L 44,-44" strokeLinejoin="round" />
          {/* Sign bar */}
          <rect className="cna-storefront__sign" x="-29" y="-44" width="58" height="16" rx="2" />
          {/* Left window */}
          <rect className="cna-storefront__window" x="-33" y="-26" width="22" height="20" rx="2" />
          {/* Right window */}
          <rect className="cna-storefront__window" x="11" y="-26" width="22" height="20" rx="2" />
          {/* Door */}
          <rect x="-15" y="9" width="30" height="35" rx="3" />
          {/* Door knob */}
          <circle className="cna-storefront__knob" cx="10" cy="27" r="2.7" />
        </g>
      </svg>
    </div>
  );
}
