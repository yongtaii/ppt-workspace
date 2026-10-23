/** Claude Code sample: the shared Codex/Claude PPT workflow. Run with npm run build:claude. */
const pptxgen = require('pptxgenjs');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const T = require('../design/apple/theme.json');
const C = T.colors;
const pptx = new pptxgen();
pptx.layout = T.layout;
pptx.author = 'PPT Workspace';
pptx.title = 'PPT Workspace — Codex·Claude 공용 작업 흐름';
pptx.subject = 'Claude Code에서 my-ppt-designer Skill로 생성한 Apple 스타일 샘플';
pptx.lang = 'ko-KR';
pptx.theme = {headFontFace:T.fonts.heading, bodyFontFace:T.fonts.body, lang:'ko-KR'};
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
  text(s,'PPT Workspace',.72,.36,3,.3,{fontFace:T.fonts.latin,fontSize:15,color:dark?C.white:C.ink});
  text(s,section,8.5,.38,4.1,.25,{fontFace:T.fonts.latin,fontSize:10,charSpacing:1.2,align:'right',color:dark?C.darkMuted:C.muted});
  text(s,'CLAUDE CODE SAMPLE · my-ppt-designer',.72,7.06,8,.22,{fontFace:T.fonts.latin,fontSize:10,color:dark?C.darkMuted:C.muted});
  text(s,String(n).padStart(2,'0'),11.9,7.06,.7,.22,{fontFace:T.fonts.latin,fontSize:10,align:'right',color:dark?C.darkMuted:C.muted});
  s.addNotes('Claude Code에서 my-ppt-designer Skill로 만든 샘플입니다. 내용은 이 저장소의 AGENTS.md, CLAUDE.md, package.json에 적힌 구조와 명령만 사용합니다. 디자인: design/apple/ppt-design.md. 글꼴은 임베드하지 않습니다.');
  return s;
}
// 01 — Dark opening statement.
{
  const s=slide(C.dark,'OVERVIEW',1);
  text(s,'Codex와 Claude Code가 함께 쓰는',.78,1.9,11,.4,{fontSize:22,color:C.blueOnDark});
  heading(s,'하나의 규칙.\n하나의 Skill.',.72,2.55,11.8,2.15,{fontSize:56,color:C.white});
  text(s,'어떤 에이전트로 작업해도 같은 디자인과 같은 검수.',.78,5.2,11,.5,{fontSize:22,color:C.darkMuted});
}
// 02 — Four-stage pipeline across the project folders.
{
  const s=slide(C.white,'PIPELINE',2);
  heading(s,'자료에서 발표까지, 네 단계.',.72,1.12,11.9,.8,{fontSize:40});
  const steps=[['input/','원고·데이터·사진'],['design/','발표별 디자인 규칙'],['src/','PptxGenJS 생성 코드'],['output/','PPTX·미리보기·보고서']];
  const y=4.05, x0=.72, step=3.05;
  rule(s,x0+.11,y+.11,step*3,C.hairline);
  steps.forEach(([dir,desc],i)=>{
    const x=x0+i*step;
    dot(s,x,y,.22,i===3?C.blue:C.ink);
    text(s,String(i+1).padStart(2,'0'),x,y-.7,1,.35,{fontFace:T.fonts.latin,fontSize:16,color:C.muted});
    text(s,dir,x,y+.6,2.8,.5,{fontFace:T.fonts.latin,fontSize:28,bold:true,color:i===3?C.blue:C.ink});
    text(s,desc,x,y+1.3,2.8,.4,{fontSize:18,color:C.muted});
  });
}
// 03 — Side-by-side: what each agent reads.
{
  const s=slide(C.canvas,'TWO AGENTS',3);
  heading(s,'읽는 파일은 달라도, 원본은 같습니다.',.72,1.12,11.9,.8,{fontSize:38});
  const cols=[['Codex',['AGENTS.md','.agents/skills/']],['Claude Code',['CLAUDE.md → @AGENTS.md','.claude/skills/ → 링크']]];
  cols.forEach(([name,items],i)=>{
    const x=.72+i*6.08;
    rect(s,x,2.45,5.81,2.85,C.white);
    text(s,name,x+.42,2.82,5,.5,{fontFace:T.fonts.latin,fontSize:26,bold:true,color:C.ink});
    items.forEach((v,k)=>{
      const yy=3.7+k*.68;
      text(s,v,x+.42,yy,5,.4,{fontFace:T.fonts.latin,fontSize:19,color:C.muted});
      if(k===0) rule(s,x+.42,yy+.56,4.97);
    });
  });
  text(s,'규칙은 AGENTS.md·AGENT.md에서, Skill은 .agents/skills/my-ppt-designer에서만 수정합니다.',.72,5.8,11.9,.45,{fontSize:19,color:C.blue});
}
// 04 — Commands, one per row.
{
  const s=slide(C.white,'COMMANDS',4);
  text(s,'프로젝트 루트에서',.72,1.55,5,.4,{fontSize:18,color:C.blue});
  heading(s,'명령 세 개면\n충분합니다.',.72,2.2,5,1.6,{fontSize:40});
  const cmds=[['npm run build','PPTX 생성'],['npm run inspect','ZIP·XML·경계·겹침 검사'],['npm run preview','모든 슬라이드 PNG 렌더링']];
  cmds.forEach(([cmd,desc],i)=>{
    const y=1.9+i*1.32;
    rect(s,6.1,y,6.5,1.05,C.canvas);
    text(s,cmd,6.45,y+.14,5.9,.42,{fontFace:T.fonts.latin,fontSize:21,bold:true,color:C.ink});
    text(s,desc,6.45,y+.58,5.9,.32,{fontSize:15,color:C.muted});
  });
}
// 05 — Verification levels, kept distinct.
{
  const s=slide(C.dark,'VERIFICATION',5);
  text(s,'검수는 구분해서 보고합니다',1,1.34,11.33,.4,{fontSize:20,align:'center',color:C.blueOnDark});
  heading(s,'확인한 만큼만, 완료라고.',.72,2.2,11.89,.94,{fontSize:45,align:'center',color:C.white});
  const cols=[['구조 검사','ZIP CRC·XML 파싱\n슬라이드 경계·텍스트 겹침'],['AppKit 미리보기','macOS 자체 렌더링\n실제 PowerPoint 아님'],['실제 프로그램','PowerPoint·LibreOffice\n열기와 렌더링']];
  cols.forEach(([a,b],i)=>{
    const x=.94+i*4.12;
    rule(s,x,4.2,3.2,'555557');
    heading(s,a,x,4.5,3.4,.45,{fontSize:25,color:C.white});
    text(s,b,x,5.15,3.4,.85,{fontSize:17,color:C.darkMuted,valign:'top',lineSpacingMultiple:1.45});
  });
}
// 06 — Closing.
{
  const s=slide(C.canvas,'NEXT',6);
  text(s,'my-ppt-designer',1,1.6,11.33,.5,{fontFace:T.fonts.latin,fontSize:28,align:'center',color:C.blue});
  heading(s,'원고를 input/에 넣고,\n발표를 시작하세요.',.72,2.45,11.89,1.9,{fontSize:49,align:'center'});
  text(s,'디자인 지정이 없으면 Apple 기반 기본 스타일이 적용됩니다.',1,5.11,11.33,.47,{fontSize:22,align:'center',color:C.muted});
}
fs.mkdirSync(path.join(root,'output'),{recursive:true});
pptx.writeFile({fileName:path.join(root,'output/claude_sample.pptx')});
