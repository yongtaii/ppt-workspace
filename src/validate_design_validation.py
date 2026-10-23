"""Validate actual OOXML features, all frame bounds, manifest alignment and text collisions."""
import json, re, sys, zipfile, posixpath, unicodedata
from pathlib import Path
import xml.etree.ElementTree as E

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/design_validation'
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','c':'http://schemas.openxmlformats.org/drawingml/2006/chart','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
EMU=914400
manifest=json.loads((OUT/'layout_manifest.json').read_text())
issues=[]; feature_checks=[]; frames=[]; alignment_checks=[]
def check(name,ok,details=''):
    feature_checks.append({'check':name,'passed':bool(ok),'details':details})
    if not ok: issues.append(name+': '+str(details))
def normalize(text):
    return re.sub(r'\s+','',unicodedata.normalize('NFKC',text)).replace('·','').replace('→','')
with zipfile.ZipFile(OUT/'form_design_validation_12.pptx') as z:
    check('ZIP CRC',z.testzip() is None)
    for part in z.namelist():
        if part.endswith(('.xml','.rels')): E.fromstring(z.read(part))
        if part.endswith('.rels'):
            base=posixpath.dirname(posixpath.dirname(part))
            for rel in E.fromstring(z.read(part)):
                if rel.get('TargetMode')=='External':continue
                target=posixpath.normpath(posixpath.join(base,rel.get('Target'))).lstrip('/')
                check('relationship '+part+' → '+target,target in z.namelist())
    presentation=E.fromstring(z.read('ppt/presentation.xml'))
    size=presentation.find('p:sldSz',NS);W=int(size.get('cx'))/EMU;H=int(size.get('cy'))/EMU
    check('16:9 canvas',abs(W/H-16/9)<1e-6,f'{W:.6f} × {H:.6f} in')
    pages=[E.fromstring(z.read(f'ppt/slides/slide{i}.xml')) for i in range(1,13)]
    check('12 slides',len(presentation.findall('p:sldIdLst/p:sldId',NS))==12)
    counts={'text':0,'shapes':0,'images':0,'charts':0,'tables':0,'connectors':0,'freeforms':0}
    for i,p in enumerate(pages,1):
        tree=p.find('p:cSld/p:spTree',NS)
        for obj in tree:
            kind=obj.tag.split('}')[-1]
            if kind not in ['sp','pic','graphicFrame','cxnSp','grpSp']: continue
            xf=obj.find('p:spPr/a:xfrm',NS) if kind!='graphicFrame' else obj.find('p:xfrm',NS)
            if xf is None:issues.append(f'Slide {i}: unmeasured {kind}');continue
            off=xf.find('a:off',NS); ext=xf.find('a:ext',NS)
            x,y,w,h=[int(el.get(key))/EMU for el,key in [(off,'x'),(off,'y'),(ext,'cx'),(ext,'cy')]]
            nv=obj.find('.//p:cNvPr',NS); name=nv.get('name') if nv is not None else kind
            frames.append({'slide':i,'name':name,'kind':kind,'x':x,'y':y,'w':w,'h':h})
            if min(x,y,w,h)<-.001 or x+w>W+.005 or y+h>H+.005:issues.append(f'Slide {i}: out of bounds {name}')
            if obj.find('p:txBody',NS) is not None:counts['text']+=1
            elif kind=='sp':counts['shapes']+=1
            if kind=='pic':counts['images']+=1
            if kind=='cxnSp':counts['connectors']+=1
            counts['charts']+=len(obj.findall('.//c:chart',NS))
            counts['tables']+=len(obj.findall('.//a:tbl',NS))
            counts['freeforms']+=len(obj.findall('.//a:custGeom',NS))
    check('native gradient',len(pages[1].findall('.//a:gradFill',NS))==1)
    check('native shadow',len(pages[1].findall('.//a:outerShdw',NS))==1)
    alpha=[a.get('val') for a in pages[1].findall('.//a:alpha',NS)]
    check('35% and 70% transparency','65000' in alpha and '30000' in alpha)
    crop=pages[3].findall('.//a:srcRect',NS)
    check('3 independently cropped pictures',len(crop)==3 and any(any(int(v)!=0 for v in e.attrib.values()) for e in crop))
    masks=[n.get('prst') for n in pages[3].findall('.//p:pic/p:spPr/a:prstGeom',NS)]
    check('ellipse and rounded-rectangle masks','ellipse' in masks and 'roundRect' in masks,masks)
    check('3 native editable charts',counts['charts']==3,counts['charts'])
    workbooks=[p for p in z.namelist() if p.startswith('ppt/embeddings/') and p.endswith('.xlsx')]
    check('3 embedded chart workbooks',len(workbooks)==3,workbooks)
    check('1 native table',counts['tables']==1)
    table=pages[6].find('.//a:tbl',NS)
    check('table grid is 5 × 3',len(table.findall('a:tr',NS))==5 and len(table.findall('a:tblGrid/a:gridCol',NS))==3)
    check('6 attached connectors',counts['connectors']==6)
    ids={e.get('id') for e in pages[8].findall('.//p:cNvPr',NS)}
    check('all connector endpoints resolve',all(e.get('id') in ids for e in pages[8].findall('.//a:stCxn',NS)+pages[8].findall('.//a:endCxn',NS)))
    check('6 editable vector icon geometries',counts['freeforms']==6)
    check('embedded SVG source',any(p.endswith('.svg') for p in z.namelist()))
    check('no slide flattened into one picture',all(len(p.findall('.//p:sp/p:txBody',NS))>5 for p in pages))
    for entry in manifest['slides']:
        objs=entry['objects'];by_name={o['name']:o for o in objs};texts=[o for o in objs if o['kind']=='text']
        for a_index,a in enumerate(texts):
            for b in texts[a_index+1:]:
                iw=min(a['x']+a['w'],b['x']+b['w'])-max(a['x'],b['x'])
                ih=min(a['y']+a['h'],b['y']+b['h'])-max(a['y'],b['y'])
                if iw>.02 and ih>.02:issues.append(f"Slide {entry['number']}: text collision {a['name']} / {b['name']}")
        for group in entry['alignmentGroups']:
            actual={o['name']:o for o in frames if o['slide']==entry['number']}
            values=[actual[n][group['axis']] for n in group['names']]
            delta=max(values)-min(values)
            alignment_checks.append({'slide':entry['number'],**group,'maxDeviationInches':delta,'passed':delta<.001})
            if delta>=.001:issues.append(f"Slide {entry['number']}: alignment {group}")
