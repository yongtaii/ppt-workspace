/**
 * Web (HTML) version of the 12-slide feature test. Run with npm run build:feature-web.
 * Mirrors src/build_feature_test.js: same theme, content and inch coordinates (1in = 96px),
 * so the two outputs stay visually identical. Keep the content of both files in sync.
 */
const fs = require('node:fs');
const path = require('node:path');
const {ICONS, PHOTOS} = require('./feature_test_assets');
const root = path.resolve(__dirname, '..');
const T = require('../design/feature-test/theme.json');
const awards = require('../input/awards_2026.json');
const C = T.colors, G = T.grid;
const OUT = path.join(root, 'output/feature_test_web.html');
const W = T.slide.w, M = G.margin, CW = W - 2 * M, TOTAL = 12;

// ── Units & primitives ───────────────────────────────────────────────────
const px = v => +(v * 96).toFixed(2);
const fz = pt => +(pt * 4 / 3).toFixed(2);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const br = s => esc(s).replace(/\n/g, '<br>');
const sum = a => a.reduce((x, y) => x + y, 0);
const pos = (x, y, w, h) => `left:${px(x)}px;top:${px(y)}px;width:${px(w)}px;height:${px(h)}px`;
const FACE = {body: 'var(--body)', heading: 'var(--heading)', latin: 'var(--latin)'};

/** Text box. o: face, size(pt), color, align, valign(top|mid), bold, spacing(pt), lh, html, cls, tip */
function t(x, y, w, h, content, o = {}) {
  const st = [pos(x, y, w, h), `font-family:${FACE[o.face || 'body']}`, `font-size:${fz(o.size || T.type.body)}px`,
    `color:#${o.color || C.ink}`, `text-align:${o.align || 'left'}`, `justify-content:${o.valign === 'top' ? 'flex-start' : 'center'}`];
  if (o.face === 'heading' || o.bold) st.push(`font-weight:${o.bold ? 700 : 600}`);
  if (o.spacing) st.push(`letter-spacing:${(o.spacing * 4 / 3).toFixed(2)}px`);
  if (o.lh) st.push(`line-height:${o.lh}`);
  return `<div class="t${o.cls ? ' ' + o.cls : ''}" style="${st.join(';')}"><span class="c">${o.html ? content : br(content)}</span></div>`;
}
const heading = (x, y, w, h, s, o = {}) => t(x, y, w, h, s, {face: 'heading', size: T.type.title, spacing: -.3, ...o});
const latin = (x, y, w, h, s, o = {}) => t(x, y, w, h, s, {face: 'latin', ...o});
const caption = (x, y, w, s, o = {}) => latin(x, y, w, o.h || .25, s, {size: T.type.caption, spacing: 1.4, color: C.muted, ...o});

const shadowCss = k => { const s = T.shadow[k]; return `0 ${fz(s.offset)}px ${fz(s.blur)}px rgba(0,0,0,${s.opacity})`; };
function gradCss(k) {
  const g = T.gradients[k], stops = g.stops.map(([c, p]) => `#${c} ${p}%`).join(',');
  return g.radial ? `radial-gradient(circle at 50% 50%,${stops})` : `linear-gradient(${g.angle}deg,${stops})`;
}
/** Shape box. o: fill, radius(in), line, shadow, grad, alpha(0–1), cls, tip, extra */
function box(x, y, w, h, o = {}) {
  const st = [pos(x, y, w, h)];
  if (o.grad) st.push(`background:${gradCss(o.grad)}`);
  else if (o.fill) st.push(`background:#${o.fill}`);
  if (o.alpha != null) st.push(`opacity:${o.alpha}`);
  if (o.radius) st.push(`border-radius:${px(o.radius)}px`);
  if (o.line) st.push(`border:${o.dash ? '1px dashed' : '1px solid'} #${o.line}`);
  if (o.shadow) st.push(`box-shadow:${shadowCss(o.shadow)}`);
  if (o.extra) st.push(o.extra);
  return `<div class="b${o.cls ? ' ' + o.cls : ''}"${o.tip ? ` data-tip="${esc(o.tip)}"` : ''} style="${st.join(';')}"></div>`;
}
const card = (x, y, w, h, o = {}) => box(x, y, w, h, {fill: C.white, radius: T.radius.card, ...o});
/** Straight line from (x,y) by (w,h) inches; arrow: 'end' | 'begin'. */
function line(x, y, w, h, o = {}) {
  const color = '#' + (o.color || C.hairline), sw = o.width ? o.width * 4 / 3 : 1, pad = 6;
  const L = Math.min(x, x + w), Tp = Math.min(y, y + h), bw = Math.abs(px(w)), bh = Math.abs(px(h));
  const id = `a${Math.random().toString(36).slice(2, 8)}`;
  const mk = o.arrow ? `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="${o.mw || 7}" markerHeight="${o.mw || 7}" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${color}"/></marker></defs>` : '';
  const attr = o.arrow === 'end' ? `marker-end="url(#${id})"` : o.arrow === 'begin' ? `marker-start="url(#${id})"` : '';
  return `<svg class="ln" style="left:${px(L) - pad}px;top:${px(Tp) - pad}px;width:${bw + 2 * pad}px;height:${bh + 2 * pad}px" viewBox="${-pad} ${-pad} ${bw + 2 * pad} ${bh + 2 * pad}">${mk}<line x1="${w < 0 ? bw : 0}" y1="${h < 0 ? bh : 0}" x2="${w < 0 ? 0 : bw}" y2="${h < 0 ? 0 : bh}" stroke="${color}" stroke-width="${sw}" ${o.dash ? 'stroke-dasharray="4 4"' : ''} ${attr}/></svg>`;
}
function dot(x, y, d, fill, o = {}) {
  return box(x, y, d, d, {fill, radius: d / 2, alpha: o.alpha, extra: o.ring ? `background:#fff;border:${o.ring}px solid #${fill};box-sizing:border-box` : ''});
}
const svgUri = svg => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const photo = name => svgUri(PHOTOS[name][2]);
const icon = (name, color, size) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="#${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name][1]}</svg>`;

