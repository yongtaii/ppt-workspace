/** 12-slide PptxGenJS feature test on a shared design system. Run with npm run build:feature. */
const pptxgen = require('pptxgenjs');
const fs = require('node:fs');
const path = require('node:path');
const {postprocess} = require('./pptx_postprocess');
const assets = require('./feature_test_assets');
const root = path.resolve(__dirname, '..');
const T = require('../design/feature-test/theme.json');
const C = T.colors, G = T.grid, F = T.fonts;
const awards = require('../input/awards_2026.json');
const OUT = path.join(root, 'output/feature_test.pptx');
const A = assets.prepare(root, path.join(root, 'output/feature_test_assets'));

const pptx = new pptxgen();
pptx.layout = T.layout;
pptx.author = 'PPT Workspace';
pptx.title = 'Aster — PPTX Design System Feature Test';
pptx.subject = 'PptxGenJS 디자인·기능 검증용 12장 샘플 (가상 기업, 가상 데이터)';
pptx.lang = 'ko-KR';
pptx.theme = {headFontFace: F.heading, bodyFontFace: F.body, lang: 'ko-KR'};
const W = T.slide.w, M = G.margin, CW = W - 2 * M;
const TOTAL = 12;

// ── Design-system primitives ─────────────────────────────────────────────
function text(s, value, x, y, w, h, o = {}) {
  s.addText(value, {x, y, w, h, fontFace: F.body, fontSize: T.type.body, color: C.ink,
    margin: 0, breakLine: false, valign: 'mid', paraSpaceAfterPt: 0, fit: 'none', ...o});
}
const heading = (s, v, x, y, w, h, o = {}) => text(s, v, x, y, w, h, {fontFace: F.heading, fontSize: T.type.title, charSpacing: -.3, ...o});
const latin = (s, v, x, y, w, h, o = {}) => text(s, v, x, y, w, h, {fontFace: F.latin, ...o});
const caption = (s, v, x, y, w, o = {}) => latin(s, v, x, y, w, .25, {fontSize: T.type.caption, charSpacing: 1.4, color: C.muted, ...o});
function box(s, x, y, w, h, fill, o = {}) {
  const {radius = 0, line, shadow, name, transparency} = o;
  s.addShape(radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {x, y, w, h,
    rectRadius: radius || undefined, objectName: name, shadow: shadow && T.shadow[shadow],
    fill: {color: fill, transparency: transparency || 0},
    line: line ? {color: line, width: .75} : {color: fill, transparency: 100}});
}
const card = (s, x, y, w, h, o = {}) => box(s, x, y, w, h, o.fill || C.white, {radius: T.radius.card, ...o});
function rule(s, x, y, w, h = 0, o = {}) {
  s.addShape(pptx.ShapeType.line, {x, y, w, h, line: {color: C.hairline, width: .75, ...o}});
}
function dot(s, x, y, d, color, o = {}) {
  s.addShape(pptx.ShapeType.ellipse, {x, y, w: d, h: d, fill: {color, transparency: o.transparency || 0},
    line: o.line ? {color: o.line, width: o.lineWidth || 1} : {color, transparency: 100}});
}
function slide(n, bg, section, eyebrow, title, notes, titleW = CW) {
  const s = pptx.addSlide();
  s.background = {color: bg};
  latin(s, 'Aster', M, .36, 2, .3, {fontSize: 15, bold: true, objectName: 'chrome:brand'});
  caption(s, `${String(n).padStart(2, '0')}  ${section}`, W - M - 5, .36, 5, {align: 'right', fontSize: 10, h: .3, objectName: 'chrome:section'});
  text(s, 'DESIGN SYSTEM TEST · 가상 기업 · 가상 데이터', M, G.footerY, 7, .22, {fontSize: 10, color: C.muted, objectName: 'chrome:footer'});
  latin(s, `${String(n).padStart(2, '0')} / ${TOTAL}`, W - M - 1, G.footerY, 1, .22, {fontSize: 10, align: 'right', color: C.muted, objectName: 'chrome:page'});
  if (eyebrow) text(s, eyebrow, M, G.eyebrowY, CW, .3, {fontSize: 15, color: C.blue});
  if (title) heading(s, title, M, G.titleY, titleW, .7);
  s.addNotes(`[검증] ${notes}\n가상 기업 Aster와 모든 수치는 디자인 확인용 예시입니다. 디자인: design/feature-test/design.md`);
  return s;
}

