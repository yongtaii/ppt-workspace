#!/bin/bash
# One-time project migration. Run in a local terminal if .agents is protected.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -e .agents/skills/my-ppt-designer ]; then
  if [ -e my-ppt-designer ]; then
    if [ ! -f my-ppt-designer/SKILL.md ]; then
      echo '임시 Skill의 SKILL.md가 없습니다. 중단합니다.' >&2; exit 1
    fi
    backup_dir=".agents/skills/my-ppt-designer.backup-$(date +%Y%m%d-%H%M%S)-$$"
    mv .agents/skills/my-ppt-designer "$backup_dir"
    if ! mv my-ppt-designer .agents/skills/my-ppt-designer; then
      mv "$backup_dir" .agents/skills/my-ppt-designer
      exit 1
    fi
    printf '%s\n' "완료: 새 설정을 최종 위치로 이동했습니다. 기존 Skill 백업: $backup_dir"
    exit 0
  fi
  echo '이미 최종 위치에 있습니다.'; exit 0
fi
if [ ! -f my-ppt-designer/SKILL.md ]; then
  echo '이동할 my-ppt-designer/SKILL.md가 없습니다.' >&2; exit 1
fi
mkdir -p .agents/skills
mv my-ppt-designer .agents/skills/my-ppt-designer
printf '%s\n' '완료: .agents/skills/my-ppt-designer/ (npm 실행 경로는 자동 인식)'
