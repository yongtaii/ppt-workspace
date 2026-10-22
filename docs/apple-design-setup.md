# Apple 디자인 기본 설정 및 샘플 검수

2026-10-22

- 사용자 원본 `/Users/ktoeh/Downloads/DESIGN-apple.md`를 `design/apple/DESIGN-apple.md`에 변경 없이 복사했다. `cmp`로 동일성을 확인했다.
- PPT 변환 규칙은 `design/apple/ppt-design.md`, 글꼴·색상 토큰은 `design/apple/theme.json`에 두었다. AGENT.md에서 기본 스타일로 연결한다.
- `.agents`는 현재 환경에서 읽기 전용이므로 수정된 Skill은 `my-ppt-designer/`에 둔다. AGENTS.md의 임시 경로 우선 규칙을 따르며 `src/preview.js`도 같은 우선순위를 사용한다. 보호된 설치본은 수정하지 않았다.
- 로컬 터미널에서 `bash src/finalize_skill_layout.sh`로 최종 경로로 이동할 수 있다. 두 경로가 모두 있으면 기존 설치본을 타임스탬프 백업한 뒤 임시본을 이동한다. 이번 세션에서는 이 이동을 실행하지 않았다. 셸 구문 검사는 통과했다.
- 한국어: Apple SD Gothic Neo / AppleSDGothicNeo-SemiBold. 영문: Helvetica Neue. AppKit에서 설치를 확인했고 PPTX 미리보기에서 폰트 대체가 없었다. 글꼴은 임베드하지 않는다.
- 가상의 집중 앱 Focus를 주제로 6장 샘플을 만들었다. 텍스트 71개, 도형 26개이며 모두 편집 가능한 개체다. 실제 제품 성능이나 실적 데이터는 포함하지 않는다.
- `npm run build`, `npm run inspect`, `npm run preview`를 실행했다. ZIP CRC/XML, 슬라이드 수 6, 경계 및 텍스트 상자 겹침 검사를 통과했다.
- AppKit으로 6장 모두 렌더링하고 전체 미리보기에서 배치와 가독성을 확인했다. 최초 2번 슬라이드 설명 상자의 높이 초과를 수정하고 다시 렌더링했다. 최종 보고서에서 글자 높이 초과 0, 폰트 대체 0, 미지원 요소 0이다.
- Microsoft PowerPoint/LibreOffice/Keynote는 Applications에서 발견되지 않아 실제 프로그램의 열기 및 렌더링 검수는 수행하지 않았다. AppKit 결과는 해당 검수의 대체물이 아니다.
- Skill의 quick_validate.py는 PyYAML이 없어 실행하지 못했다. Ruby YAML로 frontmatter와 필수 이름/설명 필드를 확인하고 참조 파일 존재 여부 및 실제 제작·검수 경로를 확인했다.
- 기존 시상식 소스·데이터와 작업 중이던 다른 디자인 소스는 보존했다. 기존 생성 명령은 `npm run build:awards`로 유지했다.

결과: `output/apple_design_sample.pptx`, `output/apple_sample_preview/overview.png` 및 해당 폴더의 검수 보고서.
