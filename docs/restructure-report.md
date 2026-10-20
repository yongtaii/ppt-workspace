# 개인용 PPT Skill 구조 정리 결과

## 완료 상태

발표 전용 코드·디자인과 범용 Skill을 분리했다. 원본 데이터와 PPT 콘텐츠를 보존했다. 세션 권한 제한으로 준비해 둔 Skill을 사용자가 로컬 터미널에서 이동했다. 후속 확인에서 `.agents/skills/my-ppt-designer/`의 파일 구성과 검수 도구 실행 연결이 정상임을 확인했다. 루트의 임시 `my-ppt-designer/`는 남아 있지 않으며 `output/`은 비어 있다.

사용자가 로컬 터미널에서 실행한 최종 이동 명령은 다음과 같다. 기존 Skill이 있으면 덮어쓰지 않는다. 실행 연결 코드는 최종·임시 경로를 자동 인식한다.

```sh
cd /Users/ktoeh/Developer/ppt-workspace
bash src/finalize_skill_layout.sh
```

## 변경 전

```text
ppt-workspace/
├── AGENT.md
├── AGENTS.md
├── README.md
├── package.json / package-lock.json
├── node_modules/
├── my-ppt-designer/
│   ├── SKILL.md
│   ├── references/awards-design.md
│   ├── scripts/
│   │   ├── build_awards.js
│   │   ├── finalize_layout.sh
│   │   ├── inspect_pptx.py
│   │   └── render_awards.swift
│   └── assets/
├── input/awards_2026.json
└── output/
    ├── awards_2026.pptx
    ├── layout_manifest.json
    └── rendered/ (슬라이드 PNG, 전체 미리보기, 검수 JSON)
```

## 이동 대기 당시 구조 (기록)

```text
ppt-workspace/
├── AGENT.md                         # 원문 보존
├── AGENTS.md                        # AGENT.md 참조 및 프로젝트 운영 규칙
├── README.md
├── package.json / package-lock.json
├── node_modules/
├── my-ppt-designer/                  # .agents 쓰기 차단으로 이동 대기
│   ├── SKILL.md                     # 포상 PPT 전용 조건 제거
│   ├── references/preview-validation.md
│   ├── scripts/
│   │   ├── inspect_pptx.py
│   │   ├── preview_pptx.py
│   │   └── render_pptx.swift
│   └── assets/
├── src/
│   ├── build_awards.js              # 발표 전용 생성 코드
│   ├── preview.js                   # 프로젝트와 Skill의 실행 경로 연결
│   └── finalize_skill_layout.sh     # 로컬 최종 이동
├── design/awards-design.md           # 포상 발표 전용 디자인, 원문 보존
├── input/awards_2026.json            # 원본 데이터 보존
├── docs/restructure-report.md
└── output/                          # 테스트 후 생성물 삭제, 빈 폴더 유지
```

최종 이동으로 아래 기록의 `my-ppt-designer/`는 현재 `.agents/skills/my-ppt-designer/`에 있다. `src/`, `design/`, `input/` 및 실행 명령은 그대로 사용한다. 최종 위치에서의 실행은 별도 임시 작업 공간에서 테스트했다.

## 변경 내용

- `build_awards.js`를 `src/`로 이동했다. 입력 및 결과 경로는 프로젝트 루트 기준으로 유지하며 생성 로직, 문구, 디자인을 변경하지 않았다.
- `awards-design.md`는 특정 시상식의 색상·글꼴·레이아웃을 규정하므로 `design/`으로 이동했다.
- Skill의 검수 스크립트에서 포상 PPT 파일명·고정 8장·아이보리 배경·고정 전체 미리보기 행 수를 제거했다. PPTX 경로와 출력 디렉터리를 인자로 받고 실제 슬라이드 순서·개수·크기·배경을 읽는다.
- 범용 렌더링 파일명을 `render_pptx.swift`로 바꾸고 `preview_pptx.py`에서 구조 검수와 렌더링을 연결했다.
- Skill의 참조는 `references/preview-validation.md` 및 `scripts/`의 상대 경로로 수정했다. 발표별 생성 코드와 디자인을 Skill에 포함하지 않는다.
- `package.json`의 `build`는 프로젝트 생성 코드, `inspect`와 `preview`는 `src/preview.js`를 통해 Skill을 호출한다. 최종 위치를 우선하고 설치 대기 중에는 임시 위치를 사용한다.
- 예전 이동 스크립트는 `src/finalize_skill_layout.sh`로 옮겨 범용 Skill에서 분리했다. 더 이상 잘못된 `Skill/scripts/build_awards.js` 경로로 package.json을 갱신하지 않는다.

