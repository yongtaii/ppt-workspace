/**
 * Alignment check complementing the Skill's inspect (bounds/overlap).
 * Flags edges that almost — but not exactly — line up, and objects outside the side margins.
 * Usage: node src/check_alignment.js <deck.pptx> [--margin 0.72] [--out report.json]
 */
const fs = require('node:fs');
const JSZip = require('jszip');
const EMU = 914400;
const args = process.argv.slice(2);
const file = args[0];
const opt = k => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : null; };
const margin = parseFloat(opt('--margin') ?? '0.72');
const NEAR = [0.004, 0.06]; // inches: different but closer than a deliberate offset

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const pres = await zip.file('ppt/presentation.xml').async('string');
  const [, sw] = pres.match(/<p:sldSz cx="(\d+)"/);
  const W = sw / EMU;
  const slides = Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => a.match(/\d+/)[0] - b.match(/\d+/)[0]);
  const report = [];
  for (const [idx, name] of slides.entries()) {
    const xml = await zip.file(name).async('string');
    const objs = [];
    for (const m of xml.matchAll(/<p:(sp|pic|graphicFrame|cxnSp)>([\s\S]*?)<\/p:\1>/g)) {
      const nm = (m[2].match(/<p:cNvPr id="\d+" name="([^"]*)"/) || [])[1] || '';
      const off = m[2].match(/<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/);
      if (!off) continue;
      if (nm.startsWith('chrome:')) continue; // slide furniture, aligned by template
      const [x, y, w, h] = off.slice(1).map(v => v / EMU);
      objs.push({name: nm, x, y, r: x + w, b: y + h, w, h});
    }
    const issues = [];
    const near = (a, b) => { const d = Math.abs(a - b); return d > NEAR[0] && d < NEAR[1]; };
    const same = (a, b) => Math.abs(a - b) <= NEAR[0];
    const overlaps = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0) > 0.01;
    // Only compare objects that share a column (left/right edges) or a row (top edges),
    // and accept the pair when another alignment (center, opposite edge) holds exactly.
    const seen = new Set();
    for (let i = 0; i < objs.length; i++) {
      for (let j = i + 1; j < objs.length; j++) {
        const a = objs[i], b = objs[j];
        const column = overlaps(a.x, a.r, b.x, b.r) && !overlaps(a.y, a.b, b.y, b.b);
        const row = overlaps(a.y, a.b, b.y, b.b) && !overlaps(a.x, a.r, b.x, b.r);
        const checks = [];
        if (column) checks.push(['left', a.x, b.x], ['right', a.r, b.r]);
        if (row) checks.push(['top', a.y, b.y]);
        const ok = same(a.x + a.w / 2, b.x + b.w / 2) || same(a.y + a.h / 2, b.y + b.h / 2) || same(a.x, b.x) || same(a.y, b.y) || same(a.b, b.b);
        for (const [label, p, q] of checks) {
          if (!near(p, q) || ok) continue;
          const msg = `${label} edges ${p.toFixed(3)} vs ${q.toFixed(3)}in: "${a.name}" / "${b.name}"`;
          if (!seen.has(msg)) { seen.add(msg); issues.push(msg); }
        }
      }
    }
    for (const o of objs) {
      const fullBleed = o.x <= 0.001 && o.r >= W - 0.001;
      if (!fullBleed && (o.x < margin - 0.011 || o.r > W - margin + 0.011)) {
        issues.push(`outside side margin: "${o.name}" x=${o.x.toFixed(2)}..${o.r.toFixed(2)}in`);
      }
    }
    report.push({slide: idx + 1, objects: objs.length, issues});
  }
  const out = {file, margin, nearMissRangeIn: NEAR, slides: report,
    totalIssues: report.reduce((n, s) => n + s.issues.length, 0)};
  const json = JSON.stringify(out, null, 2);
  if (opt('--out')) fs.writeFileSync(opt('--out'), json);
  console.log(json);
  process.exit(out.totalIssues ? 1 : 0);
})();
