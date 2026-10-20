/** 3 styles × 3 representative slides. Does not write the original awards PPTX. */
const pptxgen = require('pptxgenjs');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'output/design-experiments');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'input/awards_2026.json'),'utf8'));
if(data.recipients.length !== 5) throw new Error('Expected five recipients');
fs.mkdirSync(OUT,{recursive:true});
const W=13.333333,H=7.5;
const styles=[
 {id:'A',file:'A_luxury_minimal',name:'럭셔리 미니멀',bg:'F7F4EC',ink:'292722',accent:'A38A55',muted:'716A5D',rule:'D8CCB5',photo:'ECE7DC',sil:'DCD4C5',en:'Baskerville'},
 {id:'B',file:'B_premium_awards',name:'프리미엄 어워즈',bg:'14191F',ink:'F5EFE2',accent:'D5B67C',muted:'B7B7B3',rule:'5F5540',photo:'252C32',sil:'41494F',en:'Baskerville'},
 {id:'C',file:'C_modern_editorial',name:'모던 에디토리얼',bg:'F4F4F0',ink:'1B1D1D',accent:'A33E32',muted:'646868',rule:'BFC2BC',photo:'E3E5DF',sil:'C4C9C1',en:'Helvetica Neue'}
];
function build(c){
 const p=new pptxgen();p.layout='LAYOUT_WIDE';p.author=data.organization;p.company=data.organization;p.lang='ko-KR';p.title=`${data.date} — ${c.name} — Design study`;
 p.theme={headFontFace:'Apple SD Gothic Neo',bodyFontFace:'Apple SD Gothic Neo',lang:'ko-KR'};
 function tx(s,t,x,y,w,h,o={}) {s.addText(t,{x,y,w,h,fontFace:'Apple SD Gothic Neo',fontSize:18,color:c.ink,margin:0,valign:'mid',fit:'none',...o});}
 function sh(s,type,x,y,w,h,fill,stroke=c.rule,lw=.65,extra={}){s.addShape(type,{x,y,w,h,fill:fill?{color:fill}:{color:c.bg,transparency:100},line:{color:stroke,width:lw,transparency:lw?0:100},...extra});}
 function ln(s,x,y,w,color=c.rule,width=.7){sh(s,'line',x,y,w,0,null,color,width);}
 function ornament(s,x,y){ln(s,x-.65,y,.45,c.rule);sh(s,'diamond',x-.055,y-.055,.11,.11,c.accent,c.accent,0);ln(s,x+.2,y,.45,c.rule);}
 function glow(s,cx,cy,w,h){
   for(let k=0;k<48;k++){
     const r=1-k/49;
     sh(s,'ellipse',cx-w*r/2,cy-h*r/2,w*r,h*r,c.accent,c.accent,0,{fill:{color:'F3D6A1',transparency:99.5}});
   }
 }
 function page(n){
   const s=p.addSlide();s.background={color:c.bg};
   tx(s,data.organization,.75,.34,5,.28,{fontSize:11,color:c.muted});
   tx(s,data.date,9.0,.34,3.58,.28,{fontFace:'Avenir Next',fontSize:10,align:'right',charSpacing:1.5,color:c.muted});
   return s;
 }
 function finish(s,n){
   ln(s,.75,6.97,11.83,c.rule,c.id==='C'?1:.6);
   tx(s,'EMPLOYEE AWARDS',.75,7.09,6,.21,{fontFace:'Avenir Next',fontSize:9,charSpacing:1.7,color:c.muted});
   tx(s,String(n).padStart(2,'0')+' / 03',11.5,7.09,1.08,.21,{fontFace:'Avenir Next',fontSize:9,align:'right',color:c.muted});
   s.addNotes(`디자인 비교 ${c.id}: ${c.name}。 원본 데이터 input/awards_2026.json을 그대로 사용합니다. 개인 상세는 첫 번째 수상자입니다. 사진이 없으면 편집 가능한 자리표시자 도형을 표시합니다. 모든 텍스트 및 장식은 PowerPoint에서 편집할 수 있습니다.`);
 }
 function photo(s,r,i,x,y,w,h){
   let src=path.resolve(ROOT,r.photo);
   if(!fs.existsSync(src))src=['.jpg','.jpeg','.png'].map(ext=>src.replace(/\.[^.]+$/,ext)).find(f=>fs.existsSync(f));
   if(src){s.addImage({path:src,...pptxgen.imageSizingCrop(src,x,y,w,h),objectName:`수상자 ${i} 사진`});return;}
   sh(s,'rect',x,y,w,h,c.photo,c.photo,0,{objectName:`수상자 ${i} 사진 교체 영역`});
   const head=w*.23;
   sh(s,'ellipse',x+w/2-head/2,y+h*.37-head/2,head,head,c.sil,c.sil,0);
   sh(s,'ellipse',x+w*.23,y+h*.37+head*.65,w*.54,h*.24,c.sil,c.sil,0);
   tx(s,'PHOTO '+String(i).padStart(2,'0'),x+.1,y+h-.63,w-.2,.26,{fontFace:'Avenir Next',fontSize:w<3?10:12,charSpacing:1.5,color:c.muted,align:'center'});
   tx(s,'[사진 교체]',x+.1,y+h-.34,w-.2,.22,{fontSize:10,color:c.muted,align:'center'});
 }
 // 01: title — identical core content, different graphic language.
 {
  const s=page(1);
  if(c.id==='A'){
   ornament(s,W/2,1.56);
   tx(s,data.date,1.0,1.98,11.33,.36,{fontFace:'Avenir Next',fontSize:14,charSpacing:4,align:'center',color:c.accent});
   tx(s,'EMPLOYEE',1,2.58,11.33,.98,{fontFace:c.en,fontSize:59,charSpacing:3,align:'center'});
   tx(s,'AWARDS',1,3.57,11.33,1.04,{fontFace:c.en,fontSize:62,charSpacing:4,align:'center'});
   ln(s,6.07,5.03,1.2,c.accent,.8);
   tx(s,data.title,1,5.48,11.33,.56,{fontSize:27,align:'center'});
  } else if(c.id==='B'){
   glow(s,9.1,2.04,7.7,3.9);
   ln(s,.8,1.2,11.73,c.rule,.65);
   tx(s,data.date,1.0,1.60,10.8,.40,{fontFace:'Avenir Next',fontSize:15,charSpacing:5,color:c.accent});
   tx(s,'EMPLOYEE',.94,2.30,11.4,1.13,{fontFace:c.en,fontSize:70,charSpacing:3});
   tx(s,'AWARDS',.94,3.44,11.4,1.32,{fontFace:c.en,fontSize:83,charSpacing:4,color:c.accent});
   ln(s,1.0,5.32,.7,c.accent,2);
   tx(s,data.title,2.0,5.08,9,.62,{fontSize:29});
   ln(s,.8,6.4,11.73,c.rule,.65);
  } else {
   ln(s,.8,1.11,11.73,c.ink,2.4);
   tx(s,data.date,.8,1.45,8,.38,{fontFace:'Helvetica Neue',fontSize:14,bold:true,charSpacing:1.1});
   tx(s,'EMPLOYEE',.73,2.20,11.5,1.15,{fontFace:c.en,fontSize:66,bold:true,charSpacing:-1.8});
   tx(s,'AWARDS',.73,3.40,11.5,1.28,{fontFace:c.en,fontSize:73,bold:true,charSpacing:-1.8});
   sh(s,'rect',.8,5.06,.12,1.03,c.accent,c.accent,0);
   tx(s,data.title,1.18,5.1,10.9,.71,{fontSize:31,bold:true});
  }
  finish(s,1);
 }
 // 02: all five recipients, same source order and fields.
 {
  const s=page(2);
  if(c.id==='A'){
   tx(s,'THE HONOREES',.8,1.04,9,.35,{fontFace:'Avenir Next',fontSize:12,charSpacing:2.6,color:c.accent});
   tx(s,'이달의 빛나는 주인공',.8,1.59,10,.56,{fontSize:30});
  } else if(c.id==='B'){
   glow(s,10.1,1.3,5.1,2.3);
   tx(s,'THE HONOREES',.8,1.02,10,.56,{fontFace:c.en,fontSize:31,charSpacing:2,color:c.accent});
   tx(s,'이달의 빛나는 주인공',.8,1.79,10,.48,{fontSize:23});
  } else {
   tx(s,'THE HONOREES',.76,1.02,11.8,.78,{fontFace:c.en,fontSize:39,bold:true,charSpacing:-.6});
   tx(s,'이달의 빛나는 주인공',.8,1.98,10,.43,{fontSize:20});
  }
  const w=2.15,gap=.245;
  data.recipients.forEach((r,i)=>{
   const x=.8+i*(w+gap);
   if(c.id==='B')sh(s,'rect',x-.035,2.605,w+.07,2.76,null,c.rule,.65);
   photo(s,r,i+1,x,2.64,w,2.69);
   if(c.id==='C'){
    ln(s,x,5.52,w,c.ink,1.05);
    tx(s,r.award,x,5.71,w,.29,{fontSize:13,color:c.accent,bold:true});
    tx(s,r.name,x,6.08,w,.4,{fontSize:23,bold:true});
    tx(s,`${r.role}  ·  ${r.team}`,x,6.6,w,.25,{fontSize:12,color:c.muted});
   } else {
    tx(s,r.award,x,5.59,w,.30,{fontSize:14,color:c.accent,align:'center'});
    tx(s,r.name,x,6.01,w,.41,{fontSize:23,bold:true,align:'center'});
    tx(s,`${r.role}  ·  ${r.team}`,x,6.56,w,.26,{fontSize:12.5,color:c.muted,align:'center'});
   }
  });
  finish(s,2);
 }
 // 03: first recipient, verbatim source fields and reason.
 {
  const s=page(3),r=data.recipients[0];
  if(c.id==='A'){
   sh(s,'rect',.98,1.47,3.60,4.95,null,c.accent,.7);
   photo(s,r,1,.82,1.31,3.60,4.95);
   tx(s,'HONORING EXCELLENCE',5.25,1.42,7,.34,{fontFace:'Avenir Next',fontSize:11,charSpacing:2,color:c.accent});
   tx(s,r.award,5.25,2.02,7,.62,{fontSize:32,color:c.accent});
   tx(s,r.name,5.25,3.05,7,.85,{fontSize:43,bold:true});
   tx(s,`${r.role}  |  ${r.team}`,5.25,4.05,7,.4,{fontSize:18,color:c.muted});
   ln(s,5.25,4.86,6.95,c.rule,.65);
   tx(s,'수상 사유',5.25,5.19,7,.3,{fontSize:13,bold:true,color:c.accent});
   tx(s,r.reason,5.25,5.74,6.95,.92,{fontSize:18.5,lineSpacingMultiple:1.25,valign:'top'});
  } else if(c.id==='B'){
   glow(s,8.7,2.1,7.4,3.9);
   sh(s,'rect',.8,1.25,4.06,5.27,null,c.accent,.75);
   photo(s,r,1,.96,1.41,3.74,4.95);
   tx(s,'HONORING EXCELLENCE',5.52,1.43,6.8,.34,{fontFace:'Avenir Next',fontSize:11,charSpacing:2.0,color:c.accent});
   tx(s,r.award,5.52,2.08,6.8,.63,{fontSize:32,color:c.accent});
   tx(s,r.name,5.52,3.05,6.8,.85,{fontSize:44,bold:true});
   tx(s,`${r.role}  |  ${r.team}`,5.52,4.05,6.8,.4,{fontSize:18,color:c.muted});
   ln(s,5.52,4.88,6.63,c.rule,.7);
   tx(s,'수상 사유',5.52,5.19,6.8,.31,{fontSize:13,bold:true,color:c.accent});
   tx(s,r.reason,5.52,5.75,6.9,.92,{fontSize:18.5,lineSpacingMultiple:1.25,valign:'top'});
  } else {
   ln(s,.8,1.15,11.73,c.ink,2.2);
   tx(s,'HONORING EXCELLENCE',.8,1.48,6.8,.32,{fontFace:c.en,fontSize:12,bold:true,charSpacing:1.2,color:c.accent});
   tx(s,r.award,.8,2.11,6.85,.65,{fontSize:33,bold:true});
   tx(s,r.name,.8,3.10,6.8,.91,{fontSize:46,bold:true});
   tx(s,`${r.role}  |  ${r.team}`,.8,4.16,6.8,.41,{fontSize:18,color:c.muted});
   ln(s,.8,5.03,6.63,c.ink,1.0);
   tx(s,'수상 사유',.8,5.36,6.8,.31,{fontSize:13,bold:true,color:c.accent});
   tx(s,r.reason,.8,5.9,6.85,.82,{fontSize:18,lineSpacingMultiple:1.2,valign:'top'});
   photo(s,r,1,8.18,1.48,4.35,5.13);
  }
  finish(s,3);
 }
 return p.writeFile({fileName:path.join(OUT,c.file+'.pptx')});
}
(async()=>{for(const style of styles){await build(style);console.log(style.file+': 3 editable slides created');}})();
