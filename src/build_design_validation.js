/** Twelve-slide, editable feature specimen. npm run build:validation */
const fs = require('node:fs');
const path = require('node:path');
const pptxgen = require('pptxgenjs');
const JSZip = require('jszip');
const root = path.resolve(__dirname, '..');
const T = require('../design/validation-system.json');
const D = require('../input/design_validation/data.json');
const C = T.colors, F = T.fonts, W = T.width, H = T.height;
const out = path.join(root, 'output/design_validation');
const assets = path.join(root, 'input/design_validation/assets');
fs.mkdirSync(out, { recursive: true });
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE'; pptx.author = 'PPT Workspace';
pptx.title = 'FORM — Enterprise Design Validation / 12';
pptx.subject = '편집 가능한 도형, 효과, 레이아웃, 이미지, 타이포그래피, 대시보드, 차트·표, 다이어그램, 아이콘, 시상식 검증';
pptx.lang = 'ko-KR'; pptx.company = 'FORM / Design Lab';
pptx.theme = { headFontFace: F.heading, bodyFontFace: F.body, lang: 'ko-KR' };
const S = pptx.ShapeType;
const manifest = { designSystem: T, notice: D.notice, slides: [] };
let seq = 0, m;
function record(kind, name, x,y,w,h, extra={}) { m.objects.push({kind,name,x,y,w,h,...extra}); }
function txt(s, value, x,y,w,h, options={}) {
  const name=options.objectName || `text-${++seq}`;
  const o={x,y,w,h,fontFace:F.body,fontSize:20,color:C.ink,margin:0,breakLine:false,
    valign:'mid',paraSpaceAfterPt:0,fit:'none',...options,objectName:name};
  s.addText(value,o);record('text',name,x,y,w,h,{text:typeof value==='string'?value:value.map(v=>v.text).join(''),fontSize:o.fontSize,fontFace:o.fontFace,bold:o.bold||false,lineSpacingMultiple:o.lineSpacingMultiple||1});
}
function title(s,v,x=.65,y=1.03,w=12.0,h=.65,o={}) {txt(s,v,x,y,w,h,{fontFace:F.heading,fontSize:34,charSpacing:-.35,...o});}
function cap(s,v,x,y,w=4,o={}) {txt(s,v,x,y,w,.25,{fontSize:11,color:C.muted,...o});}
function shape(s,type,x,y,w,h,fill=C.pale,o={}) {
  const name=o.objectName||`shape-${++seq}`;
  s.addShape(type,{x,y,w,h,fill:{color:fill},line:{color:fill,transparency:100},...o,objectName:name});
  record('shape',name,x,y,w,h,{geometry:type,container:type===S.rect||type===S.roundRect});
  return name;
}
function rect(s,x,y,w,h,c=C.canvas,o={}) {return shape(s,S.rect,x,y,w,h,c,o);}
function line(s,x1,y1,x2,y2,c=C.line,width=1,o={}) {
  const name=o.objectName||`line-${++seq}`;
  s.addShape(S.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,line:{color:c,width,...o},objectName:name});
  record('line',name,Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));
}
function dot(s,x,y,d,c=C.blue,o={}) {shape(s,S.ellipse,x,y,d,d,c,o);}
function label(s,v,x,y,w=4,o={}) {txt(s,v,x,y,w,Math.max(.3,(o.fontSize||14)*1.28/72),{fontSize:14,color:C.blue,...o});}
function slide(n,kicker,heading,description,features,bg=C.white) {
  const s=pptx.addSlide();s.background={color:bg};
  m={number:n,title:heading,section:kicker,features,objects:[],alignmentGroups:[]};manifest.slides.push(m);
  txt(s,'FORM',.65,.31,1.2,.28,{fontFace:F.latin,fontSize:15,bold:true,charSpacing:2});
  cap(s,`DESIGN LAB  /  ${kicker}`,7.6,.33,5.08,{fontFace:F.latin,align:'right',charSpacing:1.2,fontSize:10});
  if(heading)title(s,heading);
  if(description)txt(s,description,.67,1.83,11.9,.42,{fontSize:16,color:C.muted});
  line(s,.65,6.98,12.68,6.98,C.line,.6);
  cap(s,'ENTERPRISE DESIGN SYSTEM  ·  검증용 가상 콘텐츠',.65,7.12,9,{fontSize:10});
  cap(s,String(n).padStart(2,'0')+' / 12',11.5,7.12,1.18,{fontFace:F.latin,fontSize:10,align:'right'});
  s.addNotes(`${n}. ${heading}\n검증 항목: ${features.join(', ')}\n${D.notice}\n사용 글꼴: ${F.heading}, ${F.body}, ${F.latin}. 사진과 SVG는 독립 이미지 개체이며 사진 크롭/마스크를 유지합니다. 그 외 텍스트·도형·차트·표는 네이티브 편집 개체입니다.`);
  return s;
}
function chart(s,type,data,x,y,w,h,o={}) {
  const name=`chart-${++seq}`;
  s.addChart(type,data,{x,y,w,h,objectName:name,fontFace:F.latin,fontSize:12,
    chartColors:[C.blue,C.sky,'BBD5EE','DBE8F5'],showLegend:false,showTitle:false,
    showBorder:false,showCatName:false,showValue:false,
    catAxisLabelFontFace:F.latin,catAxisLabelFontSize:11,catAxisLabelColor:C.muted,
    catAxisLineShow:false,catAxisMajorTickMark:'none',catAxisMinorTickMark:'none',
    valAxisLabelFontFace:F.latin,valAxisLabelFontSize:10,valAxisLabelColor:C.muted,
    valAxisLineShow:false,valAxisMajorTickMark:'none',valAxisMinorTickMark:'none',
    valGridLine:{color:C.line,width:.5},catGridLine:{style:'none'},
    chartArea:{fill:{color:C.white},border:{color:C.white,transparency:100}},
    plotArea:{fill:{color:C.white},border:{color:C.white,transparency:100}},
    showMarker:false,showShadow:false,...o});record('chart',name,x,y,w,h,{type});
}
function photo(s,file,x,y,w,h,name,rounded=false) {
  const p=path.join(assets,file);
  const sourceAspect=file==='portrait.jpg'?1000/1258:1800/1202;
  s.addImage({path:p,x,y,w:sourceAspect*h,h,sizing:{type:'cover',w,h},objectName:name,altText:file==='portrait.jpg'?'가상 수상자 레이아웃에 사용한 스톡 인물 사진':'이미지 크롭 검증용 사무실 스톡 사진',rounding:rounded});
  record('image',name,x,y,w,h,{file,rounded});
}
function aligned(axis,names){m.alignmentGroups.push({axis,names});}
// 01 — Form language. Each specimen is a native adjustable PowerPoint shape.
{
  const s=slide(1,'SHAPE SYSTEM','','',['기본 도형','고급 도형','도형 조정 핸들','선과 채우기']);
  label(s,'01  /  FORM LANGUAGE',.65,1.15,5,{fontFace:F.latin,charSpacing:1.2});
  title(s,'아이디어를,\n정교한 형태로.',.62,1.89,5.35,1.65,{fontSize:43});
  txt(s,'기본 도형부터 복합 형태까지.\n같은 규칙으로 완성하는 시각 언어.',.67,3.98,5.0,1.05,{fontSize:20,color:C.muted,breakLine:false,lineSpacingMultiple:1.25});
  line(s,.67,5.53,5.15,5.53);
  txt(s,'12',.67,5.77,1.3,.66,{fontFace:F.latin,fontSize:38,color:C.blue});
  cap(s,'FEATURE TESTS',2.08,5.93,3,{fontFace:F.latin});
  const items=[[S.rect,'RECTANGLE'],[S.ellipse,'ELLIPSE'],[S.roundRect,'ROUND RECT'],[S.hexagon,'HEXAGON'],[S.chevron,'CHEVRON'],[S.diamond,'DIAMOND'],[S.donut,'DONUT'],[S.star5,'STAR'],[S.cloud,'CLOUD']];
  items.forEach(([type,name],i)=>{const x=6.08+(i%3)*2.22,y=1.22+Math.floor(i/3)*1.82;
    rect(s,x,y,2.04,1.62,C.canvas);shape(s,type,x+.62,y+.25,.8,.8,i===4?C.blue:i%2===0?C.ink:'A3C9EE',{radius:.15,objectName:`specimen-${name}`});
    cap(s,name,x+.12,y+1.21,1.8,{fontFace:F.latin,fontSize:9,align:'center'});
  });
}
// 02 — Actual editable OOXML gradient; transparency and shadow are native.
{
  const s=slide(2,'MATERIAL & LIGHT','빛과 깊이를, 절제된 방식으로.','그라데이션 · 투명도 · 외부 그림자를 각각 분리해 검증합니다.',['선형 그라데이션','투명도 0/35/70%','외부 그림자']);
  const xs=[.65,4.76,8.87];
  xs.forEach((x,i)=>rect(s,x,2.65,3.81,3.62,C.canvas,{objectName:`effect-panel-${i}`}));
  rect(s,.96,3.02,3.19,2.1,C.blue,{objectName:'FX_GRADIENT'});
  label(s,'Linear gradient',.97,5.43,3,{fontFace:F.latin,fontSize:18});
  cap(s,'0°  ·  BLUE → ICE',.97,5.94,3,{fontFace:F.latin});
  [0,35,70].forEach((a,i)=>dot(s,5.12+i*.82,3.54,1.38,C.blue,{fill:{color:C.blue,transparency:a},objectName:`opacity-${a}`}));
  label(s,'Transparency',5.08,5.43,3,{fontFace:F.latin,fontSize:18});
  cap(s,'0%  /  35%  /  70%',5.08,5.94,3,{fontFace:F.latin});
  rect(s,9.45,3.25,2.65,1.7,C.white,{shadow:{type:'outer',color:'1F3855',opacity:.18,blur:18,offset:7,angle:90},objectName:'FX_SHADOW'});
  txt(s,'Depth',9.45,3.82,2.65,.5,{fontFace:F.latin,fontSize:26,align:'center'});
  label(s,'Soft shadow',9.19,5.43,3,{fontFace:F.latin,fontSize:18});
  cap(s,'18% OPACITY  ·  18 pt BLUR',9.19,5.94,3,{fontFace:F.latin});
  aligned('y',['effect-panel-0','effect-panel-1','effect-panel-2']);
}
// 03 — An asymmetric editorial bento, with genuine editable panels and type.
{
  const s=slide(3,'LAYOUT COMPOSITION','정보의 무게에 따라, 화면의 균형도 다르게.','카드의 크기와 여백으로 우선순위를 만듭니다.',['카드 레이아웃','비대칭 그리드','컨테이너 내부 정렬']);
  rect(s,.65,2.55,6.65,3.94,C.blue,{objectName:'bento-primary'});
  cap(s,'THE BIG IDEA',1.02,2.93,5,{color:'C4E1FF',fontFace:F.latin,charSpacing:1});
  title(s,'덜어낼수록,\n핵심은 선명해집니다.',1.0,3.53,5.95,1.45,{fontSize:34,color:C.white});
  txt(s,'명확한 메시지 하나를 가장 넓은 면적에.',1.03,5.7,5.8,.4,{fontSize:17,color:'D8EBFF'});
  rect(s,7.55,2.55,5.13,1.68,C.pale,{objectName:'bento-metric'});
  txt(s,'70 / 30',7.9,2.87,3.9,.69,{fontFace:F.latin,fontSize:38,color:C.blue});
  cap(s,'면적 비율로 만드는 시각적 우선순위',7.94,3.66,4.35);
  rect(s,7.55,4.48,5.13,2.01,C.canvas,{objectName:'bento-editorial'});
  label(s,'A little more room.',7.93,4.84,4.2,{fontFace:F.latin,fontSize:22,color:C.ink});
  txt(s,'여백은 정보를 나누고,\n정렬은 정보를 연결합니다.',7.94,5.36,4.25,.78,{fontSize:18,color:C.muted});
  aligned('x',['bento-metric','bento-editorial']);
}
// 04 — All crops retain the original JPEG plus native srcRect and geometry.
{
  const s=slide(4,'IMAGE CROP & MASK','같은 이미지, 서로 다른 시선.','원본 사진을 유지한 채 비율과 마스크만 바꿉니다.',['직사각형 크롭','원형 마스크','둥근 모서리 마스크','원본 이미지 보존']);
  photo(s,'workspace.jpg',.65,2.7,5.3,3.12,'CROP_LANDSCAPE');
  photo(s,'workspace.jpg',6.35,2.7,2.7,2.7,'MASK_CIRCLE',true);
  photo(s,'workspace.jpg',9.46,2.7,3.22,3.12,'MASK_ROUNDED');
  label(s,'01  Landscape crop',.65,6.05,5.3,{fontFace:F.latin,fontSize:16,color:C.ink});
  label(s,'02  Circle mask',6.35,6.05,2.8,{fontFace:F.latin,fontSize:16,color:C.ink});
  label(s,'03  Rounded mask',9.46,6.05,3.22,{fontFace:F.latin,fontSize:16,color:C.ink});
  cap(s,'동일한 원본 · 독립적인 자르기 영역',.65,6.5,8);
  aligned('y',['CROP_LANDSCAPE','MASK_CIRCLE','MASK_ROUNDED']);
}
// 05 — Hierarchy, rich text, kerning and separate language font families.
{
  const s=slide(5,'TYPOGRAPHY','크기보다 먼저, 읽히는 순서를 설계합니다.','한글과 영문, 숫자를 하나의 타이포그래피 시스템으로 정렬합니다.',['한글·영문 글꼴','위계','리치 텍스트','자간','행간']);
  rect(s,.65,2.58,4.47,3.93,C.canvas);
  txt(s,'Aa',1.0,2.9,3.6,1.65,{fontFace:F.latin,fontSize:110,charSpacing:-3});
  txt(s,'가나다  012345',1.06,4.92,3.6,.6,{fontSize:25,charSpacing:-.2});
  cap(s,'APPLE SD GOTHIC NEO / HELVETICA NEUE',1.06,5.95,3.7,{fontSize:9,fontFace:F.latin});
  cap(s,'01 / DISPLAY  ·  38 pt',5.75,2.63,6,{fontFace:F.latin});
  txt(s,'Clarity creates impact.',5.75,3.0,6.8,.65,{fontFace:F.latin,fontSize:38,charSpacing:-.5});
  cap(s,'02 / BODY  ·  21 pt',5.75,4.06,6,{fontFace:F.latin});
  txt(s,[{text:'중요한 단어는 ',options:{color:C.ink}},{text:'색과 굵기',options:{color:C.blue,bold:true}},{text:'로 강조하고,\n본문은 짧고 명확하게 이어갑니다.',options:{color:C.ink}}],5.75,4.48,6.75,1.08,{fontSize:21,lineSpacingMultiple:1.25});
  cap(s,'03 / CAPTION  ·  11 pt  ·  선명한 정보 위계',5.75,6.12,6.7,{fontSize:11});
}
// 06 — The data, labels, line series and KPI cards all remain editable.
{
  const s=slide(6,'KPI DASHBOARD','핵심 성과를, 한 화면에.','2026 상반기 운영 현황  /  모든 수치는 검증용 가상 데이터입니다.',['KPI 카드','숫자 서식','네이티브 선 차트','범례','기준선']);
  D.kpis.forEach((k,i)=>{const x=.65+i*3.07;rect(s,x,2.55,2.82,1.49,C.canvas,{objectName:`kpi-${i}`});
    cap(s,k.label,x+.22,2.77,2.4,{fontSize:12});
    txt(s,k.value,x+.2,3.12,2.45,.52,{fontFace:F.latin,fontSize:30,bold:true});
    cap(s,k.change+'  '+k.note,x+.22,3.76,2.4,{color:C.blue,fontSize:10});});
  label(s,'반복 매출 추이',.65,4.38,4.6,{fontSize:18,color:C.ink});
  cap(s,'실적',6.05,4.41,.5,{color:C.blue});line(s,5.72,4.53,5.98,4.53,C.blue,2);
  cap(s,'목표',7.02,4.41,.5);line(s,6.69,4.53,6.95,4.53,'ADC2D8',1.5,{dashType:'dash'});
  chart(s,pptx.ChartType.line,[{name:'실적',labels:D.monthly.labels,values:D.monthly.revenue},{name:'목표',labels:D.monthly.labels,values:D.monthly.target}],.65,4.88,7.5,1.85,{chartColors:[C.blue,'ADC2D8'],lineSize:2.5,valAxisMinVal:0,valAxisMaxVal:50,valAxisMajorUnit:25,showMarker:true,markerSize:4,showLegend:false});
  rect(s,8.6,4.43,4.08,2.3,C.pale);
  cap(s,'PERFORMANCE NOTE',8.9,4.72,3.5,{fontFace:F.latin,color:C.blue});
  txt(s,'목표를 넘어서는\n지속적인 성장 흐름.',8.9,5.2,3.48,.86,{fontSize:23,fontFace:F.heading});
  cap(s,'6월 실적 42  /  목표 40  ·  단위: 천만 원',8.9,6.27,3.48,{fontSize:10});
  aligned('y',['kpi-0','kpi-1','kpi-2','kpi-3']);
}
// 07 — Chart objects contain embedded Excel workbooks; table is a real table.
{
  const s=slide(7,'CHARTS & TABLE','비교는 차트로, 세부는 표로.','차트 데이터와 표 셀을 직접 편집할 수 있습니다. 단위: 가상 지수.',['네이티브 막대 차트','네이티브 도넛 차트','내장 통합 문서','실제 표 셀']);
  label(s,'사업군별 성과 비교',.65,2.56,5.6,{fontSize:19,color:C.ink});
  dot(s,.67,3.13,.1,C.blue);cap(s,'현재',.85,3.05,.8);dot(s,1.62,3.13,.1,'BBD5EE');cap(s,'이전',1.8,3.05,.8);
  chart(s,pptx.ChartType.bar,[{name:'현재',labels:D.segments.labels,values:D.segments.current},{name:'이전',labels:D.segments.labels,values:D.segments.previous}],.6,3.6,6.06,2.9,{barDir:'col',catAxisLabelFontSize:10,barGapPct:90,chartColors:[C.blue,'BBD5EE'],valAxisMinVal:0,valAxisMaxVal:50,valAxisMajorUnit:25,showValue:true,dataLabelPosition:'outEnd',dataLabelColor:C.ink,dataLabelFormatCode:'0',dataLabelBkgrdColor:C.white,dataLabelFormatCodeSourceLinked:false,dataLabelColor:C.muted});
  chart(s,pptx.ChartType.doughnut,[{name:'구성',labels:D.segments.labels,values:D.segments.current}],7.17,2.6,2.1,1.83,{holeSize:76,showPercent:false,showLegend:false,showValue:false,showCatName:false,showBorder:false});
  txt(s,'100',7.65,3.11,1.1,.42,{fontFace:F.latin,fontSize:24,align:'center'});
  cap(s,'TOTAL',7.65,3.58,1.1,{fontFace:F.latin,fontSize:8,align:'center'});
  label(s,'사업 포트폴리오',9.65,2.91,3,{fontSize:18,color:C.ink});
  txt(s,'균형 있는 구성에서\n성장의 기반을 찾습니다.',9.65,3.41,3.0,.78,{fontSize:16,color:C.muted});
  const row=(v,head=false)=>v.map(text=>({text,options:{fill:head?C.pale:C.white,color:head?C.ink:C.muted,bold:head,fontFace:F.latin,fontSize:12,margin:8}}));
  const rows=[row(['SEGMENT','NOW','BEFORE'],true),...D.segments.labels.map((v,i)=>row([v,String(D.segments.current[i]),String(D.segments.previous[i])]))];
  s.addTable(rows,{x:7.1,y:4.76,w:5.58,h:1.8,colW:[2.9,1.34,1.34],rowH:.36,border:{type:'solid',color:C.line,pt:.5},margin:6,fontFace:F.latin,fontSize:12,autoPage:false,objectName:'DATA_TABLE'});
  record('table','DATA_TABLE',7.1,4.76,5.58,1.8,{rows:5,columns:3});
}
// 08 — Editable native chevrons, nodes and connectors.
{
  const s=slide(8,'PROCESS DIAGRAM','좋은 실행은, 명확한 단계에서 시작됩니다.','단계 · 산출물 · 책임을 함께 읽을 수 있는 프로세스입니다.',['셰브런 프로세스','연결선','단계별 산출물','다중 행 정렬']);
  const cols=[['01','Discover','문제를 정의합니다.','리서치 요약','Strategy'],['02','Design','해결 방식을 만듭니다.','프로토타입','Design'],['03','Build','핵심 경험을 구현합니다.','제품 증분','Engineering'],['04','Deliver','검증 후 전달합니다.','출시 리포트','Operations']];
  cols.forEach(([n,a,b,c,d],i)=>{const x=.65+i*3.08;
    shape(s,S.chevron,x,2.8,2.79,1.18,i===0?C.blue:C.pale,{objectName:`process-${i}`});
    txt(s,n,x+.65,3.0,1.7,.24,{fontFace:F.latin,fontSize:11,color:i===0?'CDE4FF':C.blue});
    txt(s,a,x+.65,3.34,1.85,.39,{fontFace:F.latin,fontSize:20,color:i===0?C.white:C.ink});
    if(i<3)line(s,x+2.81,3.39,x+3.04,3.39,C.line,1,{endArrowType:'triangle'});
    txt(s,b,x,4.36,2.85,.44,{fontSize:17,color:C.muted});
    line(s,x,5.17,x+2.5,5.17);
    cap(s,'OUTPUT',x,5.45,2.6,{fontFace:F.latin,fontSize:10});
    txt(s,c,x,5.89,2.85,.38,{fontSize:20});
    cap(s,d,x,6.49,2.8,{fontFace:F.latin,fontSize:11,color:C.blue});
  });
  aligned('y',['process-0','process-1','process-2','process-3']);
}
// 09 — Lines are converted to native attached connectors in postprocessing.
{
  const s=slide(9,'SYSTEM ARCHITECTURE','복잡한 시스템도, 구조는 명확하게.','클라이언트 · 서비스 · 데이터 계층을 분리한 개념 아키텍처입니다.',['계층형 구조','노드','화살표 연결선','네이티브 연결점']);
  const rows=[{y:2.55,label:'EXPERIENCE',items:['Web App','Mobile App','Admin Console']},{y:3.91,label:'SERVICES',items:['API Gateway','Core Services','Analytics']},{y:5.27,label:'DATA',items:['Identity Store','Operational DB','Data Warehouse']}];
  const pos={};
  rows.forEach((r,ri)=>{cap(s,r.label,.65,r.y+.26,1.7,{fontFace:F.latin,color:C.blue,fontSize:10});
    r.items.forEach((v,i)=>{const x=2.5+i*3.53,name=`arch-${ri}-${i}`;pos[name]={x,y:r.y,w:3.11,h:.86};rect(s,x,r.y,3.11,.86,ri===1?C.pale:C.canvas,{objectName:name});txt(s,v,x+.12,r.y+.22,2.87,.35,{fontFace:F.latin,fontSize:18,align:'center'});});});
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
    const a=`arch-${row}-${col}`,b=`arch-${row+1}-${col}`,p=pos[a],q=pos[b];
    line(s,p.x+p.w/2,p.y+p.h,p.x+p.w/2,q.y,C.blue,1.2,{beginArrowType:'none',endArrowType:'triangle',objectName:`CONNECT__${a}__${b}`});
  }
  cap(s,'↓  주요 데이터 흐름  ·  서비스 간 상세 통신은 생략한 검증용 구조입니다.',2.5,6.51,9.6,{fontSize:11});
  for(let row=0;row<3;row++)aligned('y',[0,1,2].map(i=>`arch-${row}-${i}`));
}
// 10 — Alternating timeline entries sit on common grid lines.
{
  const s=slide(10,'TIMELINE','발견에서 출시까지, 다섯 번의 이정표.','검증용 일정  /  2026년 1월–5월  /  단계별 승인 게이트',['타임라인','마일스톤','교차 배치','기간 막대']);
  line(s,1.15,4.22,10.91,4.22,C.line,2);
  D.timeline.forEach((v,i)=>{const x=1.15+i*2.44,top=i%2===0;
    dot(s,x-.08,4.14,.16,i===4?C.blue:C.ink,{objectName:`milestone-${i}`});
    line(s,x,top?3.8:4.3,x,top?4.14:4.64,C.line,1);
    cap(s,`2026 / ${v.month}`,x-.43,top?2.78:4.86,2.1,{fontFace:F.latin,color:C.blue});
    txt(s,v.title,x-.43,top?3.17:5.25,2.1,.43,{fontSize:24,fontFace:F.heading});
    cap(s,v.body,x-.43,top?3.68:5.78,2.1,{fontSize:12});
    if(top)cap(s,v.owner,x-.43,4.56,2.1,{fontFace:F.latin,fontSize:10});
    else cap(s,v.owner,x-.43,3.61,2.1,{fontFace:F.latin,fontSize:10});
  });
  rect(s,.72,6.36,11.96,.27,C.pale);
  rect(s,.72,6.36,7.18,.27,C.blue);
  cap(s,'PROGRAM ROADMAP  /  5 MONTHS',.72,6.75,9,{fontFace:F.latin,fontSize:9});
  aligned('y',D.timeline.map((_,i)=>`milestone-${i}`));
}
const iconPaths={
  shield:'M 24 5 L 39 11 L 39 24 Q 38 36 24 43 Q 10 36 9 24 L 9 11 Z M 17 24 L 22 29 L 32 18',
  bolt:'M 27 4 L 11 26 L 23 26 L 21 44 L 38 21 L 26 21 Z',
  layers:'M 24 6 L 43 16 L 24 26 L 5 16 Z M 5 24 L 24 34 L 43 24 M 5 32 L 24 42 L 43 32',
  chart:'M 8 6 L 8 40 L 42 40 M 15 31 L 23 23 L 29 27 L 40 13 M 32 13 L 40 13 L 40 21',
  globe:'M 24 5 A 19 19 0 1 1 23.99 5 M 5 24 L 43 24 M 24 5 C 12 13 12 35 24 43 C 36 35 36 13 24 5',
  grid:'M 7 7 L 20 7 L 20 20 L 7 20 Z M 28 7 L 41 7 L 41 20 L 28 20 Z M 7 28 L 20 28 L 20 41 L 7 41 Z M 28 28 L 41 28 L 41 41 L 28 41 Z'
};
// Icons in native custom geometry are editable shapes, plus one SVG specimen.
{
  const s=slide(11,'SVG & VECTOR ICONS','작은 디테일에도, 같은 시각 언어.','48 × 48 그리드 · 2 px 스트로크 · 일관된 끝점과 비례',['SVG 벡터 삽입','네이티브 자유형 도형','획 굵기','크기 변경']);
  const names=Object.keys(iconPaths),labels=['Security','Performance','Platform','Insights','Global','Workspace'];
  names.forEach((name,i)=>{const x=.65+i*2.055;
    rect(s,x,2.65,1.78,2.18,C.canvas);
    // Replace this placeholder's geometry with the original SVG path geometry.
    shape(s,S.rect,x+.4,3.04,.98,.98,C.white,{fill:{color:C.white,transparency:100},line:{color:C.blue,width:1.8,beginArrowType:'none',endArrowType:'none'},objectName:`VECTOR_${name}`});
    cap(s,labels[i],x,4.43,1.78,{fontFace:F.latin,fontSize:11,align:'center',color:C.ink});
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="${iconPaths[name]}" fill="none" stroke="#0066CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    fs.writeFileSync(path.join(assets,`${name}.svg`),svg);
  });
  const svg=fs.readFileSync(path.join(assets,'shield.svg'),'utf8');
  s.addImage({data:'image/svg+xml;base64,'+Buffer.from(svg).toString('base64'),x:.88,y:5.55,w:.6,h:.6,objectName:'SVG_SOURCE_SHIELD',altText:'실제 SVG 벡터 아이콘 원본'});
  record('image','SVG_SOURCE_SHIELD',.88,5.55,.6,.6,{format:'svg'});
  label(s,'벡터를 유지하고, 편집의 범위를 넓힙니다.',1.79,5.5,9.7,{fontSize:21,color:C.ink});
  cap(s,'위 6개: 편집 가능한 네이티브 자유형 도형  /  왼쪽: 별도 SVG 이미지 원본',1.79,6.03,10,{fontSize:12});
}
// 12 — Premium award card with a replaceable, masked portrait.
{
  const p=D.person;
  const s=slide(12,'AWARDS & PEOPLE','','',['시상식 레이아웃','인물 소개','사진 마스크','리본 도형'],C.white);
  rect(s,8.48,.84,4.2,5.88,C.goldPale);
  photo(s,'portrait.jpg',8.82,1.15,3.52,4.45,'AWARD_PORTRAIT');
  label(s,p.disclaimer,8.82,5.97,3.52,{fontSize:12,color:C.gold});
  cap(s,'FORM  /  ANNUAL EXCELLENCE 2026',.65,1.15,7.1,{fontFace:F.latin,color:C.gold,charSpacing:1});
  title(s,'좋은 경험을 만드는\n사람을 기리며.',.63,1.89,7.25,1.52,{fontSize:42});
  label(s,p.award,.67,3.81,7.0,{fontFace:F.latin,fontSize:21,color:C.gold});
  txt(s,p.name,.65,4.43,3.5,.73,{fontFace:F.heading,fontSize:38});
  txt(s,p.role,.68,5.24,6.8,.4,{fontFace:F.latin,fontSize:19,color:C.muted});
  line(s,.68,5.93,7.65,5.93,C.line,.7);
  txt(s,p.quote,.68,6.17,7.0,.4,{fontSize:20,color:C.ink});
  // A small native editable award medallion and ribbons.
  shape(s,S.chevron,11.7,5.09,.23,.65,C.gold,{rotate:90});
  dot(s,11.55,4.91,.53,C.gold);
  shape(s,S.star5,11.67,5.03,.29,.29,C.white);
}