// ── 01 Typography ───────────────────────────────────────────────────────
{
  const s = slide(1, C.white, 'TYPOGRAPHY', null, null,
    '글꼴 위계(54–11pt), 자간, 행간, 한 문단 안의 서식 혼합(굵게·색·밑줄·영문 글꼴·기울임).');
  latin(s, 'PPTX FEATURE TEST', M, 1.55, 6, .3, {fontSize: 13, bold: true, charSpacing: 2, color: C.blue});
  heading(s, '디자인 시스템\n기능 검증 샘플', M, 1.98, 6, 1.75, {fontSize: 48, lineSpacingMultiple: 1.05});
  text(s, '12가지 표현을 하나의 시스템으로\n일관되게 검증합니다.', M, 4.0, 6, .95, {fontSize: 20, color: C.muted, lineSpacingMultiple: 1.4});
  caption(s, 'RICH TEXT RUNS', M, 5.28, 6);
  text(s, [
    {text: '굵게  ', options: {bold: true}},
    {text: '강조색  ', options: {color: C.blue}},
    {text: '밑줄  ', options: {underline: {style: 'sng'}}},
    {text: 'Helvetica Neue  ', options: {fontFace: F.latin}},
    {text: 'Italic', options: {fontFace: F.latin, italic: true}},
  ], M, 5.62, 6, .4, {fontSize: 18});
  const rows = [['DISPLAY', 54, 'Aa 디자인', .92], ['TITLE', 36, '명확한 제목', .6], ['LEAD', 22, '핵심을 먼저 말합니다', .42],
    ['BODY', 18, '읽기 쉬운 본문 크기', .36], ['CAPTION', 11, 'CAPTION · 출처와 보조 설명', .24]];
  let y = 1.62;
  rows.forEach(([label, size, sample, h], i) => {
    caption(s, `${label}\n${size} pt`, 7.1, y + h / 2 - .22, 1.35, {fontSize: 10, charSpacing: 1, h: .44});
    const face = i === 0 ? F.heading : i < 2 ? F.heading : F.body;
    text(s, sample, 8.6, y, W - M - 8.6, h, {fontFace: face, fontSize: size, charSpacing: size > 30 ? -.4 : 0});
    if (i < rows.length - 1) rule(s, 7.1, y + h + .17, W - M - 7.1);
    y += h + .34;
  });
}

// ── 02 Shapes ───────────────────────────────────────────────────────────
{
  const s = slide(2, C.canvas, 'SHAPES', '기본 및 고급 도형', '도형은 모두 편집 가능한 개체입니다.',
    '프리셋 도형 12종: 기본(사각·라운드·원·삼각·마름모·화살표 선)과 고급(육각·쉐브론·도넛·블록 원호·별·화살표). 조절점(adj)은 기본값.');
  const S = pptx.ShapeType;
  const rows = [
    ['BASIC', 2.4, [['rect', '사각형'], ['roundRect', '라운드 사각형'], ['ellipse', '원'], ['triangle', '삼각형'], ['diamond', '마름모'], ['line', '화살표 선']]],
    ['ADVANCED', 4.55, [['hexagon', '육각형'], ['chevron', '쉐브론'], ['donut', '도넛'], ['blockArc', '블록 원호'], ['star5', '별'], ['rightArrow', '블록 화살표']]],
  ];
  const cw = (CW - 5 * G.gutter) / 6, d = .82;
  for (const [label, y0, shapes] of rows) {
    caption(s, label, M, y0, 3);
    shapes.forEach(([type, name], i) => {
      const x = M + i * (cw + G.gutter), ty = y0 + .38;
      card(s, x, ty, cw, 1.6, {radius: T.radius.tile});
      const sx = x + (cw - d) / 2, sy = ty + .2;
      if (type === 'line') {
        s.addShape(S.line, {x: sx, y: sy + d / 2, w: d, h: 0, line: {color: C.blue, width: 2.25, endArrowType: 'triangle'}});
      } else {
        s.addShape(S[type], {x: sx, y: sy, w: d, h: d, fill: {color: label === 'BASIC' ? C.blue : C.indigo},
          line: {color: C.white, transparency: 100}, rectRadius: type === 'roundRect' ? .16 : undefined});
      }
      text(s, name, x, ty + 1.17, cw, .28, {fontSize: 13, align: 'center', color: C.body});
    });
  }
}

