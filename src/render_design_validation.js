const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output/design_validation');
const choices=[process.env.LIBREOFFICE_BIN,'/Applications/LibreOffice.app/Contents/MacOS/soffice','/tmp/form-libreoffice-mount/LibreOffice.app/Contents/MacOS/soffice'].filter(Boolean);
const executable=choices.find(p=>fs.existsSync(p));
if(!executable)throw new Error('LibreOffice가 필요합니다. 설치하거나 LIBREOFFICE_BIN에 soffice 절대 경로를 지정하세요.');
function run(cmd,args,env={}){const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',env:{...process.env,...env}});if(r.status!==0)process.exit(r.status??1);}
run(executable,['-env:UserInstallation=file:///tmp/form-lo-profile-fonts','--headless','--convert-to','pdf','--outdir',out,path.join(out,'form_design_validation_12.pptx')],{FONTCONFIG_FILE:path.join(root,'design/validation-fontconfig.xml')});
run('swift',[path.join(__dirname,'render_validation_pdf.swift'),path.join(out,'form_design_validation_12.pdf'),path.join(out,'png')]);
run('python3',[path.join(__dirname,'validate_design_validation.py')]);
run(process.execPath,[path.join(__dirname,'preview.js'),'--inspect',path.join(out,'form_design_validation_12.pptx'),'--out-dir',path.join(out,'inspection'),'--expected-slides','12']);
run('python3',['-c',`import zipfile\nfrom pathlib import Path\np=Path(${JSON.stringify(out)})\nwith zipfile.ZipFile(p/'slide_pngs.zip','w',zipfile.ZIP_DEFLATED) as z:\n for f in sorted((p/'png').glob('slide-*.png')):z.write(f,f.name)\n z.write(p/'png/overview.png','overview.png')`]);
run(process.execPath,[path.join(__dirname,'build_validation_web.js')]);
