/**
 * OOXML post-processing for features PptxGenJS cannot write directly.
 * Objects opt in through their objectName:
 *   grad:<key>            shape fill → <a:gradFill> from gradients[key]
 *   mask:<preset>[:<r>]   picture geometry → preset (roundRect radius r inches, hexagon, ...)
 * SVG images also get a real PNG fallback (PptxGenJS on Node writes a broken one).
 */
const JSZip = require('jszip');
const EMU = 914400;

function gradFill({angle = 90, radial = false, stops}) {
  const gs = stops.map(([c, pos]) => `<a:gs pos="${pos * 1000}"><a:srgbClr val="${c}"/></a:gs>`).join('');
  const shade = radial
    ? '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>'
    : `<a:lin ang="${Math.round(((angle - 90 + 360) % 360) * 60000)}" scaled="0"/>`;
  return `<a:gradFill rotWithShape="1"><a:gsLst>${gs}</a:gsLst>${shade}</a:gradFill>`;
}

// CSS-style angles: 90 = left→right, 180 = top→bottom (OOXML 0 = left→right).
function applyGradients(xml, gradients) {
  return xml.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, sp => {
    const m = sp.match(/name="grad:([\w-]+)"/);
    if (!m) return sp;
    if (!gradients[m[1]]) throw new Error(`unknown gradient: ${m[1]}`);
    return sp.replace(/(<p:spPr>[\s\S]*?)<a:solidFill>[\s\S]*?<\/a:solidFill>/, `$1${gradFill(gradients[m[1]])}`);
  });
}

function applyMasks(xml) {
  return xml.replace(/<p:pic>[\s\S]*?<\/p:pic>/g, pic => {
    const m = pic.match(/name="mask:(\w+)(?::([\d.]+))?"/);
    if (!m) return pic;
    let av = '<a:avLst/>';
    if (m[1] === 'roundRect' && m[2]) {
      const ext = pic.match(/<a:ext cx="(\d+)" cy="(\d+)"/);
      const min = Math.min(+ext[1], +ext[2]);
      av = `<a:avLst><a:gd name="adj" fmla="val ${Math.round(parseFloat(m[2]) * EMU * 100000 / min)}"/></a:avLst>`;
    }
    return pic.replace(/<a:prstGeom prst="\w+"><a:avLst\/><\/a:prstGeom>/, `<a:prstGeom prst="${m[1]}">${av}</a:prstGeom>`);
  });
}

/** svgPng: (svgText) => Buffer of the PNG to use as that SVG's fallback. */
async function postprocess(buffer, {gradients = {}, svgPng} = {}) {
  const zip = await JSZip.loadAsync(buffer);
  for (const name of Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    const xml = await zip.file(name).async('string');
    zip.file(name, applyMasks(applyGradients(xml, gradients)));
  }
  if (svgPng) {
    // PptxGenJS stores each SVG as image-S-N.svg with its fallback at image-S-(N-1).png.
    for (const name of Object.keys(zip.files).filter(n => /^ppt\/media\/image-\d+-\d+\.svg$/.test(n))) {
      const [, s, n] = name.match(/image-(\d+)-(\d+)\.svg$/);
      const png = `ppt/media/image-${s}-${n - 1}.png`;
      if (!zip.file(png)) throw new Error(`missing SVG fallback slot: ${png}`);
      zip.file(png, svgPng(await zip.file(name).async('string')));
    }
  }
  return zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE'});
}

module.exports = {postprocess, gradFill};