// ── 03 Gradient, transparency, shadow ──────────────────────────────────
{
  const s = slide(3, C.canvas, 'EFFECTS', '그라데이션, 투명도, 그림자', '효과는 정해진 토큰 안에서만 씁니다.',
    '그라데이션은 XML 후처리(gradFill)로 적용: 선형 accent·soft, 방사형 glow. 투명도 35% 원 세 개의 겹침. 그림자 soft/lift 두 단계. AppKit 미리보기는 그라데이션을 단색으로 표시할 수 있음.');
  const cw = (CW - 2 * G.gutter) / 3, top = 2.45, vh = 2.95;
  const cols = [M, M + cw + G.gutter, M + 2 * (cw + G.gutter)];
  // Gradients
  {
    const x = cols[0];
    card(s, x, top, cw, 1.95, {fill: C.blue, name: 'grad:accent'});
    latin(s, 'LINEAR · 135°', x + .3, top + .25, cw - .6, .25, {fontSize: 11, charSpacing: 1.4, color: 'DCE6FA'});
    latin(s, 'Accent', x + .3, top + 1.1, cw - .6, .55, {fontSize: 32, bold: true, color: C.white});
    const hw = (cw - G.gutter) / 2;
    card(s, x, top + 2.2, hw, .75, {fill: C.white, name: 'grad:soft', line: C.hairline});
    latin(s, 'soft · 90°', x + .2, top + 2.45, hw - .4, .25, {fontSize: 12, color: C.muted});
    card(s, x + hw + G.gutter, top + 2.2, hw, .75, {fill: C.blue, name: 'grad:glow'});
    latin(s, 'radial', x + hw + G.gutter + .2, top + 2.45, hw - .4, .25, {fontSize: 12, color: C.white});
  }
  // Transparency
  {
    const x = cols[1];
    card(s, x, top, cw, vh);
    const cx = x + cw / 2, dd = 1.55;
    [[cx - .5, top + .25, C.blue], [cx + .5, top + .25, C.teal], [cx, top + 1.1, C.indigo]]
      .forEach(([px, py, c]) => dot(s, px - dd / 2, py, dd, c, {transparency: 35}));
  }
  // Shadows
  {
    const x = cols[2];
    [['soft', 'soft · blur 18 · 8%', top + .25], ['lift', 'lift · blur 28 · 14%', top + 1.6]].forEach(([k, label, y]) => {
      card(s, x + .25, y, cw - .5, 1.1, {shadow: k});
      latin(s, label, x + .55, y + .4, cw - 1.1, .3, {fontSize: 14, color: C.body});
    });
  }
  [['그라데이션', '선형·방사형 채우기를 XML로 적용'], ['투명도', '채우기 투명도 35% · 겹침 영역 확인'], ['그림자', '두 단계 토큰 · 카드에만 사용']]
    .forEach(([t, d], i) => {
      heading(s, t, cols[i], 5.65, cw, .4, {fontSize: 20});
      text(s, d, cols[i], 6.1, cw, .32, {fontSize: 14, color: C.muted});
    });
}

// ── 04 Cards & asymmetric layout ────────────────────────────────────────
{
  const s = slide(4, C.canvas, 'LAYOUT', '카드형 및 비대칭 레이아웃', '비대칭 그리드로 우선순위를 보여줍니다.',
    '7:4.6 비대칭 벤토 그리드. 큰 카드 1개(그림자 soft)와 우측 카드 2개, 간격 0.25in.');
  const top = G.contentTop, bh = G.contentBottom - top, lw = 7.0, rx = M + lw + G.gutter, rw = W - M - rx;
  const rh = (bh - G.gutter) / 2;
  card(s, M, top, lw, bh, {shadow: 'soft'});
  latin(s, 'VISION', M + .45, top + .45, 3, .25, {fontSize: 12, bold: true, charSpacing: 2, color: C.blue});
  heading(s, '고객의 하루를\n더 가볍게.', M + .45, top + .9, lw - .9, 1.5, {fontSize: 40, lineSpacingMultiple: 1.05});
  text(s, '복잡한 업무 흐름을 하나의 플랫폼으로 연결해\n팀이 본질적인 일에 집중하도록 돕습니다.', M + .45, top + 2.9, lw - .9, .85,
    {fontSize: 17, color: C.muted, lineSpacingMultiple: 1.4});
  card(s, rx, top, rw, rh, {fill: C.blue});
  latin(s, 'PLATFORM', rx + .35, top + .35, rw - .7, .25, {fontSize: 11, bold: true, charSpacing: 2, color: 'BFD6F2'});
  heading(s, '3개 사업부, 하나의 플랫폼', rx + .35, top + .78, rw - .7, .45, {fontSize: 20, color: C.white});
  text(s, 'ERP·CRM·물류 데이터를 통합', rx + .35, top + 1.33, rw - .7, .32, {fontSize: 14, color: 'DCE9F8'});
  card(s, rx, top + rh + G.gutter, rw, rh);
  latin(s, '24/7', rx + .35, top + rh + G.gutter + .3, rw - .7, .75, {fontSize: 44, bold: true});
  text(s, '글로벌 운영 지원', rx + .35, top + rh + G.gutter + 1.2, rw - .7, .35, {fontSize: 16, color: C.muted});
}

