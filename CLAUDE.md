# Claude Code 작업 지침

이 폴더는 Codex와 Claude Code가 함께 쓴다. 공통 규칙은 아래 두 파일이 원본이며, 규칙을 바꿀 때는 이 파일이 아니라 원본을 수정한다.

@AGENTS.md
@AGENT.md

## Claude Code 전용

- PPT 제작·수정·검수에는 프로젝트 Skill `my-ppt-designer`를 사용한다. `.claude/skills/my-ppt-designer`는 `.agents/skills/my-ppt-designer`를 가리키는 심볼릭 링크이므로 Skill은 한 곳(`.agents/`)에서만 수정한다.
- 이 프로젝트에서는 내장 `pptx` Skill이나 Artifact 슬라이드 대신 `my-ppt-designer`와 PptxGenJS 프로세스를 따른다. 사용자가 다른 방식을 명시하면 그에 따른다.
- 시각 검수 시 `npm run preview`(또는 `node src/preview.js ...`)로 생성한 PNG를 Read 도구로 직접 열어 모든 슬라이드를 확인한다. 이 AppKit 미리보기는 실제 PowerPoint/LibreOffice 검수와 구분해 보고한다.