// SVG paths converted to native DrawingML custom geometries, not bitmaps.
// Each path has a single 48×48 editing canvas. Explicit code preserves curves.
const nativePaths={
  shield:'<a:moveTo><a:pt x="24" y="5"/></a:moveTo><a:lnTo><a:pt x="39" y="11"/></a:lnTo><a:lnTo><a:pt x="39" y="24"/></a:lnTo><a:quadBezTo><a:pt x="38" y="36"/><a:pt x="24" y="43"/></a:quadBezTo><a:quadBezTo><a:pt x="10" y="36"/><a:pt x="9" y="24"/></a:quadBezTo><a:lnTo><a:pt x="9" y="11"/></a:lnTo><a:close/><a:moveTo><a:pt x="17" y="24"/></a:moveTo><a:lnTo><a:pt x="22" y="29"/></a:lnTo><a:lnTo><a:pt x="32" y="18"/></a:lnTo>',
  bolt:'<a:moveTo><a:pt x="27" y="4"/></a:moveTo>'+[[11,26],[23,26],[21,44],[38,21],[26,21]].map(([x,y])=>`<a:lnTo><a:pt x="${x}" y="${y}"/></a:lnTo>`).join('')+'<a:close/>',
  layers:[[[24,6],[43,16],[24,26],[5,16],[24,6]],[[5,24],[24,34],[43,24]],[[5,32],[24,42],[43,32]]],
  chart:[[[8,6],[8,40],[42,40]],[[15,31],[23,23],[29,27],[40,13]],[[32,13],[40,13],[40,21]]],
  globe:'<a:moveTo><a:pt x="24" y="5"/></a:moveTo><a:cubicBezTo><a:pt x="49" y="5"/><a:pt x="49" y="43"/><a:pt x="24" y="43"/></a:cubicBezTo><a:cubicBezTo><a:pt x="-1" y="43"/><a:pt x="-1" y="5"/><a:pt x="24" y="5"/></a:cubicBezTo><a:moveTo><a:pt x="5" y="24"/></a:moveTo><a:lnTo><a:pt x="43" y="24"/></a:lnTo><a:moveTo><a:pt x="24" y="5"/></a:moveTo><a:cubicBezTo><a:pt x="12" y="13"/><a:pt x="12" y="35"/><a:pt x="24" y="43"/></a:cubicBezTo><a:cubicBezTo><a:pt x="36" y="35"/><a:pt x="36" y="13"/><a:pt x="24" y="5"/></a:cubicBezTo>',
  grid:[[[7,7],[20,7],[20,20],[7,20],[7,7]],[[28,7],[41,7],[41,20],[28,20],[28,7]],[[7,28],[20,28],[20,41],[7,41],[7,28]],[[28,28],[41,28],[41,41],[28,41],[28,28]]]
};
function geom(key){let p=nativePaths[key];if(Array.isArray(p))p=p.map(points=>points.map(([x,y],i)=>`<a:${i?'lnTo':'moveTo'}><a:pt x="${x}" y="${y}"/></a:${i?'lnTo':'moveTo'}>`).join('')).join('');
  return `<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="48" b="48"/><a:pathLst><a:path w="48" h="48" fill="none" stroke="1" extrusionOk="0">${p}</a:path></a:pathLst></a:custGeom>`;}