// ── 05 Image crop & masking ─────────────────────────────────────────────
{
  const s = slide(5, C.white, 'IMAGES', '이미지 크롭과 마스킹', '사진은 비율을 지키며 잘라 넣습니다.',
    'cover 크롭(srcRect), 영역 지정 crop, 원형(rounding)·라운드·육각형 마스크(XML 후처리 prstGeom). 사진은 생성한 자리표시자 이미지.');
  const L = A.photos.landscape, R = A.photos.architecture, top = G.contentTop;
  const lw = 6.35, lh = 3.9;
  s.addImage({path: L.path, x: M, y: top, w: lw, h: lw * L.h / L.w, objectName: `mask:roundRect:${T.radius.card}`,
    sizing: {type: 'cover', w: lw, h: lh}});
  text(s, 'cover 크롭 · 3:2 원본을 16:10 상자에 맞춤', M, 6.45, lw, .3, {fontSize: 13, color: C.muted});
  const rx = 7.4, rw = W - M - rx, d = 1.55, step = (rw - d) / 2;
  const masks = [['원형 마스크', R, {rounding: true}], ['라운드 마스크', L, {objectName: `mask:roundRect:${T.radius.card}`}], ['육각형 마스크', R, {objectName: 'mask:hexagon'}]];
  masks.forEach(([label, img, o], i) => {
    const x = rx + i * step, iw = d * img.w / img.h;
    s.addImage({path: img.path, x, y: top, w: iw, h: d, sizing: {type: 'cover', w: d, h: d}, ...o});
    text(s, label, x, top + d + .12, d, .3, {fontSize: 13, align: 'center', color: C.body});
  });
  const cy = 4.75, ch = 6.3 - cy, sw = 7.8;
  s.addImage({path: L.path, x: rx, y: cy, w: sw, h: sw * L.h / L.w, objectName: `mask:roundRect:${T.radius.tile}`,
    sizing: {type: 'crop', x: 2.3, y: 2.6, w: rw, h: ch}});
  text(s, 'crop · 원본의 지정 영역만 표시', rx, 6.45, rw, .3, {fontSize: 13, color: C.muted});
}

// ── 06 KPI dashboard ────────────────────────────────────────────────────
const monthly = {cats: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'],
  cur: [42, 45, 47, 50, 52, 55, 58, 61, 64], prev: [38, 40, 42, 44, 46, 48, 51, 53, 55]};
