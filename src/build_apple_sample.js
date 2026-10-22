/** Editable Apple-inspired sample. Run from the workspace with npm run build. */
const pptxgen = require('pptxgenjs');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const T = require('../design/apple/theme.json');
const C = T.colors;
const pptx = new pptxgen();
pptx.layout = T.layout;
pptx.author = 'PPT Workspace';
pptx.title = 'Focus — Apple Design Sample';
pptx.subject = 'Apple 기반 스타일과 macOS 기본 글꼴을 적용한 편집 가능한 샘플';
pptx.lang = 'ko-KR';
pptx.theme = {headFontFace:T.fonts.heading, bodyFontFace:T.fonts.body, lang:'ko-KR'};
const W=13.333333, H=7.5;
function text(s, value, x, y, w, h, o={}) {
  s.addText(value, {x,y,w,h,fontFace:T.fonts.body,fontSize:20,color:C.ink,
    margin:0,breakLine:false,valign:'mid',paraSpaceAfterPt:0,fit:'none',...o});
}
function heading(s,v,x,y,w,h,o={}) {
  text(s,v,x,y,w,h,{fontFace:T.fonts.heading,fontSize:44,charSpacing:-.3,...o});
}
function rect(s,x,y,w,h,fill,extra={}) {
  s.addShape(pptx.ShapeType.rect,{x,y,w,h,rectRadius:0,
    fill:{color:fill},line:{color:fill,transparency:100},...extra});
}
function rule(s,x,y,w,color=C.hairline) {
  s.addShape(pptx.ShapeType.line,{x,y,w,h:0,line:{color,width:.6}});
}
function dot(s,x,y,r,color) {
  s.addShape(pptx.ShapeType.ellipse,{x,y,w:r,h:r,line:{color,transparency:100},fill:{color}});
}
function slide(bg,section,n) {
  const s=pptx.addSlide(); s.background={color:bg};
  const dark=bg===C.dark;
  text(s,'Focus',.72,.36,2,.3,{fontFace:T.fonts.latin,fontSize:15,color:dark?C.white:C.ink});
  text(s,section,8.5,.38,4.1,.25,{fontFace:T.fonts.latin,fontSize:10,charSpacing:1.2,align:'right',color:dark?C.darkMuted:C.muted});
  text(s,'DESIGN CONCEPT · 가상 서비스 시안',.72,7.06,8,.22,{fontSize:10,color:dark?C.darkMuted:C.muted});
  text(s,String(n).padStart(2,'0'),11.9,7.06,.7,.22,{fontFace:T.fonts.latin,fontSize:10,align:'right',color:dark?C.darkMuted:C.muted});
  s.addNotes('가상의 집중 작업 앱 Focus를 주제로 한 디자인 샘플입니다. 실제 제품 성능이나 고객 데이터를 주장하지 않습니다. 텍스트와 UI는 편집 가능한 PowerPoint 개체입니다. 디자인: design/apple/ppt-design.md. 글꼴은 임베드하지 않습니다.');
  return s;
}
// A native, editable product concept; no external product photographs required.
function app(s,x,y,w,h,{dark=false,compact=false}={}) {
  const bg=dark?C.darkTile:C.white, ink=dark?C.white:C.ink;
  rect(s,x,y,w,h,bg,{line:{color:dark?'454547':C.hairline,width:.7,transparency:0}});
  const unit=w/9;
  rect(s,x,y,w,.43*unit,dark?'333335':C.pearl);
  [0,.16,.32].forEach(k=>dot(s,x+(.18+k)*unit,y+.16*unit,.085*unit,dark?'777779':'D2D2D7'));
  text(s,'Focus',x+w/2-.5*unit,y+.07*unit,unit,.25*unit,{fontFace:T.fonts.latin,fontSize:10*unit,align:'center',color:dark?C.darkMuted:C.muted});
  const sidebar=1.82*unit;
  rect(s,x,y+.43*unit,sidebar,h-.43*unit,dark?'303032':C.canvas);
  const labels=['오늘','모든 노트','프로젝트'];
  labels.forEach((v,i)=>text(s,v,x+.25*unit,y+(.83+i*.54)*unit,1.3*unit,.28*unit,{fontSize:12*unit,color:i===0?(dark?C.blueOnDark:C.blue):(dark?C.darkMuted:C.muted)}));
  const tx=x+sidebar+.46*unit, tw=w-sidebar-.92*unit;
  text(s,'오늘의 생각',tx,y+.82*unit,tw,.48*unit,{fontFace:T.fonts.heading,fontSize:24*unit,color:ink});
  text(s,'지금 중요한 일에 집중하세요.',tx,y+1.44*unit,tw,.33*unit,{fontSize:12*unit,color:dark?C.darkMuted:C.muted});
  const tasks=compact?['아이디어 정리','첫 번째 실행']:['아이디어 정리','가장 중요한 일 선택','첫 번째 실행'];
  tasks.forEach((v,i)=>{
    const yy=y+(2.08+i*.55)*unit;
    dot(s,tx,yy+.07*unit,.13*unit,i===0?(dark?C.blueOnDark:C.blue):(dark?'666668':'D2D2D7'));
    text(s,v,tx+.28*unit,yy,tw-.28*unit,.3*unit,{fontSize:13*unit,color:ink});
    if(i<tasks.length-1) rule(s,tx,yy+.41*unit,tw,dark?'454547':C.hairline);
  });
}
// 01 — Light hero with a large, editable product concept.
{
  const s=slide(C.white,'INTRODUCTION',1);
  heading(s,'더 적게. 더 선명하게.',.72,1.05,11.89,.9,{fontSize:50,align:'center'});
  text(s,'생각을 정리하고, 중요한 일에 집중하는 새로운 공간.',1,2.12,11.33,.45,{fontSize:22,align:'center',color:C.muted});
  app(s,2.17,3.04,9,3.62,{compact:true});
}
// 02 — A quiet dark interlude.
{
  const s=slide(C.dark,'PHILOSOPHY',2);
  text(s,'복잡함을 덜어내는 경험',.78,1.47,10,.4,{fontSize:20,color:C.blueOnDark});
  heading(s,'생각에 공간을.\n일상에 여유를.',.72,2.14,11.8,2.15,{fontSize:54,color:C.white,breakLine:false});
  text(s,'필요한 기능은 가까이에.\n중요한 내용은 가장 잘 보이는 곳에.',.78,5.05,10,1.3,{fontSize:23,color:C.darkMuted,lineSpacingMultiple:1.47});
}
// 03 — Flat utility cards with restrained typography.
{
  const s=slide(C.canvas,'EXPERIENCE',3);
  heading(s,'좋은 흐름은 단순합니다.',.72,1.18,11.9,.8,{fontSize:40});
  const cards=[['01','모으고','흩어진 생각을\n한곳에 담으세요.'],['02','고르고','지금 중요한 일을\n명확하게 선택하세요.'],['03','시작하고','작은 실행을\n자연스럽게 이어가세요.']];
  cards.forEach(([n,title,body],i)=>{
    const x=.72+i*4.08;
    rect(s,x,2.55,3.73,3.75,C.white);
    text(s,n,x+.34,2.9,3,.45,{fontFace:T.fonts.latin,fontSize:26,color:C.blue});
    heading(s,title,x+.34,3.72,3,.55,{fontSize:31});
    text(s,body,x+.34,4.65,3,1.12,{fontSize:21,color:C.muted,lineSpacingMultiple:1.47});
  });
}
// 04 — Text / product split.
{
  const s=slide(C.white,'WORKSPACE',4);
  text(s,'자연스러운 작업 공간',.72,1.62,5,.4,{fontSize:18,color:C.blue});
  heading(s,'열면 바로,\n이어지는 생각.',.72,2.33,5.1,1.6,{fontSize:39});
  text(s,'노트와 할 일을 한 화면에서.\n다음 행동이 자연스럽게 보입니다.',.76,4.53,5.05,1.12,{fontSize:21,color:C.muted,lineSpacingMultiple:1.47});
  app(s,6.26,1.94,6.34,3.94,{dark:true});
}
// 05 — A large central statement with a three-step flow.
{
  const s=slide(C.dark,'FOCUS',5);
  text(s,'오직 지금, 중요한 것에',1,1.34,11.33,.4,{fontSize:20,align:'center',color:C.blueOnDark});
  heading(s,'하나의 화면. 하나의 흐름.',.72,2.2,11.89,.94,{fontSize:45,align:'center',color:C.white});
  text(s,'생각을 남기는 순간부터, 실행을 마치는 순간까지.',1,3.53,11.33,.48,{fontSize:22,align:'center',color:C.darkMuted});
  const cols=[['기록','떠오른 생각을 담기'],['정리','중요한 일에 집중하기'],['실행','하나씩 완성하기']];
  cols.forEach(([a,b],i)=>{
    const x=.94+i*4.12;
    rule(s,x,5.02,3.2,'555557');
    heading(s,a,x,5.35,3.2,.45,{fontSize:25,color:C.white});
    text(s,b,x,6,3.2,.4,{fontSize:17,color:C.darkMuted});
  });
}
// 06 — Clear closing, ample whitespace.
{
  const s=slide(C.canvas,'NEXT',6);
  text(s,'Focus',1,1.56,11.33,.5,{fontFace:T.fonts.latin,fontSize:30,align:'center',color:C.blue});
  heading(s,'당신의 다음 생각을,\n가장 선명하게.',.72,2.45,11.89,1.9,{fontSize:49,align:'center'});
  text(s,'덜어낸 화면 위에서, 더 깊이 집중하세요.',1,5.11,11.33,.47,{fontSize:22,align:'center',color:C.muted});
}
fs.mkdirSync(path.join(root,'output'),{recursive:true});
pptx.writeFile({fileName:path.join(root,'output/apple_design_sample.pptx')});
