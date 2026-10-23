const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
(async()=>{
 const pages=await(await fetch('http://127.0.0.1:9341/json')).json();
 const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0;const pending=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 const out=path.resolve(__dirname,'../output/design_validation/browser');fs.mkdirSync(out,{recursive:true});
 const shot=async name=>{const s=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(s.data,'base64'))};
 await call('Runtime.enable');await call('Page.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:8771/'});
 for(let i=0;i<100;i++){if(await evaluate('typeof go === "function"'))break;await new Promise(r=>setTimeout(r,50))}
 assert.equal(await evaluate('pages.length'),12);
 const slides=[];
 for(let i=0;i<12;i++){
  await evaluate(`go(${i}); image.decode()`);
  const r=await evaluate(`({index:current+1,width:image.naturalWidth,height:image.naturalHeight,frameRatio:$('.frame').getBoundingClientRect().width/$('.frame').getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth})`);
  assert.equal(r.index,i+1);assert.equal(r.width,1920);assert.equal(r.height,1080);assert.ok(Math.abs(r.frameRatio-16/9)<.01);assert.equal(r.overflow,false);slides.push(r);
 }
 await evaluate('go(0); image.decode()');await shot('desktop');
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight'});assert.equal(await evaluate('current'),1);
 await evaluate('location.hash="#7"');await new Promise(r=>setTimeout(r,80));assert.equal(await evaluate('current'),6);
 await evaluate('$("#overview").click()');assert.equal(await evaluate('gallery.open'),true);await shot('gallery');
 await evaluate('thumbs[11].click()');assert.equal(await evaluate('current'),11);assert.equal(await evaluate('gallery.open'),false);assert.equal(await evaluate('$("#next").disabled'),true);
 await evaluate('$("#inspect").click()');assert.equal(await evaluate('$("#details").hidden'),false);assert.ok(await evaluate('$(".tags").children.length>=3'));await shot('details');await evaluate('$("#inspect").click();scrollTo(0,0)');
 await evaluate('fullscreen()');assert.equal(await evaluate('!!document.fullscreenElement'),true);await evaluate('fullscreen()');assert.equal(await evaluate('!!document.fullscreenElement'),false);
 const downloads=[];
 for(const file of ['form_design_validation_12.pptx','form_design_validation_12.pdf','slide_pngs.zip','validation_report.json']){const r=await fetch('http://127.0.0.1:8771/'+file);assert.equal(r.status,200);const bytes=Buffer.from(await r.arrayBuffer());assert.ok(bytes.length>100);if(file.endsWith('.pptx')){const local=fs.readFileSync(path.resolve(__dirname,'../output/design_validation',file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),crypto.createHash('sha256').update(local).digest('hex'))}downloads.push({file,bytes:bytes.length})}
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate('go(0);image.decode()');assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));await shot('mobile');
 const bounds=await evaluate('(()=>{let r=image.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()');
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bounds.x+bounds.w*.85,y:bounds.y+bounds.h*.5}]});
 await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bounds.x+bounds.w*.15,y:bounds.y+bounds.h*.5}]});
 await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await evaluate('current'),1);
 await evaluate('$("#overview").click()');assert.equal(await evaluate('gallery.open'),true);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));await shot('mobile-gallery');await evaluate('gallery.close()');
 assert.deepEqual(errors,[]);
 const report={status:'passed',browser:'Chrome headless',desktop:'1440 × 1000',mobile:'390 × 844',slides,downloads,checks:['12 PNGs loaded at 1920×1080','16:9 display','keyboard','URL hash','gallery navigation','boundary controls','feature panel','native fullscreen enter/exit','PPTX byte identity','PDF/PNG/report downloads','mobile horizontal bounds','touch swipe','mobile gallery','no JavaScript runtime errors']};
 fs.writeFileSync(path.join(out,'browser_report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
