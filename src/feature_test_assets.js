/**
 * Generated assets for the feature-test deck: stroke icons (SVG) and placeholder
 * "photos" drawn as SVG and rasterized with src/rasterize_svg.swift. No external images.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');

const ICONS = {
  chart: ['차트', '<path d="M3 21h18"/><path d="M6 17v-6M11 17V5M16 17v-9M21 17v-3"/>'],
  shield: ['보안', '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'],
  cloud: ['클라우드', '<path d="M7 18.5h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 9.6 4.5 4.5 0 0 0 7 18.5z"/>'],
  users: ['사용자', '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.6.9 2.6 2.6 3 5.2"/>'],
  bolt: ['성능', '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'],
  globe: ['글로벌', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>'],
  lock: ['권한', '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>'],
  layers: ['플랫폼', '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'],
  target: ['목표', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'],
  chat: ['소통', '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'],
  settings: ['설정', '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'],
  leaf: ['지속가능', '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19l7-7"/>'],
};

function icon(name, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="#${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name][1]}</svg>`;
}
const svgData = svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

// Placeholder photos. Clearly synthetic so they are never mistaken for real material.
const PHOTOS = {
  landscape: [2400, 1600, `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600" viewBox="0 0 2400 1600">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFD9F5"/><stop offset="1" stop-color="#F4EFE8"/></linearGradient>
    <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FB4DC"/><stop offset="1" stop-color="#4A79B0"/></linearGradient></defs>
    <rect width="2400" height="1600" fill="url(#sky)"/><circle cx="1720" cy="520" r="150" fill="#FFF6E5"/>
    <path d="M0 1000 L420 560 L760 860 L1120 420 L1560 900 L1880 640 L2400 1000 V1600 H0Z" fill="#9AAFC7"/>
    <path d="M0 1080 L520 760 L900 1000 L1300 720 L1760 1040 L2120 860 L2400 1060 V1600 H0Z" fill="#6E87A6"/>
    <rect y="1120" width="2400" height="480" fill="url(#lake)"/>
    <path d="M0 1120 H2400" stroke="#DCE6F2" stroke-width="6"/></svg>`],
  architecture: [1600, 1600, `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1600 1600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9EEF5"/><stop offset="1" stop-color="#B7C6DA"/></linearGradient></defs>
    <rect width="1600" height="1600" fill="url(#g)"/>
    <path d="M200 1600 L200 420 L900 180 L900 1600Z" fill="#F7F9FC"/><path d="M900 180 L1400 420 L1400 1600 L900 1600Z" fill="#9FB3CC"/>
    ${Array.from({length: 11}, (_, i) => `<path d="M200 ${520 + i * 100} L900 ${300 + i * 118}" stroke="#C9D4E3" stroke-width="10"/><path d="M900 ${300 + i * 118} L1400 ${520 + i * 100}" stroke="#7F96B4" stroke-width="10"/>`).join('')}
    </svg>`],
};
const PORTRAIT_TINTS = [['DCE9F8', '8DB9EA'], ['E3F2EF', '7CC3B8'], ['ECEBFC', 'A9A7F0'], ['F3EEE6', 'C9B79C'], ['E9ECF1', 'A3AEBF']];
PORTRAIT_TINTS.forEach(([bg, fg], i) => {
  PHOTOS[`portrait${i + 1}`] = [800, 800, `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="#${bg}"/><circle cx="400" cy="320" r="150" fill="#${fg}"/>
    <path d="M130 800 C150 600 260 520 400 520 S650 600 670 800Z" fill="#${fg}"/></svg>`];
});

/** Writes SVG sources and rasterizes photos plus icon fallbacks in one Swift call. */
function prepare(root, dir) {
  fs.mkdirSync(dir, {recursive: true});
  const jobs = [];
  const photos = {};
  for (const [name, [w, h, svg]] of Object.entries(PHOTOS)) {
    const src = path.join(dir, `${name}.svg`);
    fs.writeFileSync(src, svg);
    photos[name] = {path: path.join(dir, `${name}.png`), w, h};
    jobs.push(src, photos[name].path, String(w), String(h));
  }
  const fallbacks = new Map(); // svg text → png path
  const variant = (name, color) => {
    const svg = icon(name, color);
    const key = crypto.createHash('sha1').update(svg).digest('hex').slice(0, 10);
    const src = path.join(dir, `icon-${name}-${color}.svg`);
    fs.writeFileSync(src, svg);
    const png = path.join(dir, `icon-${name}-${color}-${key}.png`);
    fallbacks.set(svg, png);
    jobs.push(src, png, '256', '256');
    return svgData(svg);
  };
  const icons = {};
  for (const name of Object.keys(ICONS)) icons[name] = {label: ICONS[name][0], variant: c => variant(name, c)};
  return {
    photos, icons,
    rasterize: () => execFileSync('swift', [path.join(root, 'src/rasterize_svg.swift'), ...jobs], {stdio: 'inherit'}),
    svgPng: svg => {
      if (!fallbacks.has(svg)) throw new Error('SVG without prepared fallback');
      return fs.readFileSync(fallbacks.get(svg));
    },
  };
}

module.exports = {prepare, ICONS, PHOTOS};
