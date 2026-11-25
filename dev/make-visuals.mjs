// Writes assets/banner.svg and assets/scores.svg.   node dev/make-visuals.mjs
// Scores are from run #20 on n8n (2026-11-25), the first run after all fixes.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
mkdirSync(out, { recursive: true });
const SANS = 'Segoe UI, Inter, Helvetica, Arial, sans-serif';
const MONO = 'Consolas, Menlo, monospace';
const ACCENT = '#34d399';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- banner ----------
{
  const steps = ['CV (PDF)', 'Remove identity', 'Check in code', 'Score + quote', 'Verify quote', 'Sheet + draft'];
  const x0 = 110, x1 = 1090, gap = (x1 - x0) / (steps.length - 1);
  const boxes = steps.map((s, i) => {
    const x = x0 + i * gap;
    return `<rect class="pulse" style="animation-delay:${(i * 0.9).toFixed(1)}s" x="${x - 30}" y="214" width="60" height="60" rx="14" fill="#161616" stroke="#3a3a3a" stroke-width="2"/>`
      + `<circle cx="${x}" cy="244" r="8" fill="${i === 1 || i === 4 ? ACCENT : '#6b7280'}"/>`
      + `<text x="${x}" y="302" text-anchor="middle" font-family="${SANS}" font-size="17" fill="#d0d0d0">${esc(s)}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 340" width="1200" height="340" role="img" aria-label="Scored on what they did, not who they are. CVs are anonymized before scoring, and every score needs a quote from the CV.">`
    + `<style>.pulse{animation:p 5.4s infinite both}.dot{offset-path:path('M${x0} 244 H${x1}');animation:m 5.4s infinite linear}@keyframes m{0%{offset-distance:0%;opacity:0}4%{opacity:1}72%{offset-distance:100%;opacity:1}78%,100%{offset-distance:100%;opacity:0}}@keyframes p{0%,100%{stroke:#3a3a3a}6%,16%{stroke:${ACCENT}}26%{stroke:#3a3a3a}}@media (prefers-reduced-motion:reduce){.pulse,.dot{animation:none}.dot{opacity:0}}</style>`
    + `<defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#fff" fill-opacity=".07"/></pattern></defs>`
    + `<rect width="1200" height="340" rx="18" fill="#0a0a0a"/><rect width="1200" height="340" rx="18" fill="url(#g)"/>`
    + `<text x="60" y="100" font-family="${SANS}" font-size="52" font-weight="650" letter-spacing="-2" fill="#f5f5f5">Scored on what they did, <tspan fill="${ACCENT}">not who they are.</tspan></text>`
    + `<text x="62" y="146" font-family="${MONO}" font-size="19" fill="#a1a1a1">Name, gender, age and nationality are removed first. Every score needs a quote from the CV.</text>`
    + `<path d="M${x0} 244 H${x1}" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>${boxes}`
    + `<circle class="dot" r="6" fill="${ACCENT}"/></svg>`;
  writeFileSync(join(out, 'banner.svg'), svg);
}

// ---------- scores ----------
{
  const rows = [
    ['Rami', 'EN', 25, 'shortlist'], ['Lina', 'AR', 25, 'shortlist'], ['Sara', 'EN', 23, 'shortlist', 'pair'], ['Ahmad', 'EN', 21, 'shortlist', 'pair'],
    ['Omar', 'EN', 11, 'review'], ['Dana', 'EN', 11, 'review'], ['Yousef', 'AR', 6, 'not a fit'], ['Hiba', 'EN', 0, 'not a fit'],
  ];
  const W = 1200, top = 92, rowH = 46, left = 190, barMax = 700, H = top + rows.length * rowH + 74;
  const color = { shortlist: ACCENT, review: '#fbbf24', 'not a fit': '#6b7280' };
  const xFor = (v) => left + (v / 25) * barMax;
  let body = '';
  // thresholds
  for (const [v, label] of [[11, 'review ≥ 11'], [17, 'shortlist ≥ 17']]) {
    body += `<line x1="${xFor(v)}" y1="${top - 14}" x2="${xFor(v)}" y2="${top + rows.length * rowH}" stroke="#fff" stroke-opacity=".25" stroke-dasharray="4 5"/>`
      + `<text x="${xFor(v)}" y="${top - 22}" text-anchor="middle" font-family="${MONO}" font-size="14" fill="#a1a1a1">${label}</text>`;
  }
  rows.forEach(([name, lang, total, verdict, pair], i) => {
    const y = top + i * rowH;
    if (pair) body += `<rect x="20" y="${y + 2}" width="${W - 40}" height="${rowH - 4}" rx="10" fill="#fff" fill-opacity=".05"/>`;
    body += `<text x="40" y="${y + 29}" font-family="${SANS}" font-size="19" fill="#f5f5f5">${name}</text>`
      + `<text x="125" y="${y + 29}" font-family="${MONO}" font-size="14" fill="#8b8b8b">${lang}</text>`
      + `<rect x="${left}" y="${y + 12}" width="${Math.max(3, xFor(total) - left)}" height="22" rx="5" fill="${color[verdict]}"/>`
      + `<text x="${xFor(total) + 12}" y="${y + 29}" font-family="${MONO}" font-size="17" fill="#e5e5e5">${total}</text>`
      + `<text x="${left + barMax + 70}" y="${y + 29}" font-family="${SANS}" font-size="16" fill="${color[verdict]}">${verdict}</text>`;
  });
  const by = top + 2 * rowH;
  body += `<path d="M${W - 50} ${by + 8} q 18 0 18 18 v ${rowH * 2 - 52} q 0 18 -18 18" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Scores out of 25 for the 8 demo CVs. Rami 25, Lina 25, Sara 23, Ahmad 21: shortlist. Omar 11, Dana 11: review. Yousef 6, Hiba 0: not a fit. Sara and Ahmad have the same CV with a different name and gender.">`
    + `<rect width="${W}" height="${H}" rx="18" fill="#0a0a0a"/>`
    + `<text x="40" y="44" font-family="${SANS}" font-size="24" font-weight="600" fill="#f5f5f5">8 demo CVs, scored out of 25</text>`
    + body
    + `<text x="40" y="${H - 26}" font-family="${MONO}" font-size="15" fill="#a1a1a1">Highlighted: Sara and Ahmad, the same CV with a different name, gender, age and nationality.</text>`
    + `</svg>`;
  writeFileSync(join(out, 'scores.svg'), svg);
}
console.log('assets/banner.svg, assets/scores.svg');