async function main(){
  const bytes=await pptx.write({outputType:'nodebuffer'});const zip=await JSZip.loadAsync(bytes);
  for(let i=1;i<=12;i++){
    const p=`ppt/slides/slide${i}.xml`;let xml=await zip.file(p).async('string');
    xml=xml.replace(/<p:sp>.*?<\/p:sp>/gs,sp=>{
      if(sp.includes('name="FX_GRADIENT"'))sp=sp.replace(/<a:solidFill>.*?<\/a:solidFill>/s,'<a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="0066CC"/></a:gs><a:gs pos="52000"><a:srgbClr val="75B9F0"/></a:gs><a:gs pos="100000"><a:srgbClr val="E8F3FF"/></a:gs></a:gsLst><a:lin ang="0" scaled="1"/></a:gradFill>');
      const key=sp.match(/name="VECTOR_(\w+)"/);
      if(key)sp=sp.replace(/<a:prstGeom.*?<\/a:prstGeom>/s,geom(key[1]));
      return sp;
    });
    xml=xml.replace(/<p:pic>.*?<\/p:pic>/gs,pic=>pic.includes('name="MASK_ROUNDED"')||pic.includes('name="AWARD_PORTRAIT"')?pic.replace(/<a:prstGeom.*?<\/a:prstGeom>/s,'<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 5500"/></a:avLst></a:prstGeom>'):pic);
    if(i===9){const ids={};for(const match of xml.matchAll(/<p:cNvPr id="(\d+)" name="(arch-[^"]+)"[^>]*\/?\s*>/g))ids[match[2]]=match[1];
      xml=xml.replace(/<p:sp>.*?<\/p:sp>/gs,sp=>{const edge=sp.match(/name="CONNECT__(arch-\d-\d)__(arch-\d-\d)"/);if(!edge)return sp;
        return sp.replace('<p:sp>','<p:cxnSp>').replace('</p:sp>','</p:cxnSp>').replace('<p:nvSpPr>','<p:nvCxnSpPr>').replace('</p:nvSpPr>','</p:nvCxnSpPr>').replace(/<p:cNvSpPr[^>]*\/>/,`<p:cNvCxnSpPr><a:stCxn id="${ids[edge[1]]}" idx="2"/><a:endCxn id="${ids[edge[2]]}" idx="0"/></p:cNvCxnSpPr>`).replace(/<p:cNvSpPr.*?<\/p:cNvSpPr>/s,`<p:cNvCxnSpPr><a:stCxn id="${ids[edge[1]]}" idx="2"/><a:endCxn id="${ids[edge[2]]}" idx="0"/></p:cNvCxnSpPr>`).replace(/<p:txBody>.*?<\/p:txBody>/s,'');});
    }
    zip.file(p,xml);
  }
  const file=path.join(out,'form_design_validation_12.pptx');
  fs.writeFileSync(file,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
  fs.writeFileSync(path.join(out,'layout_manifest.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({file,slides:manifest.slides.length,editable:true,features:manifest.slides.map(s=>({slide:s.number,features:s.features}))},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