// ── Charts (inline SVG + hover layer) ───────────────────────────────────
function lineChart(x, y, w, h, cats, series, {min = 0, max, step}) {
  const Wp = px(w), Hp = px(h), padL = 34, padR = 16, padT = 30, padB = 24;
  const X = i => padL + i * (Wp - padL - padR) / (cats.length - 1), Y = v => padT + (1 - (v - min) / (max - min)) * (Hp - padT - padB);
  const ticks = Array.from({length: (max - min) / step + 1}, (_, i) => min + i * step);
  let s = ticks.map(v => `<line x1="${padL}" x2="${Wp - padR}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${padL - 8}" y="${Y(v) + 4}" text-anchor="end" class="ax">${v}</text>`).join('');
  s += cats.map((c, i) => `<text x="${X(i)}" y="${Hp - 6}" text-anchor="middle" class="ax">${c}</text>`).join('');
  // Legend (top-left), then series back-to-front so the primary series sits on top.
  s += series.map((se, i) => `<g transform="translate(${padL + i * 70},8)"><line x1="0" x2="16" y1="6" y2="6" stroke="#${se.color}" stroke-width="2"/><text x="22" y="10" class="lg">${se.name}</text></g>`).join('');
  [...series].reverse().forEach(se => {
    s += `<polyline fill="none" stroke="#${se.color}" stroke-width="2" stroke-linejoin="round" points="${se.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}"/>`;
    s += se.values.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="#${se.color}" stroke="#fff" stroke-width="2"/>`).join('');
  });
  const last = series[0].values.length - 1;
  s += `<text x="${X(last) - 6}" y="${Y(series[0].values[last]) - 10}" text-anchor="end" class="dl">${series[0].values[last]}</text>`;
  const data = {cats, series: series.map(se => ({name: se.name, values: se.values, color: se.color})), x0: padL, x1: Wp - padR, top: padT, bottom: Hp - padB};
  return `<svg class="chart" data-line='${esc(JSON.stringify(data))}' style="${pos(x, y, w, h)}" viewBox="0 0 ${Wp} ${Hp}">${s}<line class="xh" x1="0" x2="0" y1="${padT}" y2="${Hp - padB}"/></svg>`;
}
function barChart(x, y, w, h, cats, series, {max, step}) {
  const Wp = px(w), Hp = px(h), padL = 34, padR = 8, padT = 34, padB = 26;
  const Y = v => padT + (1 - v / max) * (Hp - padT - padB), base = Y(0);
  const groupW = (Wp - padL - padR) / cats.length, barW = Math.min(44, groupW * .62 / series.length), gap = 2;
  let s = Array.from({length: max / step + 1}, (_, i) => i * step).map(v => `<line x1="${padL}" x2="${Wp - padR}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${padL - 8}" y="${Y(v) + 4}" text-anchor="end" class="ax">${v}</text>`).join('');
  s += series.map((se, i) => `<g transform="translate(${padL + i * 86},8)"><rect width="12" height="12" rx="3" fill="#${se.color}"/><text x="18" y="10" class="lg">${se.name}</text></g>`).join('');
  cats.forEach((c, ci) => {
    const gx = padL + ci * groupW + (groupW - series.length * barW - (series.length - 1) * gap) / 2;
    series.forEach((se, si) => {
      const bx = gx + si * (barW + gap), top = Y(se.values[ci]), r = 4, h2 = base - top;
      s += `<path d="M${bx} ${base}V${top + r}Q${bx} ${top} ${bx + r} ${top}H${bx + barW - r}Q${bx + barW} ${top} ${bx + barW} ${top + r}V${base}Z" fill="#${se.color}" data-tip="${esc(`${c} · ${se.name}: ${se.values[ci]}억 원`)}"/>`;
      if (h2 > 0) s += `<text x="${bx + barW / 2}" y="${top - 6}" text-anchor="middle" class="dl">${se.values[ci]}</text>`;
    });
    s += `<text x="${padL + ci * groupW + groupW / 2}" y="${Hp - 6}" text-anchor="middle" class="ax">${c}</text>`;
  });
  s += `<line x1="${padL}" x2="${Wp - padR}" y1="${base}" y2="${base}" stroke="#${C.muted}" stroke-width="1"/>`;
  return `<svg class="chart" style="${pos(x, y, w, h)}" viewBox="0 0 ${Wp} ${Hp}">${s}</svg>`;
}
function doughnut(x, y, d, items) {
  const R = px(d) / 2, r = R * .62, total = sum(items.map(i => i.value));
  let a0 = -Math.PI / 2, s = '';
  const pt = (rad, a) => `${R + rad * Math.cos(a)} ${R + rad * Math.sin(a)}`;
  items.forEach(it => {
    const a1 = a0 + it.value / total * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0;
    s += `<path d="M${pt(R, a0)}A${R} ${R} 0 ${big} 1 ${pt(R, a1)}L${pt(r, a1)}A${r} ${r} 0 ${big} 0 ${pt(r, a0)}Z" fill="#${it.color}" stroke="#fff" stroke-width="2" data-tip="${esc(`${it.label}: ${it.value}%`)}"/>`;
    a0 = a1;
  });
  return `<svg class="chart" style="${pos(x, y, d, d)}" viewBox="0 0 ${2 * R} ${2 * R}">${s}</svg>`;
}

// ── Slides ──────────────────────────────────────────────────────────────
const slides = [];
function slide(n, bg, section, eyebrow, title, body, titleW = CW) {
  let h = latin(M, .36, 2, .3, 'Aster', {size: 15, bold: true, cls: 'chrome'})
    + caption(W - M - 5, .36, 5, `${String(n).padStart(2, '0')}  ${section}`, {align: 'right', size: 10, h: .3, cls: 'chrome'})
    + t(M, G.footerY, 7, .22, 'DESIGN SYSTEM TEST · 가상 기업 · 가상 데이터', {size: 10, color: C.muted, cls: 'chrome'})
    + latin(W - M - 1, G.footerY, 1, .22, `${String(n).padStart(2, '0')} / ${TOTAL}`, {size: 10, align: 'right', color: C.muted, cls: 'chrome'});
  if (eyebrow) h += t(M, G.eyebrowY, CW, .3, eyebrow, {size: 15, color: C.blue});
  if (title) h += heading(M, G.titleY, titleW, .7, title);
  slides.push({bg, section, html: h + body});
}

// 01 Typography
{
  let b = latin(M, 1.55, 6, .3, 'PPTX FEATURE TEST', {size: 13, bold: true, spacing: 2, color: C.blue})
    + heading(M, 1.98, 6, 1.75, '디자인 시스템\n기능 검증 샘플', {size: 48, lh: 1.15})
    + t(M, 4.0, 6, .95, '12가지 표현을 하나의 시스템으로\n일관되게 검증합니다.', {size: 20, color: C.muted, lh: 1.45})
    + caption(M, 5.28, 6, 'RICH TEXT RUNS')
    + t(M, 5.62, 6, .4, '<b>굵게</b>&nbsp;&nbsp;<span style="color:#0066CC">강조색</span>&nbsp;&nbsp;<u>밑줄</u>&nbsp;&nbsp;<span style="font-family:var(--latin)">Helvetica Neue</span>&nbsp;&nbsp;<i style="font-family:var(--latin)">Italic</i>', {size: 18, html: true});
  const rows = [['DISPLAY', 54, 'Aa 디자인', .92], ['TITLE', 36, '명확한 제목', .6], ['LEAD', 22, '핵심을 먼저 말합니다', .42],
    ['BODY', 18, '읽기 쉬운 본문 크기', .36], ['CAPTION', 11, 'CAPTION · 출처와 보조 설명', .24]];
  let y = 1.62;
  rows.forEach(([label, size, sample, h], i) => {
    b += caption(7.1, y + h / 2 - .22, 1.35, `${label}\n${size} pt`, {size: 10, spacing: 1, h: .44});
    b += t(8.6, y, W - M - 8.6, h, sample, {face: i < 2 ? 'heading' : 'body', size, spacing: size > 30 ? -.4 : 0, lh: 1.1});
    if (i < rows.length - 1) b += line(7.1, y + h + .17, W - M - 7.1, 0);
    y += h + .34;
  });
  slide(1, C.white, 'TYPOGRAPHY', null, null, b);
}

// 02 Shapes
{
  const shapeSvg = {
    rect: '<rect width="100" height="100"/>', roundRect: '<rect width="100" height="100" rx="20"/>', ellipse: '<circle cx="50" cy="50" r="50"/>',
    triangle: '<path d="M50 0L100 100H0Z"/>', diamond: '<path d="M50 0L100 50 50 100 0 50Z"/>',
    hexagon: '<path d="M25 0H75L100 50 75 100H25L0 50Z"/>', chevron: '<path d="M0 0H55L100 50 55 100H0L45 50Z"/>',
    donut: '<path fill-rule="evenodd" d="M50 0A50 50 0 1 1 49.99 0ZM50 25A25 25 0 1 0 50.01 25Z"/>',
    blockArc: '<path d="M0 50A50 50 0 0 1 100 50H75A25 25 0 0 0 25 50Z"/>',
    star5: '<path d="M50 0L61.8 35.4H99L68.9 57.3 80.3 92.7 50 70.8 19.7 92.7 31.1 57.3 1 35.4H38.2Z"/>',
    rightArrow: '<path d="M0 30H60V5L100 50 60 95V70H0Z"/>',
  };
  const rows = [['BASIC', 2.4, C.blue, [['rect', '사각형'], ['roundRect', '라운드 사각형'], ['ellipse', '원'], ['triangle', '삼각형'], ['diamond', '마름모'], ['line', '화살표 선']]],
    ['ADVANCED', 4.55, C.indigo, [['hexagon', '육각형'], ['chevron', '쉐브론'], ['donut', '도넛'], ['blockArc', '블록 원호'], ['star5', '별'], ['rightArrow', '블록 화살표']]]];
  const cw = (CW - 5 * G.gutter) / 6, d = .82;
  let b = '';
  for (const [label, y0, fill, shapes] of rows) {
    b += caption(M, y0, 3, label);
    shapes.forEach(([type, name], i) => {
      const x = M + i * (cw + G.gutter), ty = y0 + .38, sx = x + (cw - d) / 2, sy = ty + .2;
      b += card(x, ty, cw, 1.6, {radius: T.radius.tile});
      b += type === 'line' ? line(sx, sy + d / 2, d, 0, {color: C.blue, width: 2.25, arrow: 'end', mw: 4})
        : `<svg class="shp" style="${pos(sx, sy, d, d)}" viewBox="0 0 100 100" fill="#${fill}">${shapeSvg[type]}</svg>`;
      b += t(x, ty + 1.17, cw, .28, name, {size: 13, align: 'center', color: C.body});
    });
  }
  slide(2, C.canvas, 'SHAPES', '기본 및 고급 도형', '도형은 모두 편집 가능한 개체입니다.', b);
}

// 03 Effects
{
  const cw = (CW - 2 * G.gutter) / 3, top = 2.45, vh = 2.95, cols = [0, 1, 2].map(i => M + i * (cw + G.gutter));
  const hw = (cw - G.gutter) / 2;
  let b = card(cols[0], top, cw, 1.95, {grad: 'accent'})
    + latin(cols[0] + .3, top + .25, cw - .6, .25, 'LINEAR · 135°', {size: 11, spacing: 1.4, color: 'DCE6FA'})
    + latin(cols[0] + .3, top + 1.1, cw - .6, .55, 'Accent', {size: 32, bold: true, color: C.white})
    + card(cols[0], top + 2.2, hw, .75, {grad: 'soft', line: C.hairline})
    + latin(cols[0] + .2, top + 2.45, hw - .4, .25, 'soft · 90°', {size: 12, color: C.muted})
    + card(cols[0] + hw + G.gutter, top + 2.2, hw, .75, {grad: 'glow'})
    + latin(cols[0] + hw + G.gutter + .2, top + 2.45, hw - .4, .25, 'radial', {size: 12, color: C.white});
  b += card(cols[1], top, cw, vh);
  const cx = cols[1] + cw / 2, dd = 1.55;
  [[cx - .5, top + .25, C.blue], [cx + .5, top + .25, C.teal], [cx, top + 1.1, C.indigo]].forEach(([x, y, c]) => { b += dot(x - dd / 2, y, dd, c, {alpha: .65}); });
  [['soft', 'soft · blur 18 · 8%', top + .25], ['lift', 'lift · blur 28 · 14%', top + 1.6]].forEach(([k, label, y]) => {
    b += card(cols[2] + .25, y, cw - .5, 1.1, {shadow: k}) + latin(cols[2] + .55, y + .4, cw - 1.1, .3, label, {size: 14, color: C.body});
  });
  [['그라데이션', 'CSS 선형·방사형 그라데이션'], ['투명도', '채우기 투명도 35% · 겹침 영역 확인'], ['그림자', '두 단계 토큰 · 카드에만 사용']].forEach(([h, d], i) => {
    b += heading(cols[i], 5.65, cw, .4, h, {size: 20}) + t(cols[i], 6.1, cw, .32, d, {size: 14, color: C.muted});
  });
  slide(3, C.canvas, 'EFFECTS', '그라데이션, 투명도, 그림자', '효과는 정해진 토큰 안에서만 씁니다.', b);
}

// 04 Cards & asymmetric layout
{
  const top = G.contentTop, bh = G.contentBottom - top, lw = 7.0, rx = M + lw + G.gutter, rw = W - M - rx, rh = (bh - G.gutter) / 2;
  const b = card(M, top, lw, bh, {shadow: 'soft'})
    + latin(M + .45, top + .45, 3, .25, 'VISION', {size: 12, bold: true, spacing: 2, color: C.blue})
    + heading(M + .45, top + .9, lw - .9, 1.5, '고객의 하루를\n더 가볍게.', {size: 40, lh: 1.15})
    + t(M + .45, top + 2.9, lw - .9, .85, '복잡한 업무 흐름을 하나의 플랫폼으로 연결해\n팀이 본질적인 일에 집중하도록 돕습니다.', {size: 17, color: C.muted, lh: 1.45})
    + card(rx, top, rw, rh, {fill: C.blue})
    + latin(rx + .35, top + .35, rw - .7, .25, 'PLATFORM', {size: 11, bold: true, spacing: 2, color: 'BFD6F2'})
    + heading(rx + .35, top + .78, rw - .7, .45, '3개 사업부, 하나의 플랫폼', {size: 20, color: C.white})
    + t(rx + .35, top + 1.33, rw - .7, .32, 'ERP·CRM·물류 데이터를 통합', {size: 14, color: 'DCE9F8'})
    + card(rx, top + rh + G.gutter, rw, rh)
    + latin(rx + .35, top + rh + G.gutter + .3, rw - .7, .75, '24/7', {size: 44, bold: true, lh: 1.1})
    + t(rx + .35, top + rh + G.gutter + 1.2, rw - .7, .35, '글로벌 운영 지원', {size: 16, color: C.muted});
  slide(4, C.canvas, 'LAYOUT', '카드형 및 비대칭 레이아웃', '비대칭 그리드로 우선순위를 보여줍니다.', b);
}

// 05 Images
{
  const top = G.contentTop, lw = 6.35, lh = 3.9, rx = 7.4, rw = W - M - rx, d = 1.55, step = (rw - d) / 2;
  const img = (x, y, w, h, src, style, alt) => `<div class="img" style="${pos(x, y, w, h)};${style}"><img src="${src}" alt="${alt}" style="width:100%;height:100%;object-fit:cover"></div>`;
  let b = img(M, top, lw, lh, photo('landscape'), `border-radius:${px(T.radius.card)}px`, '자리표시자 풍경 이미지')
    + t(M, 6.45, lw, .3, 'cover 크롭 · 3:2 원본을 16:10 상자에 맞춤', {size: 13, color: C.muted});
  [['원형 마스크', 'architecture', 'border-radius:50%'], ['라운드 마스크', 'landscape', `border-radius:${px(T.radius.card)}px`],
    ['육각형 마스크', 'architecture', 'clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)']].forEach(([label, src, mask], i) => {
    const x = rx + i * step;
    b += img(x, top, d, d, photo(src), mask, label) + t(x, top + d + .12, d, .3, label, {size: 13, align: 'center', color: C.body});
  });
  const cy = 4.75, ch = 6.3 - cy, sw = 7.8;
  b += `<div class="img" style="${pos(rx, cy, rw, ch)};border-radius:${px(T.radius.tile)}px"><img src="${photo('landscape')}" alt="crop 영역" style="position:absolute;left:${-px(2.3)}px;top:${-px(2.6)}px;width:${px(sw)}px;height:${px(sw * 2 / 3)}px;max-width:none"></div>`;
  b += t(rx, 6.45, rw, .3, 'crop · 원본의 지정 영역만 표시', {size: 13, color: C.muted});
  slide(5, C.white, 'IMAGES', '이미지 크롭과 마스킹', '사진은 비율을 지키며 잘라 넣습니다.', b);
}

// 06 KPI dashboard
const monthly = {cats: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'],
  cur: [42, 45, 47, 50, 52, 55, 58, 61, 64], prev: [38, 40, 42, 44, 46, 48, 51, 53, 55]};
{
  const growth = ((sum(monthly.cur) / sum(monthly.prev) - 1) * 100).toFixed(1);
  const kpis = [['누적 매출', `${sum(monthly.cur)}억`, `▲ ${growth}%  전년 대비`], ['활성 고객', '128,400', '▲ 9.2%  전년 대비'],
    ['고객 유지율', '94.2%', '▲ 1.8%p  목표 92%'], ['NPS', '62', '▲ 7  목표 55']];
  const tw = (CW - 3 * G.gutter) / 4, top = G.contentTop;
  let b = '';
  kpis.forEach(([label, value, delta], i) => {
    const x = M + i * (tw + G.gutter);
    b += card(x, top, tw, 1.55) + t(x + .3, top + .22, tw - .6, .3, label, {size: 14, color: C.muted})
      + heading(x + .3, top + .58, tw - .6, .55, value, {size: 32, spacing: -.5})
      + t(x + .3, top + 1.15, tw - .6, .25, delta, {size: 12, color: C.positive});
  });
  const by = 4.2, bh = G.contentBottom - by, lw = 7.4, dx = M + lw + G.gutter, dw = W - M - dx;
  b += card(M, by, lw, bh) + t(M + .3, by + .2, 4, .3, '월별 매출 (억 원)', {size: 14, color: C.body})
    + lineChart(M + .15, by + .5, lw - .3, bh - .6, monthly.cats, [{name: '2026', values: monthly.cur, color: C.blue}, {name: '2025', values: monthly.prev, color: 'B8C4D6'}], {min: 30, max: 70, step: 10});
  const ch = [['직접 영업', 48], ['파트너', 32], ['온라인', 20]].map(([label, value], i) => ({label, value, color: T.chart[i]}));
  const dd = bh - .7;
  b += card(dx, by, dw, bh) + t(dx + .3, by + .2, 3, .3, '채널별 매출 비중', {size: 14, color: C.body})
    + doughnut(dx + .4, by + .55, dd, ch);
  ch.forEach((it, i) => {
    const ly = by + .75 + i * .45, lx = dx + .4 + dd + .4;
    b += box(lx, ly + .09, .14, .14, {fill: it.color, radius: .03}) + t(lx + .25, ly, dw - (lx - dx) - .55, .32, `${it.label}  <b>${it.value}%</b>`, {size: 13, color: C.body, html: true});
  });
  slide(6, C.canvas, 'DASHBOARD', 'KPI 대시보드', '3분기 핵심 지표가 모두 목표를 넘었습니다.', b);
}

// 07 Chart & table
{
  const Q = ['Q1', 'Q2', 'Q3'], units = [['클라우드', [70, 82, 96]], ['데이터', [44, 52, 60]], ['컨설팅', [20, 23, 27]]];
  const totals = Q.map((_, i) => sum(units.map(u => u[1][i])));
  const top = G.contentTop, lw = 6.4, tx = M + lw + .35, tw = W - M - tx;
  let b = t(M, top, lw, .3, '사업부별 분기 매출 (억 원)', {size: 14, color: C.body})
    + barChart(M, top + .4, lw, G.contentBottom - top - .4, Q, units.map(([name, values], i) => ({name, values, color: T.chart[i]})), {max: 120, step: 30})
    + t(tx, top, tw, .3, '분기 요약', {size: 14, color: C.body});
  const rows = units.map(([n, v]) => `<tr><td>${n}</td>${v.map(x => `<td class="n">${x}</td>`).join('')}</tr>`).join('');
  b += `<table class="tbl" style="${pos(tx, top + .4, tw, .48 * 5)}"><colgroup><col style="width:${px(1.74)}px"><col><col><col></colgroup>`
    + `<thead><tr><th>구분</th>${Q.map(q => `<th class="n">${q}</th>`).join('')}</tr></thead><tbody>${rows}`
    + `<tr class="sum"><td>합계</td>${totals.map(x => `<td class="n">${x}</td>`).join('')}</tr></tbody></table>`;
  const qoq = ((totals[2] / totals[1] - 1) * 100).toFixed(1), ch = G.contentBottom - 5.85;
  b += t(tx, 5.4, tw, .25, '단위: 억 원 · 가상 데이터', {size: 11, color: C.muted})
    + card(tx, 5.85, tw, ch, {fill: C.blueSoft}) + t(tx + .3, 5.85, 2.2, ch, 'Q3 전 분기 대비', {size: 15, color: C.body})
    + latin(tx + 2.6, 5.85, tw - 2.9, ch, `+${qoq}%`, {size: 26, bold: true, color: C.blue, align: 'right'});
  slide(7, C.white, 'DATA', '차트 및 표', '차트와 표는 데이터째로 편집됩니다.', b);
}

// 08 Process
{
  const steps = [['발견', '고객 인터뷰와\n데이터로 문제 탐색'], ['정의', '핵심 문제와\n성공 지표 합의'], ['설계', '프로토타입으로\n해법 검증'], ['구현', '2주 단위\n반복 개발'], ['측정', '지표 추적과\n회고']];
  const fills = ['DCE9F8', 'B9D4F2', '8DB9EA', '4F94DE', C.blue], gap = .08, sw = (CW - 4 * gap) / 5, sy = 2.55, sh = 1.0;
  const Wp = px(sw), Hp = px(sh), tip = Hp / 2;
  let b = '';
  const centers = [];
  steps.forEach(([h, d], i) => {
    const x = M + i * (sw + gap);
    centers.push(x + sw / 2);
    const p = i ? `M0 0H${Wp - tip}L${Wp} ${Hp / 2} ${Wp - tip} ${Hp}H0L${tip} ${Hp / 2}Z` : `M0 0H${Wp - tip}L${Wp} ${Hp / 2} ${Wp - tip} ${Hp}H0Z`;
    b += `<svg class="shp" style="${pos(x, sy, sw, sh)}" viewBox="0 0 ${Wp} ${Hp}"><path d="${p}" fill="#${fills[i]}"/></svg>`
      + latin(x + .45, sy, sw - .9, sh, String(i + 1).padStart(2, '0'), {size: 22, bold: true, align: 'center', color: i > 2 ? C.white : C.blue})
      + heading(x + .1, 3.85, sw - .2, .4, h, {size: 20})
      + t(x + .1, 4.35, sw - .2, .85, d, {size: 14, color: C.muted, lh: 1.45, valign: 'top'});
  });
  const loopY = 5.95, [c0, , , , c4] = centers, L = {color: C.blue, width: 1.25};
  b += line(c4, 5.45, 0, loopY - 5.45, L) + line(c0, loopY, c4 - c0, 0, L) + line(c0, 5.45, 0, loopY - 5.45, {...L, arrow: 'begin'})
    + t(c0, loopY + .12, c4 - c0, .3, '측정 결과는 다음 사이클의 발견으로 돌아갑니다', {size: 13, color: C.muted, align: 'center'});
  slide(8, C.white, 'PROCESS', '프로세스 다이어그램', '다섯 단계로 아이디어를 제품으로 만듭니다.', b);
}

// 09 Architecture
{
  let b = [[.72, 2.3, 'CLIENTS'], [3.65, 2.3, 'EDGE'], [6.58, 2.9, 'SERVICES'], [10.11, 2.5, 'DATA']].map(([x, w, l]) => caption(x, G.contentTop, w, l)).join('');
  b += box(3.45, 2.85, 6.23, 3.85, {radius: T.radius.card, line: 'A9B6C8', dash: true}) + latin(3.65, 6.38, 3, .22, 'Aster Cloud · VPC', {size: 10, color: C.muted});
  const node = (x, y, w, h, name, sub, dark) => box(x, y, w, h, {fill: dark ? C.blue : C.white, radius: .1, line: dark ? null : C.hairline})
    + t(x, y, w, h, `<span style="font-family:var(--latin);font-weight:700;font-size:${fz(14)}px;color:#${dark ? C.white : C.ink}">${esc(name)}</span><br><span style="font-size:${fz(11)}px;color:#${dark ? 'DCE9F8' : C.muted}">${esc(sub)}</span>`, {html: true, align: 'center', lh: 1.25});
  const tall = [3.05, 4.2, 5.35], th = .85, svc = [3.05, 3.88, 4.71, 5.54], sh = .66;
  [['Web App', 'React'], ['Mobile', 'iOS · Android'], ['Partner API', 'REST · Webhook']].forEach(([a, s], i) => { b += node(.72, tall[i], 2.3, th, a, s); });
  b += node(3.65, 3.05, 2.3, svc[3] + sh - 3.05, 'API Gateway', '인증 · 라우팅 · 속도 제한', true);
  [['Auth Service', 'OAuth 2.0'], ['Order Service', '주문 · 결제'], ['Billing', '정산 · 청구'], ['Notification', '메일 · 푸시']].forEach(([a, s], i) => { b += node(6.58, svc[i], 2.9, sh, a, s); });
  [['PostgreSQL', '트랜잭션'], ['Redis', '세션 · 캐시'], ['Data Lake', '분석 · 리포트']].forEach(([a, s], i) => { b += node(10.11, tall[i], 2.5, th, a, s); });
  const wire = {color: '8E9AAB', width: 1}, arrow = {...wire, arrow: 'end'}, bus = 9.82;
  tall.forEach(y => { b += line(3.02, y + th / 2, 3.65 - 3.02, 0, arrow); });
  svc.forEach(y => { b += line(5.95, y + sh / 2, 6.58 - 5.95, 0, arrow) + line(9.48, y + sh / 2, bus - 9.48, 0, wire); });
  b += line(bus, svc[0] + sh / 2, 0, svc[3] - svc[0], wire);
  tall.forEach(y => { b += line(bus, y + th / 2, 10.11 - bus, 0, arrow); });
  slide(9, C.canvas, 'ARCHITECTURE', '시스템 아키텍처', '요청은 게이트웨이를 거쳐 서비스로 흐릅니다.', b);
}

// 10 Timeline
{
  const items = [['2021', '창업', '설립 · 시드 투자'], ['2022', '첫 제품', '클라우드 ERP 출시'], ['2023', '확장', '데이터 사업부 신설'],
    ['2024', '글로벌', '싱가포르 법인 설립'], ['2025', '통합', '3개 사업부 단일화'], ['2026', '현재', '고객 12만 명 돌파']];
  const axisY = 4.55, tw = 2.1, x0 = M + tw / 2, step = (CW - tw) / (items.length - 1);
  let b = line(M, axisY, CW, 0, {color: 'D2D2D7', width: 1.5});
  items.forEach(([yr, h, d], i) => {
    const p = x0 + i * step, up = i % 2 === 0, now = i === items.length - 1, y = up ? 2.55 : 5.2;
    b += now ? dot(p - .19, axisY - .19, .38, C.blue, {ring: 4}) : dot(p - .11, axisY - .11, .22, C.blue);
    b += line(p, up ? 3.98 : 4.75, 0, .4, {color: 'D2D2D7'})
      + latin(p - tw / 2, y, tw, .45, yr, {size: 26, bold: true, align: 'center', color: now ? C.blue : C.ink})
      + heading(p - tw / 2, y + .5, tw, .36, h, {size: 17, align: 'center'})
      + t(p - tw / 2, y + .9, tw, .28, d, {size: 13, align: 'center', color: C.muted});
  });
  slide(10, C.white, 'TIMELINE', '타임라인', '여섯 해 동안 쌓아 온 이정표.', b);
}

// 11 SVG icons
{
  const names = Object.keys(ICONS), cw = (CW - 5 * G.gutter) / 6, th = 1.3, isz = .6;
  let b = '';
  names.forEach((n, i) => {
    const row = Math.floor(i / 6), x = M + (i % 6) * (cw + G.gutter), y = G.contentTop + row * (th + .25), dark = row === 1;
    b += card(x, y, cw, th, {radius: T.radius.tile, fill: dark ? C.blue : C.white})
      + `<div class="ico" style="${pos(x + (cw - isz) / 2, y + .2, isz, isz)}">${icon(n, dark ? C.white : C.blue, px(isz))}</div>`
      + t(x, y + .92, cw, .26, ICONS[n][0], {size: 12, align: 'center', color: dark ? C.white : C.body});
  });
  const cw3 = (CW - 2 * G.gutter) / 3;
  [['인라인 SVG', 'DOM 안의 벡터 · 어떤 배율에서도 선명'], ['CSS 색상 변경', 'stroke 값 하나로 블루·화이트 변형'], ['접근성', '장식 아이콘은 aria-hidden 처리']].forEach(([h, d], i) => {
    const x = M + i * (cw3 + G.gutter);
    b += line(x, 5.6, cw3, 0) + heading(x, 5.8, cw3, .38, h, {size: 18}) + t(x, 6.24, cw3, .3, d, {size: 13, color: C.muted});
  });
  slide(11, C.canvas, 'ICONS', 'SVG 아이콘', '벡터 아이콘은 어떤 크기에서도 선명합니다.', b);
}

// 12 Awards
{
  let b = t(W - M - 5, G.titleY, 5, .7, `${awards.organization} · ${awards.date}`, {size: 15, color: C.muted, align: 'right'});
  const n = awards.recipients.length, cw = (CW - (n - 1) * G.gutter) / n, top = G.contentTop + .05, ch = G.contentBottom - top, d = 1.4;
  awards.recipients.forEach((r, i) => {
    const x = M + i * (cw + G.gutter), real = r.photo && fs.existsSync(path.join(root, r.photo));
    const src = real ? path.relative(path.dirname(OUT), path.join(root, r.photo)) : photo(`portrait${(i % 5) + 1}`);
    b += card(x, top, cw, ch, {shadow: 'soft'})
      + `<div class="img" style="${pos(x + (cw - d) / 2, top + .35, d, d)};border-radius:50%"><img src="${src}" alt="${esc(r.name)} 사진" style="width:100%;height:100%;object-fit:cover"></div>`
      + t(x + .15, top + 2.0, cw - .3, .3, r.award, {size: 14, color: C.blue, align: 'center'})
      + heading(x + .15, top + 2.4, cw - .3, .45, r.name, {size: 22, align: 'center'})
      + t(x + .15, top + 2.92, cw - .3, .28, `${r.role} · ${r.team}`, {size: 13, color: C.muted, align: 'center'})
      + line(x + .3, top + 3.45, cw - .6, 0)
      + latin(x + .15, top + 3.62, cw - .3, .25, `PHOTO ${String(i + 1).padStart(2, '0')}${real ? '' : ' · 사진 교체'}`, {size: 10, color: C.muted, align: 'center'});
  });
  slide(12, C.canvas, 'AWARDS', '시상식 및 인물 소개', awards.title, b, 6.5);
}

// ── Page ────────────────────────────────────────────────────────────────
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aster Feature Test</title>
<style>
:root{--body:"${T.fonts.body}",-apple-system,"Noto Sans KR",sans-serif;--heading:"${T.fonts.body}",-apple-system,"Noto Sans KR",sans-serif;
  --latin:"${T.fonts.latin}",Helvetica,Arial,sans-serif;--ink:#${C.ink};--muted:#${C.muted};--hairline:#${C.hairline};--blue:#${C.blue}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#111;overflow:hidden;font-family:var(--body);-webkit-font-smoothing:antialiased}
/* Fixed 1280×720 stage (13.333×7.5in at 96px/in) scaled to the window. */
.deck{position:fixed;left:50%;top:50%;width:1280px;height:720px;transform:translate(-50%,-50%) scale(var(--k,1))}
.slide{position:absolute;inset:0;display:none;overflow:hidden}
.slide.active{display:block}
.slide>*{position:absolute}
.t{display:flex;flex-direction:column;line-height:1.25;white-space:nowrap}
.t .c{display:block}
.img{overflow:hidden} .img img{display:block}
.ln{overflow:visible;pointer-events:none}
.chart text{font-family:var(--latin)} .chart .ax{font-size:13px;fill:var(--muted)} .chart .lg{font-size:13px;fill:#${C.body}}
.chart .dl{font-size:12px;fill:#${C.body};font-weight:600} .chart .grid{stroke:var(--hairline);stroke-width:1}
.chart .xh{stroke:#${C.muted};stroke-width:1;stroke-dasharray:3 3;opacity:0}
.chart [data-tip]{cursor:default} .chart [data-tip]:hover{opacity:.85}
.tbl{border-collapse:collapse;font-size:${fz(15)}px;color:var(--ink);table-layout:fixed}
.tbl th,.tbl td{height:${px(.48)}px;padding:0 ${px(.12)}px;border-bottom:1px solid var(--hairline);text-align:left}
.tbl th{font-size:${fz(12)}px;color:var(--muted);font-weight:700;border-bottom:1.5px solid var(--ink)}
.tbl .n{text-align:right;font-family:var(--latin)} .tbl .sum td{font-weight:700} .tbl .sum .n{color:var(--blue)}
#tip{position:fixed;pointer-events:none;background:#1D1D1F;color:#fff;font:13px var(--body);padding:6px 10px;border-radius:6px;opacity:0;transition:opacity .12s;z-index:9;white-space:nowrap}
.hint{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);color:#999;font:12px var(--latin);transition:opacity .6s}
.hint.gone{opacity:0}
body.editing .t .c{outline:1px dashed rgba(0,102,204,.5);outline-offset:2px;cursor:text}
@media print{@page{size:1280px 720px;margin:0} html,body{overflow:visible;background:none}
  .deck{position:static;transform:none} .slide{position:relative;display:block;width:1280px;height:720px;break-after:page} .hint,#tip{display:none}}
</style>
</head>
<body>
<main class="deck">
${slides.map((s, i) => `<section class="slide" style="background:#${s.bg}" aria-label="${i + 1} / ${TOTAL} ${s.section}">${s.html}</section>`).join('\n')}
</main>
<div id="tip" role="tooltip"></div>
<div class="hint">← → 이동 · E 텍스트 편집 · F 전체화면</div>
<pre id="report" hidden></pre>
<script>
const deck=document.querySelector('.deck'), slides=[...document.querySelectorAll('.slide')], tip=document.getElementById('tip');
let cur=0;
const fit=()=>deck.style.setProperty('--k',Math.min(innerWidth/1280,innerHeight/720));
function show(n){cur=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.classList.toggle('active',i===cur));history.replaceState(null,'',location.search+'#'+(cur+1))}
const editing=()=>document.body.classList.contains('editing');
addEventListener('resize',fit);
addEventListener('keydown',e=>{
  if(editing()&&e.key!=='Escape')return;
  if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key))show(cur+1);
  else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key))show(cur-1);
  else if(e.key==='Home')show(0); else if(e.key==='End')show(slides.length-1);
  else if(e.key==='f')document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
  else if(e.key==='e')toggleEdit(true);
});
addEventListener('keydown',e=>{if(e.key==='Escape'&&editing())toggleEdit(false)});
function toggleEdit(on){document.body.classList.toggle('editing',on);document.querySelectorAll('.t .c').forEach(c=>c.contentEditable=on?'true':'false')}
addEventListener('click',e=>{if(editing()||e.target.closest('.chart'))return;show(cur+(e.clientX<innerWidth/3?-1:1))});
let x0=null;
addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
addEventListener('touchend',e=>{if(x0===null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)show(cur+(d<0?1:-1));x0=null});
// Hover layer: per-mark tooltips and a crosshair for line charts.
function showTip(text,e){tip.textContent=text;tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY-34)+'px';tip.style.opacity=1}
const hideTip=()=>tip.style.opacity=0;
document.querySelectorAll('[data-tip]').forEach(el=>{el.addEventListener('mousemove',e=>showTip(el.dataset.tip,e));el.addEventListener('mouseleave',hideTip)});
document.querySelectorAll('svg[data-line]').forEach(svg=>{
  const d=JSON.parse(svg.dataset.line), xh=svg.querySelector('.xh'), vb=svg.viewBox.baseVal;
  svg.addEventListener('mousemove',e=>{
    const r=svg.getBoundingClientRect(), x=(e.clientX-r.left)*vb.width/r.width;
    const i=Math.max(0,Math.min(d.cats.length-1,Math.round((x-d.x0)/(d.x1-d.x0)*(d.cats.length-1))));
    const cx=d.x0+i*(d.x1-d.x0)/(d.cats.length-1);
    xh.setAttribute('x1',cx);xh.setAttribute('x2',cx);xh.style.opacity=1;
    showTip(d.cats[i]+' · '+d.series.map(s=>s.name+' '+s.values[i]).join(' / ')+' (억 원)',e);
  });
  svg.addEventListener('mouseleave',()=>{xh.style.opacity=0;hideTip()});
});
const hint=document.querySelector('.hint');
if(new URLSearchParams(location.search).has('shot'))hint.remove();else setTimeout(()=>hint.classList.add('gone'),3000);
fit(); show((parseInt(location.hash.slice(1))||1)-1);

// ?check: layout audit (clipping, bounds, margins, text overlap, near-miss alignment) → #report as JSON.
if(new URLSearchParams(location.search).has('check'))document.fonts.ready.then(()=>{
  deck.style.transform='none';deck.style.left=deck.style.top='0';
  const M=${px(M)}, NEAR=[0.4,5.8], out=[];
  slides.forEach((s,si)=>{
    show(si);
    const base=s.getBoundingClientRect(), issues=[];
    const rect=el=>{const r=el.getBoundingClientRect();return{x:r.left-base.left,y:r.top-base.top,r:r.right-base.left,b:r.bottom-base.top,w:r.width,h:r.height}};
    const label=el=>(el.textContent||el.className.baseVal||el.className||el.tagName).toString().trim().slice(0,24);
    const texts=[...s.querySelectorAll(':scope>.t')];
    texts.forEach(el=>{const o=rect(el),c=rect(el.querySelector('.c'));
      if(c.w>o.w+1||c.h>o.h+1)issues.push('clipped: "'+label(el)+'" '+Math.round(c.w)+'×'+Math.round(c.h)+' > '+Math.round(o.w)+'×'+Math.round(o.h));});
    const objs=[...s.children].map(el=>({el,...rect(el),chrome:el.classList.contains('chrome')}));
    objs.forEach(o=>{
      if(o.x<-.5||o.y<-.5||o.r>1280.5||o.b>720.5)issues.push('outside slide: "'+label(o.el)+'"');
      else if(!o.chrome&&!o.el.classList.contains('ln')&&(o.x<M-1||o.r>1280-M+1))issues.push('outside margin: "'+label(o.el)+'" '+Math.round(o.x)+'..'+Math.round(o.r));
    });
    for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
      const a=rect(texts[i]),b=rect(texts[j]),ix=Math.min(a.r,b.r)-Math.max(a.x,b.x),iy=Math.min(a.b,b.b)-Math.max(a.y,b.y);
      if(ix>1&&iy>1)issues.push('text overlap: "'+label(texts[i])+'" / "'+label(texts[j])+'"');}
    const box=objs.filter(o=>!o.chrome&&!o.el.classList.contains('ln'));
    const near=(p,q)=>{const d=Math.abs(p-q);return d>NEAR[0]&&d<NEAR[1]}, same=(p,q)=>Math.abs(p-q)<=NEAR[0];
    const ov=(a0,a1,b0,b1)=>Math.min(a1,b1)-Math.max(a0,b0)>1;
    for(let i=0;i<box.length;i++)for(let j=i+1;j<box.length;j++){const a=box[i],b=box[j];
      const col=ov(a.x,a.r,b.x,b.r)&&!ov(a.y,a.b,b.y,b.b), row=ov(a.y,a.b,b.y,b.b)&&!ov(a.x,a.r,b.x,b.r);
      const ok=same(a.x+a.w/2,b.x+b.w/2)||same(a.y+a.h/2,b.y+b.h/2)||same(a.x,b.x)||same(a.y,b.y)||same(a.b,b.b);
      if(ok)continue;
      if(col&&(near(a.x,b.x)||near(a.r,b.r)))issues.push('column edges almost aligned: "'+label(a.el)+'" / "'+label(b.el)+'"');
      if(row&&near(a.y,b.y))issues.push('row tops almost aligned: "'+label(a.el)+'" / "'+label(b.el)+'"');}
    out.push({slide:si+1,objects:objs.length,issues});
  });
  const rep=document.getElementById('report');
  rep.textContent=JSON.stringify({slides:out,totalIssues:out.reduce((n,s)=>n+s.issues.length,0)});
  rep.dataset.done='1';
});
</script>
</body>
</html>
`;
fs.mkdirSync(path.dirname(OUT), {recursive: true});
fs.writeFileSync(OUT, html);
console.log(`wrote ${path.relative(root, OUT)} (${slides.length} slides)`);
