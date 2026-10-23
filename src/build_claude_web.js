/** Web (HTML) version of the Claude Code sample. Run with npm run build:claude-web. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const T = require('../design/apple/theme.json');
const C = T.colors;
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const br = s => esc(s).replace(/\n/g,'<br>');
// Same content as src/build_claude_sample.js; keep the two in sync.
const slides = [
  {bg:'dark', section:'OVERVIEW', body:`
    <div class="lead-block">
      <p class="eyebrow">Codex와 Claude Code가 함께 쓰는</p>
      <h1 class="hero">하나의 규칙.<br>하나의 Skill.</h1>
      <p class="sub">어떤 에이전트로 작업해도 같은 디자인과 같은 검수.</p>
    </div>`},
  {bg:'white', section:'PIPELINE', body:`
    <h2>자료에서 발표까지, 네 단계.</h2>
    <ol class="pipeline">${[['input/','원고·데이터·사진'],['design/','발표별 디자인 규칙'],['src/','PptxGenJS 생성 코드'],['output/','PPTX·미리보기·보고서']]
      .map(([d,t],i)=>`<li${i===3?' class="on"':''}><span class="num">0${i+1}</span><span class="node"></span><b class="latin">${d}</b><span class="muted">${t}</span></li>`).join('')}
    </ol>`},
  {bg:'canvas', section:'TWO AGENTS', body:`
    <h2>읽는 파일은 달라도, 원본은 같습니다.</h2>
    <div class="agents">${[['Codex',['AGENTS.md','.agents/skills/']],['Claude Code',['CLAUDE.md → @AGENTS.md','.claude/skills/ → 링크']]]
      .map(([n,items])=>`<div class="card"><b class="latin">${n}</b>${items.map(v=>`<span class="latin muted">${esc(v)}</span>`).join('')}</div>`).join('')}
    </div>
    <p class="note">규칙은 AGENTS.md·AGENT.md에서, Skill은 .agents/skills/my-ppt-designer에서만 수정합니다.</p>`},
  {bg:'white', section:'COMMANDS', body:`
    <div class="split">
      <div><p class="eyebrow">프로젝트 루트에서</p><h2>명령 세 개면<br>충분합니다.</h2></div>
      <ul class="cmds">${[['npm run build','PPTX 생성'],['npm run inspect','ZIP·XML·경계·겹침 검사'],['npm run preview','모든 슬라이드 PNG 렌더링']]
        .map(([c,d])=>`<li><code>${c}</code><span class="muted">${d}</span></li>`).join('')}
      </ul>
    </div>`},
  {bg:'dark', section:'VERIFICATION', body:`
    <div class="center">
      <p class="eyebrow">검수는 구분해서 보고합니다</p>
      <h2>확인한 만큼만, 완료라고.</h2>
    </div>
    <div class="cols">${[['구조 검사','ZIP CRC·XML 파싱\n슬라이드 경계·텍스트 겹침'],['AppKit 미리보기','macOS 자체 렌더링\n실제 PowerPoint 아님'],['실제 프로그램','PowerPoint·LibreOffice\n열기와 렌더링']]
      .map(([a,b])=>`<div><h3>${a}</h3><p class="muted">${br(b)}</p></div>`).join('')}
    </div>`},
  {bg:'canvas', section:'NEXT', body:`
    <div class="center closing">
      <p class="eyebrow latin">my-ppt-designer</p>
      <h1>원고를 input/에 넣고,<br>발표를 시작하세요.</h1>
      <p class="sub">디자인 지정이 없으면 Apple 기반 기본 스타일이 적용됩니다.</p>
    </div>`},
];
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PPT Workspace</title>
<style>
:root{--white:#${C.white};--canvas:#${C.canvas};--ink:#${C.ink};--muted:#${C.muted};--dark:#${C.dark};
  --dark-muted:#${C.darkMuted};--blue:#${C.blue};--blue-dark:#${C.blueOnDark};--hairline:#${C.hairline};
  --body:"${T.fonts.body}",-apple-system,"Noto Sans KR",sans-serif;--latin:"${T.fonts.latin}",Helvetica,Arial,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#111;overflow:hidden;font-family:var(--body);-webkit-font-smoothing:antialiased}
/* A fixed 1280×720 stage (16:9) scaled to fit the window. */
.deck{position:fixed;left:50%;top:50%;width:1280px;height:720px;transform-origin:center;transform:translate(-50%,-50%) scale(var(--k,1))}
.slide{position:absolute;inset:0;padding:96px 69px 72px;display:none;flex-direction:column;justify-content:center;color:var(--ink);--accent:var(--blue);--sub:var(--muted)}
.slide.active{display:flex}
.slide.white{background:var(--white)} .slide.canvas{background:var(--canvas)}
.slide.dark{background:var(--dark);color:var(--white);--accent:var(--blue-dark);--sub:var(--dark-muted)}
.chrome{position:absolute;left:69px;right:69px;display:flex;justify-content:space-between;align-items:center;font-family:var(--latin)}
.chrome.top{top:34px;font-size:20px} .chrome.top span{font-size:13px;letter-spacing:1.6px;color:var(--sub)}
.chrome.bottom{bottom:24px;font-size:13px;color:var(--sub)}
.latin,code{font-family:var(--latin)}
.muted{color:var(--sub)}
h1,h2,h3{font-weight:600;letter-spacing:-.4px;line-height:1.2}
h1{font-size:65px} .hero{font-size:75px} h2{font-size:52px} h3{font-size:33px}
.eyebrow{color:var(--accent);font-size:28px;margin-bottom:24px}
.sub{color:var(--sub);font-size:29px;margin-top:40px}
.center{text-align:center}
.pipeline{list-style:none;display:grid;grid-template-columns:repeat(4,1fr);margin-top:110px;position:relative}
.pipeline::before{content:"";position:absolute;left:14px;right:25%;top:64px;border-top:1px solid var(--hairline)}
.pipeline li{display:flex;flex-direction:column;gap:18px}
.pipeline .num{font-family:var(--latin);font-size:21px;color:var(--muted)}
.pipeline .node{width:28px;height:28px;border-radius:50%;background:var(--ink);position:relative;margin:8px 0 18px}
.pipeline b{font-size:37px} .pipeline .muted{font-size:24px}
.pipeline .on .node{background:var(--blue)} .pipeline .on b{color:var(--blue)}
.agents{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:56px}
.card{background:var(--white);padding:40px;display:flex;flex-direction:column}
.card b{font-size:35px;margin-bottom:30px}
.card span{font-size:25px;padding:14px 0} .card span+span{border-top:1px solid var(--hairline)}
.note{color:var(--blue);font-size:25px;margin-top:48px}
.split{display:grid;grid-template-columns:5fr 7fr;gap:60px;align-items:center}
.split .eyebrow{font-size:24px}
.cmds{list-style:none;display:flex;flex-direction:column;gap:22px}
.cmds li{background:var(--canvas);padding:20px 34px;display:flex;flex-direction:column;gap:8px}
.cmds code{font-size:28px;font-weight:700} .cmds .muted{font-size:20px}
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:70px;margin:90px 25px 0}
.cols div{border-top:1px solid #555557;padding-top:30px}
.cols p{font-size:23px;line-height:1.45;margin-top:20px}
.closing h1{margin-top:8px} .closing .eyebrow{font-size:37px}
.hint{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);color:#999;font:12px var(--latin);transition:opacity .6s}
.hint.gone{opacity:0}
@media print{
  @page{size:1280px 720px;margin:0}
  html,body{overflow:visible;background:none}
  .deck{position:static;transform:none}
  .slide{position:relative;display:flex;width:1280px;height:720px;break-after:page}
  .hint{display:none}
}
</style>
</head>
<body>
<main class="deck">
${slides.map((s,i)=>`<section class="slide ${s.bg}" aria-label="${i+1} / ${slides.length}">
  <div class="chrome top">PPT Workspace<span>${s.section}</span></div>${s.body}
  <div class="chrome bottom">CLAUDE CODE SAMPLE · my-ppt-designer<span>${String(i+1).padStart(2,'0')}</span></div>
</section>`).join('\n')}
</main>
<div class="hint">← → 이동 · F 전체화면</div>
<script>
const deck=document.querySelector('.deck'), slides=[...document.querySelectorAll('.slide')];
let cur=0;
function fit(){deck.style.setProperty('--k',Math.min(innerWidth/1280,innerHeight/720))}
function show(n){cur=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,i)=>s.classList.toggle('active',i===cur));history.replaceState(null,'','#'+(cur+1))}
addEventListener('resize',fit);
addEventListener('keydown',e=>{
  if(['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)) show(cur+1);
  else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)) show(cur-1);
  else if(e.key==='Home') show(0); else if(e.key==='End') show(slides.length-1);
  else if(e.key==='f') document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
});
addEventListener('click',e=>show(cur+(e.clientX<innerWidth/3?-1:1)));
let x0=null;
addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
addEventListener('touchend',e=>{if(x0===null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)show(cur+(d<0?1:-1));x0=null});
setTimeout(()=>document.querySelector('.hint').classList.add('gone'),3000);
fit(); show((parseInt(location.hash.slice(1))||1)-1);
</script>
</body>
</html>
`;
fs.mkdirSync(path.join(root,'output'),{recursive:true});
fs.writeFileSync(path.join(root,'output/claude_sample_web.html'),html);
