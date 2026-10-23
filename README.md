# PPT workspace

발표별 코드·데이터·디자인과 개인용 PPT Skill을 분리한 PptxGenJS 작업 공간입니다.

```text
ppt-workspace/
├── AGENT.md                    # 사용자가 지정한 공통 원칙 (보존)
├── AGENTS.md                   # 프로젝트 경로·실행·검수 규칙
├── CLAUDE.md                   # Claude Code용 (AGENTS.md·AGENT.md를 import)
├── .claude/
│   ├── settings.json           # 빌드·검수 명령 허용
│   └── skills/my-ppt-designer -> ../../.agents/skills/my-ppt-designer
├── .agents/skills/my-ppt-designer/
│   ├── SKILL.md
│   ├── references/preview-validation.md
│   ├── scripts/
│   │   ├── inspect_pptx.py
│   │   ├── preview_pptx.py
│   │   └── render_pptx.swift
│   └── assets/
├── src/
│   ├── build_awards.js
│   ├── preview.js
│   └── finalize_skill_layout.sh
├── design/awards-design.md
├── input/awards_2026.json
├── output/
└── docs/restructure-report.md
```

Skill은 `.agents/skills/my-ppt-designer/`로 이동 완료했으며 실행 연결도 확인했습니다. 아래 명령은 이동 상태를 확인하거나 설치 대기 상태를 마무리할 때 사용합니다.

```sh
bash src/finalize_skill_layout.sh
```

`src/preview.js`가 최종 Skill 위치를 인식하므로 기존 실행 명령을 그대로 사용합니다. 다른 프로젝트에서는 Skill 디렉터리를 복사하고 해당 프로젝트의 `src/`, `input/`, `design/`을 별도로 구성합니다. Skill에는 포상 PPT 생성 코드를 포함하지 않습니다.

## Codex / Claude Code 공용

- Codex는 `AGENTS.md`와 `.agents/skills/`를, Claude Code는 `CLAUDE.md`와 `.claude/skills/`를 읽습니다.
- `CLAUDE.md`는 `@AGENTS.md`, `@AGENT.md`를 불러오므로 공통 규칙은 `AGENTS.md`/`AGENT.md`에서만 수정합니다.
- `.claude/skills/my-ppt-designer`는 심볼릭 링크라서 Skill도 `.agents/skills/my-ppt-designer/` 한 곳만 수정하면 양쪽에 반영됩니다.

## 기존 포상 PPT

```sh
npm install
npm run build
npm run inspect
npm run preview
```

- 생성 코드: `src/build_awards.js`
- 데이터: `input/awards_2026.json` (수상자 5명)
- 사진: JSON의 `photo` 필드. 기본 `input/recipient_01.jpg` ~ `recipient_05.jpg`, PNG/JPEG 지원
- 디자인: `design/awards-design.md`
- 생성 결과: `output/awards_2026.pptx`, `output/layout_manifest.json`
- 미리보기·검수 결과: `output/rendered/`

사진이 없으면 편집 가능한 대체 영역을 사용합니다. 한글은 Apple SD Gothic Neo, 영문 제목은 Baskerville, 영문 보조는 Avenir Next입니다. 다른 운영체제에서는 글꼴 설치 여부를 확인하세요. 원고·수상자 정보·사진과 문구를 바꾸려면 사용자의 요청 범위를 확인하고 원본을 보존합니다.

## 다른 PPTX 검수

```sh
node src/preview.js /path/to/deck.pptx --out-dir /path/to/deck-preview
node src/preview.js --inspect /path/to/deck.pptx --out-dir /path/to/deck-preview
```

`inspect`는 Python 3 표준 라이브러리를 사용합니다. `preview`는 추가로 macOS 및 Swift가 필요합니다. AppKit 자체 렌더링은 PowerPoint/LibreOffice의 실제 렌더링과 다르며 지원 범위는 Skill의 `references/preview-validation.md`에 설명되어 있습니다.

이 정리 작업의 테스트 산출물과 이전 PPTX·미리보기는 요청에 따라 테스트 완료 후 삭제했습니다. `output/`은 빈 폴더로 유지합니다. 테스트 및 보존 확인 결과는 `docs/restructure-report.md`를 참고하세요.
