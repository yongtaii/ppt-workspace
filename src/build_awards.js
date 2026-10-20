/** Build: npm run build. Content and photo paths: input/awards_2026.json. */
const pptxgen = require('pptxgenjs');
const fs = require('node:fs');
const path = require('node:path');
const {parseArgs} = require('node:util');
const {values: cli} = parseArgs({options: {output: {type: 'string'}}});
let ROOT = __dirname;
while (!fs.existsSync(path.join(ROOT, 'package.json'))) {
  const parent = path.dirname(ROOT);
  if (parent === ROOT) throw new Error('프로젝트 package.json을 찾을 수 없습니다.');
  ROOT = parent;
}
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'input/awards_2026.json'), 'utf8'));
if (data.recipients.length !== 5) throw new Error('수상자는 정확히 5명이어야 합니다.');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = data.organization;
pptx.subject = '2026년 10월 서비스플랫폼담당 우수직원 포상';
pptx.title = `${data.date} EMPLOYEE AWARDS`;
pptx.company = data.organization;
pptx.lang = 'ko-KR';
pptx.theme = {headFontFace:'Apple SD Gothic Neo',bodyFontFace:'Apple SD Gothic Neo',lang:'ko-KR'};
pptx.defineSlideMaster({title:'IVORY',background:{color:'F7F4EC'},objects:[]});
const C = {ivory:'F7F4EC',ink:'292722',gold:'A38A55',lightGold:'D6C7A6',line:'D7CDBA',muted:'777064',photo:'ECE7DC',silhouette:'DCD5C6'};
const W = 13.333333, H = 7.5;
const manifest = [];
let objects;
function slide(section, n) {
  const s = pptx.addSlide('IVORY'); objects=[]; manifest.push({slide:n,section,background:C.ivory,objects});
  text(s,data.organization,.72,.35,5,.27,{fontSize:11,color:C.muted});
  text(s,'EMPLOYEE AWARDS  /  OCTOBER 2026',7.0,.35,5.6,.27,{fontFace:'Avenir Next',fontSize:9.5,charSpacing:1.2,align:'right',color:C.muted});
  line(s,.72,6.97,11.89,0,C.line,.6);
  text(s,'2026.10  ·  '+data.organization,.72,7.08,8,.2,{fontSize:9,color:C.muted});
  text(s,String(n).padStart(2,'0')+' / 08',11.7,7.08,.9,.2,{fontFace:'Avenir Next',fontSize:9,align:'right',color:C.muted});
  return s;
}
function text(s,value,x,y,w,h,opts={}) {
  const o={x,y,w,h,fontFace:'Apple SD Gothic Neo',fontSize:18,color:C.ink,margin:0,breakLine:false,paraSpaceAfterPt:0,vertAnchor:'ctr',valign:'mid',fit:'none',...opts};
  s.addText(value,o); objects.push({kind:'text',text:value,...o});
}
function shape(s,type,x,y,w,h,fill,lineColor=C.line,lineWidth=.7,extra={}) {
  const opts={x,y,w,h,line:{color:lineColor,width:lineWidth,transparency:lineWidth===0?100:0},fill:{color:fill||C.ivory,transparency:fill?0:100},...extra};
  s.addShape(type,opts); objects.push({kind:'shape',type,...opts});
}
function line(s,x,y,w,h=0,color=C.gold,width=.8) {shape(s,'line',x,y,w,h,null,color,width);}
function ornament(s,cx,y,scale=1) {
  line(s,cx-.8*scale,y,.58*scale,0,C.lightGold,.65);
  shape(s,'diamond',cx-.065*scale,y-.065*scale,.13*scale,.13*scale,C.gold,C.gold,0);
  line(s,cx+.22*scale,y,.58*scale,0,C.lightGold,.65);
}
function photo(s,r,i,x,y,w,h) {
  let imagePath=path.resolve(ROOT,r.photo || `input/recipient_${String(i).padStart(2,'0')}.jpg`);
  if (!fs.existsSync(imagePath)) {
    const stem=imagePath.replace(/\.[^.]+$/,'');
    imagePath=['.jpg','.jpeg','.png'].map(ext=>stem+ext).find(p=>fs.existsSync(p));
  }
  if(imagePath) {
    s.addImage({path:imagePath,...pptxgen.imageSizingCrop(imagePath,x,y,w,h),objectName:`수상자 ${i} 사진 — 그림 변경`});
    objects.push({kind:'image',path:imagePath,x,y,w,h});
  } else {
    shape(s,'rect',x,y,w,h,C.photo,C.photo,0,{objectName:`수상자 ${i} 사진 영역`});
    // All placeholder components remain individually editable PowerPoint shapes.
    const size=w*.23, cy=y+h*.40;
    shape(s,'ellipse',x+w/2-size/2,cy-size/2,size,size,C.silhouette,C.silhouette,0);
    shape(s,'ellipse',x+w*.23,cy+size*.65,w*.54,h*.25,C.silhouette,C.silhouette,0);
    text(s,'PHOTO '+String(i).padStart(2,'0'),x+.12,y+h-.68,w-.24,.28,{fontFace:'Avenir Next',fontSize:w<3?11:13,color:C.muted,charSpacing:1.4,align:'center'});
    text(s,'[사진 교체]',x+.12,y+h-.38,w-.24,.23,{fontSize:w<3?10:11,color:C.muted,align:'center'});
  }
}
function note(s,body) {s.addNotes(`${body}\n콘텐츠: input/awards_2026.json. 사진: input/recipient_01.jpg ~ recipient_05.jpg (PNG/JPEG도 지원). 사진이 없으면 표시되는 도형 영역을 선택해 삭제하고 사진을 삽입하거나, input에 사진을 넣고 재생성하세요. 대괄호 항목과 수상 사유는 실제 자료로 교체하세요.`);}
// 01 — ceremony cover
{
 const s=slide('TITLE',1);
 shape(s,'rect',.72,1.02,11.89,5.55,null,C.lightGold,.7);
 ornament(s,W/2,1.55,1.1);
 text(s,data.date,2.0,1.89,9.33,.42,{fontFace:'Avenir Next',fontSize:15,charSpacing:4.8,align:'center',color:C.gold});
 text(s,'EMPLOYEE',1.1,2.39,11.13,1.0,{fontFace:'Baskerville',fontSize:61,charSpacing:3.3,align:'center'});
 text(s,'AWARDS',1.1,3.41,11.13,1.08,{fontFace:'Baskerville',fontSize:65,charSpacing:4.8,align:'center'});
 line(s,5.92,4.65,1.5,0,C.gold,.85);
 text(s,data.title,2.0,5.02,9.33,.48,{fontSize:26,align:'center',charSpacing:1.0});
 text(s,'일상의 탁월함을, 빛나는 영예로',2.0,5.77,9.33,.30,{fontSize:14,color:C.muted,align:'center'});
 note(s,'시상식 표지. 모든 타이포그래피와 테두리는 편집 가능합니다.');
}
// 02 — five honorees
{
 const s=slide('HONOREES',2);
 text(s,'THE HONOREES',.8,1.0,7,.35,{fontFace:'Avenir Next',fontSize:12,charSpacing:2.4,color:C.gold});
 text(s,'이달의 빛나는 주인공',.8,1.52,10,.56,{fontSize:30});
 const width=2.15,gap=.245;
 data.recipients.forEach((r,index)=>{
   const x=.8+index*(width+gap);
   photo(s,r,index+1,x,2.48,width,2.69);
   text(s,r.award,x,5.40,width,.3,{fontSize:14,color:C.gold,align:'center'});
   text(s,r.name,x,5.83,width,.41,{fontSize:23,bold:true,align:'center'});
   text(s,`${r.role}  ·  ${r.team}`,x,6.34,width,.29,{fontSize:13,color:C.muted,align:'center'});
 });
 note(s,'수상자 전체 소개. 사진, 상 이름, 이름, 직책, 팀명을 동일한 순서와 간격으로 배치합니다.');
}
// 03–07 — individual honors
for (const [index,r] of data.recipients.entries()) {
 const i=index+1,s=slide(`RECIPIENT ${i}`,i+2);
 text(s,'HONORING EXCELLENCE',.8,1.0,7,.34,{fontFace:'Avenir Next',fontSize:12,charSpacing:2.2,color:C.gold});
 shape(s,'rect',.96,1.74,3.62,4.71,null,C.gold,.75);
 photo(s,r,i,.8,1.58,3.62,4.71);
 const x=5.27;
 text(s,`EXCELLENCE  /  ${String(i).padStart(2,'0')}`,x,1.63,6.8,.32,{fontFace:'Avenir Next',fontSize:12,charSpacing:2.0,color:C.gold});
 text(s,r.award,x,2.19,6.9,.60,{fontSize:32,color:C.gold});
 line(s,x,3.05,6.92,0,C.line,.7);
 text(s,r.name,x,3.40,6.9,.73,{fontSize:39,bold:true});
 text(s,`${r.role}  |  ${r.team}`,x,4.26,6.8,.38,{fontSize:18,color:C.muted});
 text(s,'수상 사유',x,5.05,6.8,.31,{fontSize:13,bold:true,color:C.gold});
 text(s,r.reason,x,5.56,6.9,1.1,{fontSize:19,breakLine:false,lineSpacingMultiple:1.3,valign:'top'});
 note(s,`수상자 ${i} 개인 수상 슬라이드. 수상 사유는 2~3문장, 약 70자 이내를 권장합니다.`);
}
// 08 — closing
{
 const s=slide('CONGRATULATIONS',8);
 ornament(s,W/2,1.78,1.2);
 text(s,'CONGRATULATIONS',1.0,2.24,11.33,.7,{fontFace:'Baskerville',fontSize:43,charSpacing:2.6,align:'center',color:C.gold});
 text(s,'축하합니다',1.0,3.27,11.33,.89,{fontSize:48,align:'center'});
 text(s,'여러분의 탁월한 기여에 깊이 감사드립니다.',1.0,4.55,11.33,.4,{fontSize:21,align:'center',color:C.muted});
 text(s,'함께 만들어 갈 더 빛나는 내일을 응원합니다.',1.0,5.12,11.33,.34,{fontSize:17,align:'center',color:C.muted});
 line(s,5.92,5.91,1.5,0,C.gold,.85);
 note(s,'축하 및 마무리 슬라이드.');
}
const outputFile = path.resolve(ROOT, cli.output || 'output/awards_2026.pptx');
if (path.extname(outputFile).toLowerCase() !== '.pptx') throw new Error('출력 파일은 .pptx 확장자여야 합니다.');
const manifestFile = cli.output
  ? path.join(path.dirname(outputFile), path.basename(outputFile, path.extname(outputFile)) + '_layout.json')
  : path.join(ROOT, 'output/layout_manifest.json');
fs.mkdirSync(path.dirname(outputFile),{recursive:true});
(async()=>{
 await pptx.writeFile({fileName:outputFile});
 fs.writeFileSync(manifestFile,JSON.stringify({width:W,height:H,slides:manifest},null,2));
 console.log(`Created ${outputFile} — 8 editable slides`);
})();