## AGENT.md / AGENTS.md 비교

| 주제 | 정리 전 중복 여부 | 처리 |
| --- | --- | --- |
| 목적·청중 고려, 원본 보존, 정확성 | 의미상 중복 | AGENT.md를 공통 원칙으로 참조 |
| 정렬·여백·가독성 | 의미상 중복 | AGENT.md 원문 유지 |
| 잘림·겹침·정렬 검수 | 의미상 중복 | AGENT.md 기준 유지, 도구별 검수 한계는 AGENTS.md에 명시 |
| 지정 문구·데이터 보존, 편집 가능한 PPTX, 원본 소스 유지 | AGENT.md의 명시적 기준 | AGENT.md 삭제·변경 없이 참조 |
| 폴더 구조·명령·도구 한계 | AGENTS.md의 프로젝트 운영 정보 | 현재 구조에 맞게 갱신 |

AGENT.md는 삭제하지 않았으며 바이트 단위로 동일하다. AGENTS.md는 공통 원칙을 다시 나열하는 대신 AGENT.md를 참조한다.

## 테스트 결과

| 검사 | 결과 |
| --- | --- |
| 현재 작업 폴더 `npm run build` | 통과: 기존 8장 PPTX 생성 |
| `npm run inspect` | 통과: 16:9, 텍스트 113개, 도형 57개, 경계 이탈·텍스트 상자 겹침 0건 |
| `npm run preview` | 통과: 8장 PNG 및 전체 미리보기, 텍스트 높이 초과·글꼴 대체 0건 |
| 렌더링한 전체 8장 시각 검토 | 자체 미리보기에서 잘림·겹침·정렬 문제 없음 |
| ZIP CRC 및 전체 XML 파싱 | 통과 |
| 임시 작업 공간에서 최종 `.agents/skills/` 이동 및 build/inspect/preview | 모두 통과 |
| 최종 이동 스크립트 재실행 | 이미 이동했을 때 안전하게 종료 |
| 프로젝트 밖에서 범용 도구 실행 | 통과: 별도 파일명, 3장, 4:3, 서로 다른 배경, 내장 이미지 |
| 잘못된 기대 슬라이드 수 / 손상 PPTX | 각각 실패 상태로 종료해 오류 검출 |
| Skill 프런트매터·참조 파일·분리 상태 | 기본 검증 통과 |
| Skill 표준 quick_validate.py | PyYAML 미설치로 실행 불가; 이름·설명·프런트매터·실제 참조 경로는 별도 검사 |
| 실제 PowerPoint/LibreOffice에서 열기·렌더링 | 실행 환경에 도구가 없어 미수행 |

자체 AppKit 렌더러는 기본 텍스트·도형·이미지용이며 모든 PowerPoint 기능을 재현하지 않는다. 다른 발표자료는 Skill의 검수 지원 범위를 확인하고 실제 프로그램으로 검수해야 한다. ZIP/XML 검증을 실제 PowerPoint 열기 성공으로 해석하지 않는다.

## 보존 확인

- `input/awards_2026.json`: 변경 전후 SHA-256 일치.
- `AGENT.md`: 변경 전후 SHA-256 일치.
- 이동한 `design/awards-design.md`: 기존 파일과 SHA-256 일치.
- 재생성한 PPTX의 슬라이드·발표자 노트·마스터·테마 XML: 기존 PPTX와 바이트 단위 SHA-256 일치. ZIP 메타데이터와 생성 시각은 콘텐츠 비교에서 제외했다.

## 생성물 삭제

사용자 요청에 따라 검수를 마친 후 이전 결과와 테스트로 재생성한 `output/awards_2026.pptx`, `output/layout_manifest.json`, `output/rendered/` 전체를 삭제했다. 임시 복제 작업 공간과 테스트 PPTX도 정리했다. 원고, 디자인, 생성·검수 소스, Skill과 지침은 보존했다. `output/`은 비워 두었으므로 다시 결과물이 필요하면 `npm run build`부터 실행한다.


## 최종 이동 확인

- `.agents/skills/my-ppt-designer/`에 SKILL.md, 범용 scripts, references 및 assets가 존재한다.
- 루트의 임시 `my-ppt-designer/`는 없다.
- `node --check src/preview.js` 통과.
- `node src/preview.js --inspect --help`가 최종 Skill 내부의 검사 도구를 정상 실행한다.
- `package.json`의 build/inspect/preview 경로는 유지하며 추가 수정이 필요 없다.
- 이전 테스트 이후 PPTX를 다시 생성하지 않았고 `output/`은 빈 상태를 유지한다.