const sum = a => a.reduce((x, y) => x + y, 0);
{
  const s = slide(6, C.canvas, 'DASHBOARD', 'KPI 대시보드', '3분기 핵심 지표가 모두 목표를 넘었습니다.',
    'KPI 타일 4개, 네이티브 꺾은선 차트(월별 매출 2개 계열), 네이티브 도넛 차트. 누적 매출 = 월별 합계(474억, 전년 417억 대비 +13.7%).');
  const growth = ((sum(monthly.cur) / sum(monthly.prev) - 1) * 100).toFixed(1);
  const kpis = [['누적 매출', `${sum(monthly.cur)}억`, `▲ ${growth}%  전년 대비`], ['활성 고객', '128,400', '▲ 9.2%  전년 대비'],
    ['고객 유지율', '94.2%', '▲ 1.8%p  목표 92%'], ['NPS', '62', '▲ 7  목표 55']];
  const tw = (CW - 3 * G.gutter) / 4, top = G.contentTop;
  kpis.forEach(([label, value, delta], i) => {
    const x = M + i * (tw + G.gutter);
    card(s, x, top, tw, 1.55);
    text(s, label, x + .3, top + .22, tw - .6, .3, {fontSize: 14, color: C.muted});
    heading(s, value, x + .3, top + .58, tw - .6, .55, {fontSize: 32, charSpacing: -.5});
    text(s, delta, x + .3, top + 1.15, tw - .6, .25, {fontSize: 12, color: C.positive});
  });
  const by = 4.2, bh = G.contentBottom - by, lw = 7.4;
  card(s, M, by, lw, bh);
  text(s, '월별 매출 (억 원)', M + .3, by + .2, 4, .3, {fontSize: 14, color: C.body});
  s.addChart(pptx.ChartType.line, [
    {name: '2026', labels: monthly.cats, values: monthly.cur}, {name: '2025', labels: monthly.cats, values: monthly.prev}],
  {x: M + .15, y: by + .5, w: lw - .3, h: bh - .6, chartColors: [C.blue, 'B8C4D6'], lineSize: 2.25, lineDataSymbol: 'circle', lineDataSymbolSize: 6,
    catAxisLabelFontFace: F.body, valAxisLabelFontFace: F.latin, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
    catAxisLabelColor: C.muted, valAxisLabelColor: C.muted, valGridLine: {color: C.hairline, size: .5}, catAxisLineShow: false, valAxisLineShow: false,
    valAxisMinVal: 30, showLegend: true, legendPos: 't', legendFontFace: F.latin, legendFontSize: 10, legendColor: C.muted});
  const dx = M + lw + G.gutter, dw = W - M - dx;
  card(s, dx, by, dw, bh);
  text(s, '채널별 매출 비중', dx + .3, by + .2, 3, .3, {fontSize: 14, color: C.body});
  s.addChart(pptx.ChartType.doughnut, [{name: '채널', labels: ['직접 영업', '파트너', '온라인'], values: [48, 32, 20]}],
    {x: dx + .1, y: by + .5, w: dw - .2, h: bh - .6, holeSize: 62, chartColors: T.chart.slice(0, 3),
      showLegend: true, legendPos: 'r', legendFontFace: F.body, legendFontSize: 11, legendColor: C.body,
      showPercent: true, showValue: false, dataLabelColor: C.white, dataLabelFontFace: F.latin, dataLabelFontSize: 10});
}

// ── 07 Chart & table ────────────────────────────────────────────────────
{
  const s = slide(7, C.white, 'DATA', '차트 및 표', '차트와 표는 데이터째로 편집됩니다.',
    '네이티브 묶은 세로 막대 차트(3계열)와 표. 분기 합계는 6번 슬라이드 월별 매출과 일치(134·157·183억).');
  const Q = ['Q1', 'Q2', 'Q3'];
  const units = [['클라우드', [70, 82, 96]], ['데이터', [44, 52, 60]], ['컨설팅', [20, 23, 27]]];
  const totals = Q.map((_, i) => sum(units.map(u => u[1][i])));
  const top = G.contentTop, lw = 6.4;
  text(s, '사업부별 분기 매출 (억 원)', M, top, lw, .3, {fontSize: 14, color: C.body});
  s.addChart(pptx.ChartType.bar, units.map(([name, values]) => ({name, labels: Q, values})),
    {x: M, y: top + .4, w: lw, h: G.contentBottom - top - .4, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60,
      chartColors: T.chart.slice(0, 3), catAxisLabelFontFace: F.latin, valAxisLabelFontFace: F.latin,
      catAxisLabelFontSize: 11, valAxisLabelFontSize: 10, catAxisLabelColor: C.muted, valAxisLabelColor: C.muted,
      valGridLine: {color: C.hairline, size: .5}, catAxisLineShow: false, valAxisLineShow: false,
      showLegend: true, legendPos: 't', legendFontFace: F.body, legendFontSize: 11, legendColor: C.body,
      showValue: true, dataLabelFontFace: F.latin, dataLabelFontSize: 9, dataLabelColor: C.body, dataLabelPosition: 'outEnd'});
  const tx = M + lw + .35, tw = W - M - tx;
  text(s, '분기 요약', tx, top, tw, .3, {fontSize: 14, color: C.body});
  const none = {type: 'none'}, hair = {type: 'solid', pt: .75, color: C.hairline}, ink = {type: 'solid', pt: 1, color: C.ink};
  const cell = (t, o = {}) => ({text: String(t), options: {border: [none, none, hair, none], ...o}});
  const num = {align: 'right', fontFace: F.latin};
  const rows = [
    ['구분', ...Q].map((t, i) => cell(t, {bold: true, color: C.muted, fontSize: 12, border: [none, none, ink, none], ...(i ? num : {})})),
    ...units.map(([n, v]) => [cell(n), ...v.map(x => cell(x, num))]),
    [cell('합계', {bold: true}), ...totals.map(x => cell(x, {...num, bold: true, color: C.blue}))],
  ];
  s.addTable(rows, {x: tx, y: top + .4, w: tw, colW: [1.74, 1.15, 1.15, tw - 4.04], rowH: .48,
    fontFace: F.body, fontSize: 15, color: C.ink, valign: 'middle', margin: [0, .12, 0, .12]});
  text(s, '단위: 억 원 · 가상 데이터', tx, 5.4, tw, .25, {fontSize: 11, color: C.muted});
  const qoq = ((totals[2] / totals[1] - 1) * 100).toFixed(1);
  card(s, tx, 5.85, tw, G.contentBottom - 5.85, {fill: C.blueSoft});
  text(s, 'Q3 전 분기 대비', tx + .3, 5.85, 2.2, G.contentBottom - 5.85, {fontSize: 15, color: C.body});
  latin(s, `+${qoq}%`, tx + 2.6, 5.85, tw - 2.9, G.contentBottom - 5.85, {fontSize: 26, bold: true, color: C.blue, align: 'right'});
}