text_checks=[]
render=OUT/'png/render_report.json'
if render.exists():
    rendered=json.loads(render.read_text())
    for page,entry in zip(rendered['pages'],manifest['slides']):
        content=normalize(page['text'])
        for obj in [o for o in entry['objects'] if o['kind']=='text']:
            expected=normalize(obj['text']);ok=expected in content
            text_checks.append({'slide':entry['number'],'name':obj['name'],'text':obj['text'],'fullyPresentInPDF':ok})
            if not ok:issues.append(f"Slide {entry['number']}: text missing/truncated in PDF: {obj['text']}")
pdf=OUT/'form_design_validation_12.pdf'
font_names=sorted(set(v.decode() for v in re.findall(rb'/BaseFont\s*/([^\s/]+)',pdf.read_bytes()))) if pdf.exists() else []
report={'slides':12,'aspectRatio':'16:9','counts':counts,'nativeFeatureChecks':feature_checks,'alignmentChecks':alignment_checks,'frameCount':len(frames),'textCollisionScope':'All independently editable text frames; shapes containing labels and intended transparency overlaps excluded. Tables/charts checked by native structure and final render.','pdfTextChecks':text_checks,'pdfFontNames':font_names,'fontNotes':'PPTX fonts are not embedded. LibreOffice resolves the heading PostScript name to the installed Apple SD Gothic Neo family; output may differ from PowerPoint.','issues':issues,'status':'passed' if not issues else 'failed','rendering':'Native LibreOffice Impress → PDF → 1920×1080 PNG; separate from limited AppKit preview','notPerformed':['Microsoft PowerPoint open/render','Interactive editing in Microsoft PowerPoint']}
(OUT/'validation_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'status':report['status'],'counts':counts,'nativeChecks':len(feature_checks),'alignmentGroups':len(alignment_checks),'frames':len(frames),'pdfTextChecks':len(text_checks),'issues':issues},ensure_ascii=False,indent=2))
sys.exit(bool(issues))
