/**
 * Icon Generator — run with Node.js to create PNG icons
 * Usage: node generate_icons.js
 * Requires: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const outDir = path.join(__dirname, 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#4843eb');
  grad.addColorStop(1, '#3b34cf');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // E-reader shape
  const px = size * 0.2;
  const pw = size * 0.6;
  const ph = size * 0.7;
  const py = size * 0.15;
  const r  = size * 0.05;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, r);
  ctx.stroke();

  // Screen lines (representing dithering pattern)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = size * 0.02;
  const lines = 4;
  for (let i = 0; i < lines; i++) {
    const ly = py + ph * 0.15 + (ph * 0.6 / (lines - 1)) * i;
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.15, ly);
    ctx.lineTo(px + pw * 0.85, ly);
    ctx.stroke();
  }

  // Home button dot
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(px + pw / 2, py + ph + size * 0.06, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  const buf = canvas.toBuffer('image/png');
  const outPath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`Written: ${outPath}`);
}
