import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dir, 'og-image.svg');
const outPath = join(__dir, '..', 'public', 'og-image.png');

const svg = readFileSync(svgPath, 'utf8');

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
});

const rendered = resvg.render();
const png = rendered.asPng();
writeFileSync(outPath, png);

console.log('✓ Generated public/og-image.png (%d bytes)', png.length);
