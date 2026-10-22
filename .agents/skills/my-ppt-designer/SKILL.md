---
name: my-ppt-designer
description: PptxGenJS로 편집 가능한 PowerPoint를 제작·수정하고 렌더링 및 레이아웃 검수를 수행한다. 발표 원고와 사진을 바탕으로 PPTX를 만들거나 기존 PPTX의 시각적 품질을 확인할 때 사용한다.
---

# PPT 제작 프로세스

프로젝트에 `AGENTS.md`가 있으면 읽고, 사용자의 목적·청중·지정 문구와 데이터를 기준으로 작업한다. 아래 `scripts/`, `references/`, `assets/`는 이 Skill 디렉터리 기준이다. 프로젝트 경로는 Skill 설치 경로와 구분한다.

## 프로젝트 기본 스타일

이 프로젝트에서는 별도 디자인 요청이 없으면 `design/apple/ppt-design.md`와 `design/apple/theme.json`을 읽어 Apple 기반 스타일을 적용한다. 원본 디자인 분석은 `design/apple/DESIGN-apple.md`에 보존한다. 다른 프로젝트에 이 Skill을 재사용할 때는 이 경로가 있는 경우에만 적용하며, 사용자의 발표별 지정을 우선한다.

- 한국어 기본 글꼴은 macOS의 `Apple SD Gothic Neo`, 제목은 설치된 `AppleSDGothicNeo-SemiBold`를 우선 사용한다. 영문 전용 텍스트는 `Helvetica Neue`를 사용한다.
- PPTX의 `fontFace`에는 실제 설치된 글꼴 이름 하나만 지정한다. CSS의 `system-ui`, `-apple-system`이나 쉼표로 연결한 폰트 스택을 넣지 않는다.
- 원본의 웹 px 수치를 PPT pt로 그대로 옮기지 않는다. 16:9 발표에서 제목 36–54pt, 본문 18–24pt를 기준으로 정보량에 맞춘다.
- 새 발표는 이 기본값으로 제작하되 기존 발표를 명시적 요청 없이 재디자인하지 않는다.

## 입력 및 디자인

- 프로젝트의 `input/`에서 발표별 원고와 사진을 확인한다. 미제공 정보는 명시적 자리표시자로 처리한다.
- 발표별 디자인 규칙은 프로젝트의 `design/`에서 읽는다. 특정 발표의 색상, 글꼴, 슬라이드 수를 다른 발표에 강제하지 않는다.
- 이 Skill의 `assets/`에는 공통 템플릿과 재사용 리소스만 둔다. 발표 전용 사진과 데이터는 `input/`에 둔다.

## 제작

- PptxGenJS를 사용하고 발표별 생성 코드는 프로젝트의 `src/`에 둔다. 텍스트와 장식은 편집 가능한 텍스트 상자와 도형으로 만든다.
- 입력·디자인·출력 경로를 프로젝트 루트 기준으로 계산한다. Skill 내부에 프로젝트 데이터나 발표별 생성 코드를 저장하지 않는다.
- 원본 데이터와 사용자 지정 콘텐츠를 보존하며 결과물은 `output/`에 저장한다. 프로젝트의 `package.json`에 실행 명령이 있으면 사용한다.

## 렌더링 및 검수

검수할 때 [검수 도구와 지원 범위](references/preview-validation.md)를 읽는다.

- [scripts/inspect_pptx.py](scripts/inspect_pptx.py): PPTX 경로를 인자로 받아 ZIP/XML 무결성, 슬라이드 경계 이탈, 텍스트 상자 겹침을 확인한다. 슬라이드 수는 PPTX에서 읽으며 필요할 때만 `--expected-slides`로 기대값을 지정한다.
- [scripts/preview_pptx.py](scripts/preview_pptx.py): 구조 검수 후 macOS에서 [scripts/render_pptx.swift](scripts/render_pptx.swift)를 실행해 모든 슬라이드와 전체 미리보기를 생성한다. `--out-dir`로 출력 위치를 지정한다.
- 렌더링한 모든 슬라이드에서 잘림, 겹침, 정렬, 이미지와 글꼴을 확인하고 문제를 수정한다.
- PowerPoint/LibreOffice가 제공되면 실제 프로그램의 렌더링과 열기를 확인한다. 자체 AppKit 미리보기를 실제 PowerPoint 검수 완료로 표현하지 않는다.
- 결과 전달 시 수행한 검수, 미지원 요소, 미수행 검수와 결과물 경로를 명시한다. 생성물 삭제 요청이 있으면 검수를 마친 후 해당 산출물만 삭제하고 원본과 소스는 보존한다.
