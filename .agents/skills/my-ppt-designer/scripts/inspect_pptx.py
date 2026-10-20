"""Inspect any basic PPTX and prepare a model for the limited macOS previewer."""
import argparse
import json
import posixpath
import zipfile
import xml.etree.ElementTree as E
from pathlib import Path

NS = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
EMU = 12700

def find(e, p):
    return e.find(p, NS) if e is not None else None

def val(e, p, key, default=None):
    child = find(e, p)
    return child.get(key, default) if child is not None else default

def relationships(z, part):
    name = posixpath.join(posixpath.dirname(part), '_rels', posixpath.basename(part) + '.rels')
    if name not in z.namelist():
        return {}
    return {r.get('Id'): posixpath.normpath(posixpath.join(posixpath.dirname(part), r.get('Target')))
            for r in E.fromstring(z.read(name)) if r.get('TargetMode') != 'External'}

def inspect(pptx, out_dir, expected_slides=None):
    out_dir.mkdir(parents=True, exist_ok=True)
    model = {'slides': []}
    issues, limitations = [], []
    counts = {'text': 0, 'shape': 0, 'image': 0}
    with zipfile.ZipFile(pptx) as z:
        bad = z.testzip()
        if bad:
            raise ValueError('ZIP CRC error: ' + bad)
        for name in z.namelist():
            if name.endswith(('.xml', '.rels')):
                E.fromstring(z.read(name))
        pres_part = 'ppt/presentation.xml'
        pres = E.fromstring(z.read(pres_part))
        size = find(pres, 'p:sldSz')
        model.update(width=int(size.get('cx')) / EMU, height=int(size.get('cy')) / EMU)
        pres_rels = relationships(z, pres_part)
        files = [pres_rels[s.get('{' + NS['r'] + '}id')] for s in find(pres, 'p:sldIdLst')]
        if not files:
            raise ValueError('Presentation has no slides')
        if expected_slides is not None and len(files) != expected_slides:
            issues.append(f'Expected {expected_slides} slides, got {len(files)}')
        theme_names = sorted(n for n in z.namelist() if n.startswith('ppt/theme/') and n.endswith('.xml'))
        theme = E.fromstring(z.read(theme_names[0])) if theme_names else None
        scheme = {}
        scheme_el = find(theme, 'a:themeElements/a:clrScheme')
        if scheme_el is not None:
            for el in scheme_el:
                if len(el):
                    scheme[el.tag.split('}')[-1]] = el[0].get('val') if el[0].tag.endswith('srgbClr') else el[0].get('lastClr')
        aliases = {'bg1': 'lt1', 'bg2': 'lt2', 'tx1': 'dk1', 'tx2': 'dk2'}

        def paint(e, path):
            fill = find(e, path + '/a:solidFill')
            if fill is None or not len(fill):
                return None
            c = fill[0]
            kind = c.tag.split('}')[-1]
            if kind == 'srgbClr':
                color = c.get('val')
            elif kind == 'schemeClr':
                key = c.get('val'); color = scheme.get(aliases.get(key, key))
            elif kind == 'sysClr':
                color = c.get('lastClr')
            else:
                color = None
            if not color:
                limitations.append('Unsupported color or missing theme color'); return None
            return {'color': color, 'alpha': float(val(c, 'a:alpha', 'val', '100000')) / 100000}

        def background(part, visited=None):
            visited = visited or set()
            if part in visited:
                return 'FFFFFF'
            visited.add(part)
            tree = E.fromstring(z.read(part))
            color = paint(tree, 'p:cSld/p:bg/p:bgPr')
            if color:
                return color['color']
            if find(tree, 'p:cSld/p:bg/p:bgRef') is not None:
                limitations.append('Background style references are approximated as white')
            for target in relationships(z, part).values():
                if '/slideLayouts/' in target or '/slideMasters/' in target:
                    return background(target, visited)
            return 'FFFFFF'

        for index, name in enumerate(files, 1):
            tree = E.fromstring(z.read(name))
            slide = {'number': index, 'background': background(name), 'objects': []}
            boxes = []
            if find(tree, 'p:timing') is not None:
                limitations.append(f'Slide {index}: animations are not rendered')
            for sp in find(tree, 'p:cSld/p:spTree'):
                tag = sp.tag.split('}')[-1]
                if tag in ('nvGrpSpPr', 'grpSpPr'):
                    continue
                if tag not in ('sp', 'pic'):
                    limitations.append(f'Slide {index}: unsupported object {tag}'); continue
                xf = find(sp, 'p:spPr/a:xfrm')
                if xf is None:
                    limitations.append(f'Slide {index}: inherited position is not resolved'); continue
                if xf.get('rot') or xf.get('flipH') or xf.get('flipV'):
                    limitations.append(f'Slide {index}: rotation/flip is approximated')
                o = {k: int(val(xf, p, a, '0')) / EMU for k, p, a in
                     [('x', 'a:off', 'x'), ('y', 'a:off', 'y'), ('w', 'a:ext', 'cx'), ('h', 'a:ext', 'cy')]}
                o['name'] = val(sp, 'p:nvSpPr/p:cNvPr', 'name', val(sp, 'p:nvPicPr/p:cNvPr', 'name', ''))
                if o['x'] < -.1 or o['y'] < -.1 or o['x'] + o['w'] > model['width'] + .1 or o['y'] + o['h'] > model['height'] + .1:
                    issues.append(f'Slide {index}: out of bounds {o["name"]}')
                tb = find(sp, 'p:txBody')
                if tb is not None:
                    o.update(kind='text', paragraphs=[], anchor=val(tb, 'a:bodyPr', 'anchor', 't'))
                    body = find(tb, 'a:bodyPr')
                    o['insets'] = {k: int(body.get(k, d)) / EMU for k, d in
                                   [('lIns', '91440'), ('rIns', '91440'), ('tIns', '45720'), ('bIns', '45720')]}
                    for para in tb.findall('a:p', NS):
                        p = {'align': val(para, 'a:pPr', 'algn', 'l'), 'runs': [],
                             'lineMultiplier': float(val(para, 'a:pPr/a:lnSpc/a:spcPct', 'val', '100000')) / 100000}
                        if find(para, 'a:pPr/a:buChar') is not None:
                            limitations.append(f'Slide {index}: bullet indentation is approximated')
                        for r in para:
                            rtag = r.tag.split('}')[-1]
                            if rtag == 'br':
                                p['runs'].append({'text': '\n', 'size': 18, 'font': 'Arial', 'color': '292722', 'spacing': 0, 'bold': False})
                                continue
                            if rtag not in ('r', 'fld'):
                                continue
                            rp, t = find(r, 'a:rPr'), find(r, 'a:t')
                            if t is None:
                                continue
                            if rp is None:
                                rp = E.Element('rPr')
                                limitations.append(f'Slide {index}: inherited text style is approximated')
                            clr = paint(r, 'a:rPr')
                            p['runs'].append({'text': t.text or '', 'size': float(rp.get('sz', '1800')) / 100,
                                              'spacing': float(rp.get('spc', '0')) / 100, 'bold': rp.get('b') == '1',
                                              'font': val(rp, 'a:latin', 'typeface', 'Arial'),
                                              'color': clr['color'] if clr else '292722'})
                        o['paragraphs'].append(p)
                    boxes.append(o)
                elif tag == 'pic':
                    o['kind'] = 'image'
                    rid = val(sp, 'p:blipFill/a:blip', '{' + NS['r'] + '}embed')
                    target = relationships(z, name).get(rid)
                    if not target:
                        limitations.append(f'Slide {index}: linked image is not rendered'); continue
                    image_file = out_dir / Path(target).name
                    image_file.write_bytes(z.read(target)); o['path'] = str(image_file.resolve())
                    crop = find(sp, 'p:blipFill/a:srcRect')
                    if crop is not None:
                        o['crop'] = {k: int(crop.get(k, '0')) / 100000 for k in ['l', 'r', 't', 'b']}
                else:
                    o.update(kind='shape', type=val(sp, 'p:spPr/a:prstGeom', 'prst', 'custom'),
                             fill=paint(sp, 'p:spPr'), stroke=paint(sp, 'p:spPr/a:ln'),
                             lineWidth=float(val(sp, 'p:spPr/a:ln', 'w', '0')) / EMU)
                    if o['type'] not in ('rect', 'ellipse', 'diamond', 'line'):
                        limitations.append(f'Slide {index}: shape {o["type"]} approximated as rectangle')
                counts[o['kind']] += 1
                slide['objects'].append(o)
            for i, a in enumerate(boxes):
                for b in boxes[i + 1:]:
                    iw = min(a['x'] + a['w'], b['x'] + b['w']) - max(a['x'], b['x'])
                    ih = min(a['y'] + a['h'], b['y'] + b['h']) - max(a['y'], b['y'])
                    if iw > .5 and ih > .5:
                        issues.append(f'Slide {index}: text overlap: {a["name"]} / {b["name"]}')
            model['slides'].append(slide)
    limitations = sorted(set(limitations))
    model['previewLimitations'] = limitations
    report = {'input': str(pptx), 'slides': len(model['slides']),
              'aspectRatio': round(model['width'] / model['height'], 6), 'editableObjects': counts,
              'packageIntegrity': 'ZIP CRC and XML parsing passed', 'structuralIssues': issues,
              'previewLimitations': limitations, 'renderer': 'macOS AppKit OOXML preview; not PowerPoint or LibreOffice'}
    for name, value in [('render_model.json', model), ('structural_report.json', report)]:
        (out_dir / name).write_text(json.dumps(value, ensure_ascii=False, indent=2))
    return report

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pptx', type=Path)
    parser.add_argument('--out-dir', type=Path)
    parser.add_argument('--expected-slides', type=int)
    args = parser.parse_args()
    source = args.pptx.resolve()
    dest = (args.out_dir or source.parent / (source.stem + '-preview')).resolve()
    report = inspect(source, dest, args.expected_slides)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return int(bool(report['structuralIssues']))

if __name__ == '__main__':
    raise SystemExit(main())
