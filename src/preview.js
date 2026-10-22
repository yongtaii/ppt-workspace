// Project adapter: the reusable preview implementation lives in the Skill.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const candidates = ['my-ppt-designer', '.agents/skills/my-ppt-designer'];
const skill = candidates.map(p => path.join(root, p)).find(p => fs.existsSync(path.join(p, 'SKILL.md')));
if (!skill) throw new Error('my-ppt-designer Skill을 찾을 수 없습니다.');
const args = process.argv.slice(2);
const inspector = args[0] === '--inspect';
if (inspector) args.shift();
const script = inspector ? 'inspect_pptx.py' : 'preview_pptx.py';
const result = spawnSync('python3', [path.join(skill, 'scripts', script), ...args], {stdio:'inherit'});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