// ── 08 Process diagram ──────────────────────────────────────────────────
{
  const s = slide(8, C.white, 'PROCESS', '프로세스 다이어그램', '다섯 단계로 아이디어를 제품으로 만듭니다.',
    '홈플레이트 1개 + 쉐브론 4개, 단계별 명도 변화, 하단 피드백 루프(꺾은 연결선 + 화살표).');
  const steps = [['발견', '고객 인터뷰와\n데이터로 문제 탐색'], ['정의', '핵심 문제와\n성공 지표 합의'], ['설계', '프로토타입으로\n해법 검증'],
    ['구현', '2주 단위\n반복 개발'], ['측정', '지표 추적과\n회고']];
  const fills = ['DCE9F8', 'B9D4F2', '8DB9EA', '4F94DE', C.blue];
  const gap = .08, sw = (CW - 4 * gap) / 5, sy = 2.55, sh = 1.0;
  const centers = [];
  steps.forEach(([t, d], i) => {
    const x = M + i * (sw + gap);
    centers.push(x + sw / 2);
    s.addShape(i ? pptx.ShapeType.chevron : pptx.ShapeType.homePlate, {x, y: sy, w: sw, h: sh,
      fill: {color: fills[i]}, line: {color: fills[i], transparency: 100}});
    latin(s, String(i + 1).padStart(2, '0'), x + .45, sy, sw - .9, sh, {fontSize: 22, bold: true, align: 'center', color: i > 2 ? C.white : C.blue});
    heading(s, t, x + .1, 3.85, sw - .2, .4, {fontSize: 20});
    text(s, d, x + .1, 4.35, sw - .2, .85, {fontSize: 14, color: C.muted, lineSpacingMultiple: 1.4, valign: 'top'});
  });
  const loopY = 5.95, c0 = centers[0], c4 = centers[4];
  const L = {color: C.blue, width: 1.25};
  rule(s, c4, 5.45, 0, loopY - 5.45, L);
  rule(s, c0, loopY, c4 - c0, 0, L);
  rule(s, c0, 5.45, 0, loopY - 5.45, {...L, beginArrowType: 'triangle'});
  text(s, '측정 결과는 다음 사이클의 발견으로 돌아갑니다', c0, loopY + .12, c4 - c0, .3, {fontSize: 13, color: C.muted, align: 'center'});
}

