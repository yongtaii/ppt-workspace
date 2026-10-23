/**
 * Render a 1280×720 HTML deck to per-slide PNGs with headless Chrome and run its ?check audit.
 * Usage: node src/render_web_deck.js <deck.html> --out-dir <dir> --slides <n>
 */
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : null; };
const file = path.resolve(args[0]), outDir = path.resolve(opt('--out-dir')), n = parseInt(opt('--slides'), 10);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,720', '--virtual-time-budget=4500'];
const url = 'file://' + file;
fs.mkdirSync(outDir, {recursive: true});
for (let i = 1; i <= n; i++) {
  const png = path.join(outDir, `slide-${String(i).padStart(2, '0')}.png`);
  execFileSync(CHROME, [...base, `--screenshot=${png}`, `${url}?shot#${i}`], {stdio: 'ignore'});
}
const dom = execFileSync(CHROME, [...base, '--dump-dom', `${url}?check#1`], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});
const m = dom.match(/<pre id="report"[^>]*data-done="1"[^>]*>([\s\S]*?)<\/pre>/);
if (!m) { console.error('check report not produced'); process.exit(2); }
const report = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
report.renderer = 'headless Google Chrome';
report.screenshots = n;
fs.writeFileSync(path.join(outDir, 'web_check_report.json'), JSON.stringify(report, null, 2));
report.slides.filter(s => s.issues.length).forEach(s => console.log(`slide ${s.slide}:\n  ${s.issues.join('\n  ')}`));
console.log(`${n} screenshots, ${report.totalIssues} layout issues → ${path.relative(process.cwd(), outDir)}`);
process.exit(report.totalIssues ? 1 : 0);
