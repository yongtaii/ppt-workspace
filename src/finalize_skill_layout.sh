#!/bin/bash
# One-time project migration. Run in a local terminal if .agents is protected.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -e .agents/skills/my-ppt-designer ]; then
  if [ -e my-ppt-designer ]; then
    echo '두 Skill 경로가 모두 존재합니다. 덮어쓰지 않고 중단합니다.' >&2; exit 1
  fi
  echo '이미 최종 위치에 있습니다.'; exit 0
fi
if [ ! -f my-ppt-designer/SKILL.md ]; then
  echo '이동할 my-ppt-designer/SKILL.md가 없습니다.' >&2; exit 1
fi
mkdir -p .agents/skills
mv my-ppt-designer .agents/skills/my-ppt-designer
printf '%s\n' '완료: .agents/skills/my-ppt-designer/ (npm 실행 경로는 자동 인식)'