// ── 09 System architecture ──────────────────────────────────────────────
{
  const s = slide(9, C.canvas, 'ARCHITECTURE', '시스템 아키텍처', '요청은 게이트웨이를 거쳐 서비스로 흐릅니다.',
    '4개 계층 열, 점선 VPC 경계, 화살표 연결선, 서비스→데이터 버스 배선. 박스는 모두 텍스트가 들어간 편집 가능 도형.');
  const cols = [[.72, 2.3, 'CLIENTS'], [3.65, 2.3, 'EDGE'], [6.58, 2.9, 'SERVICES'], [10.11, 2.5, 'DATA']];
  cols.forEach(([x, w, label]) => caption(s, label, x, G.contentTop, w));
  s.addShape(pptx.ShapeType.roundRect, {x: 3.45, y: 2.85, w: 6.23, h: 3.85, rectRadius: T.radius.card,
    fill: {color: C.white, transparency: 100}, line: {color: 'A9B6C8', width: 1, dashType: 'dash'}});
  latin(s, 'Aster Cloud · VPC', 3.65, 6.38, 3, .22, {fontSize: 10, color: C.muted});
  const node = (x, y, w, h, name, sub, o = {}) => {
    const dark = o.fill === C.blue;
    s.addText([{text: name, options: {fontFace: F.latin, bold: true, fontSize: 14, color: dark ? C.white : C.ink, breakLine: true}},
      {text: sub, options: {fontFace: F.body, fontSize: 11, color: dark ? 'DCE9F8' : C.muted}}],
    {x, y, w, h, shape: pptx.ShapeType.roundRect, rectRadius: .1, fill: {color: o.fill || C.white},
      line: dark ? {color: C.blue, transparency: 100} : {color: C.hairline, width: .75},
      align: 'center', valign: 'mid', margin: 0, paraSpaceAfterPt: 2, fit: 'none'});
  };
  const tall = [3.05, 4.2, 5.35], th = .85, svc = [3.05, 3.88, 4.71, 5.54], sh = .66;
  [['Web App', 'React'], ['Mobile', 'iOS · Android'], ['Partner API', 'REST · Webhook']].forEach(([a, b], i) => node(.72, tall[i], 2.3, th, a, b));
  node(3.65, 3.05, 2.3, svc[3] + sh - 3.05, 'API Gateway', '인증 · 라우팅 · 속도 제한', {fill: C.blue});
  [['Auth Service', 'OAuth 2.0'], ['Order Service', '주문 · 결제'], ['Billing', '정산 · 청구'], ['Notification', '메일 · 푸시']]
    .forEach(([a, b], i) => node(6.58, svc[i], 2.9, sh, a, b));
  [['PostgreSQL', '트랜잭션'], ['Redis', '세션 · 캐시'], ['Data Lake', '분석 · 리포트']].forEach(([a, b], i) => node(10.11, tall[i], 2.5, th, a, b));
  const wire = {color: '8E9AAB', width: 1}, arrow = {...wire, endArrowType: 'triangle'};
  tall.forEach(y => rule(s, 3.02, y + th / 2, 3.65 - 3.02, 0, arrow));
  svc.forEach(y => rule(s, 5.95, y + sh / 2, 6.58 - 5.95, 0, arrow));
  const bus = 9.82;
  svc.forEach(y => rule(s, 9.48, y + sh / 2, bus - 9.48, 0, wire));
  rule(s, bus, svc[0] + sh / 2, 0, svc[3] - svc[0], wire);
  tall.forEach(y => rule(s, bus, y + th / 2, 10.11 - bus, 0, arrow));
}

// ── 10 Timeline ─────────────────────────────────────────────────────────
{
  const s = slide(10, C.white, 'TIMELINE', '타임라인', '여섯 해 동안 쌓아 온 이정표.',
    '가로 축 + 6개 이정표를 위·아래로 교차 배치, 현재 시점은 링 마커로 구분.');
  const items = [['2021', '창업', '설립 · 시드 투자'], ['2022', '첫 제품', '클라우드 ERP 출시'], ['2023', '확장', '데이터 사업부 신설'],
    ['2024', '글로벌', '싱가포르 법인 설립'], ['2025', '통합', '3개 사업부 단일화'], ['2026', '현재', '고객 12만 명 돌파']];
  const axisY = 4.55, tw = 2.1, x0 = M + tw / 2, step = (CW - tw) / (items.length - 1);
  rule(s, M, axisY, CW, 0, {color: 'D2D2D7', width: 1.5});
  items.forEach(([yr, t, d], i) => {
    const px = x0 + i * step, up = i % 2 === 0, now = i === items.length - 1;
    if (now) dot(s, px - .19, axisY - .19, .38, C.white, {line: C.blue, lineWidth: 3});
    else dot(s, px - .11, axisY - .11, .22, C.blue);
    rule(s, px, up ? 3.98 : 4.75, 0, .4, {color: 'D2D2D7'});
    const y = up ? 2.55 : 5.2;
    latin(s, yr, px - tw / 2, y, tw, .45, {fontSize: 26, bold: true, align: 'center', color: now ? C.blue : C.ink});
    heading(s, t, px - tw / 2, y + .5, tw, .36, {fontSize: 17, align: 'center'});
    text(s, d, px - tw / 2, y + .9, tw, .28, {fontSize: 13, align: 'center', color: C.muted});
  });
}

// ── 11 SVG icons ────────────────────────────────────────────────────────
{
  const s = slide(11, C.canvas, 'ICONS', 'SVG 아이콘', '벡터 아이콘은 어떤 크기에서도 선명합니다.',
    'SVG 12종 × 2색(블루/화이트). 각 SVG에 256px PNG 대체 이미지를 함께 넣음(asvg:svgBlip). PowerPoint에서 "도형으로 변환" 가능.');
  const names = Object.keys(A.icons), cw = (CW - 5 * G.gutter) / 6, th = 1.3, isz = .6;
  names.forEach((n, i) => {
    const row = Math.floor(i / 6), x = M + (i % 6) * (cw + G.gutter), y = G.contentTop + row * (th + .25), dark = row === 1;
    card(s, x, y, cw, th, {radius: T.radius.tile, fill: dark ? C.blue : C.white});
    s.addImage({data: A.icons[n].variant(dark ? C.white : C.blue), x: x + (cw - isz) / 2, y: y + .2, w: isz, h: isz, objectName: `icon-${n}`});
    text(s, A.icons[n].label, x, y + .92, cw, .26, {fontSize: 12, align: 'center', color: dark ? C.white : C.body});
  });
  const cw3 = (CW - 2 * G.gutter) / 3;
  [['SVG 원본', 'Microsoft 365에서 벡터로 표시'], ['PNG 대체 이미지', 'SVG를 못 읽는 앱용 256px 래스터'], ['도형으로 변환', 'PowerPoint에서 선 색·두께 편집']]
    .forEach(([t, d], i) => {
      const x = M + i * (cw3 + G.gutter);
      rule(s, x, 5.6, cw3);
      heading(s, t, x, 5.8, cw3, .38, {fontSize: 18});
      text(s, d, x, 6.24, cw3, .3, {fontSize: 13, color: C.muted});
    });
}

// ── 12 Awards & people ──────────────────────────────────────────────────
{
  const s = slide(12, C.canvas, 'AWARDS', '시상식 및 인물 소개', awards.title,
    'input/awards_2026.json의 자리표시자 그대로 사용. 원형 사진 마스크, 카드 그림자. 사진 파일이 없으면 생성한 자리표시자 이미지 사용.', 6.5);
  text(s, `${awards.organization} · ${awards.date}`, W - M - 5, G.titleY, 5, .7, {fontSize: 15, color: C.muted, align: 'right'});
  const n = awards.recipients.length, cw = (CW - (n - 1) * G.gutter) / n, top = G.contentTop + .05, ch = G.contentBottom - top, d = 1.4;
  awards.recipients.forEach((r, i) => {
    const x = M + i * (cw + G.gutter);
    card(s, x, top, cw, ch, {shadow: 'soft'});
    const real = r.photo && fs.existsSync(path.join(root, r.photo));
    const ph = A.photos[`portrait${(i % 5) + 1}`];
    s.addImage({path: real ? path.join(root, r.photo) : ph.path, x: x + (cw - d) / 2, y: top + .35, w: d, h: d, rounding: true,
      sizing: real ? {type: 'cover', w: d, h: d} : undefined});
    text(s, r.award, x + .15, top + 2.0, cw - .3, .3, {fontSize: 14, color: C.blue, align: 'center'});
    heading(s, r.name, x + .15, top + 2.4, cw - .3, .45, {fontSize: 22, align: 'center'});
    text(s, `${r.role} · ${r.team}`, x + .15, top + 2.92, cw - .3, .28, {fontSize: 13, color: C.muted, align: 'center'});
    rule(s, x + .3, top + 3.45, cw - .6);
    text(s, real ? `PHOTO ${String(i + 1).padStart(2, '0')}` : `PHOTO ${String(i + 1).padStart(2, '0')} · 사진 교체`,
      x + .15, top + 3.62, cw - .3, .25, {fontSize: 10, color: C.muted, align: 'center'});
  });
}

(async () => {
  A.rasterize();
  const raw = await pptx.write({outputType: 'nodebuffer'});
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, await postprocess(raw, {gradients: T.gradients, svgPng: A.svgPng}));
  console.log(`wrote ${path.relative(root, OUT)}`);
})();
