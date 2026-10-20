# PPT 작업 공통 규칙

## 지침 적용

- 기본 원칙, 디자인, 제작, 검증 기준은 [AGENT.md](AGENT.md)를 따른다. 이 파일에는 프로젝트 경로와 실행 규칙을 둔다.
- PPT 작업 시 `.agents/skills/my-ppt-designer/SKILL.md`를 확인한다. 설치 전 임시 위치인 `my-ppt-designer/SKILL.md`가 있으면 그 파일을 사용한다.
- 사용자 지정 문구, 데이터 및 원본 자료를 보존한다. 사실 확인이 필요한 수치와 인용은 출처를 확인한다.

## 프로젝트 구조

- `.agents/skills/my-ppt-designer/`: 재사용할 제작 프로세스, 범용 검수 스크립트, 공통 리소스
- `src/`: 발표별 PPT 생성 코드와 프로젝트 실행 연결 코드
- `design/`: 발표별 디자인 규칙 및 레퍼런스
- `input/`: 발표별 원고, 데이터, 사진
- `output/`: 생성한 PPTX, 미리보기, 검수 보고서
- `docs/`: 프로젝트 구조 변경 및 테스트 기록

Skill 설치 경로를 쓰지 못하면 임시 위치를 유지하고 제한을 보고한다. 로컬 터미널에서 `bash src/finalize_skill_layout.sh`로 최종 위치로 이동할 수 있다. 발표별 코드와 데이터는 Skill 이동과 함께 옮기지 않는다.

## 실행 및 검수

- 프로젝트 루트에서 `npm run build`, `npm run inspect`, `npm run preview`를 사용한다.
- 다른 PPTX는 `node src/preview.js <파일.pptx> --out-dir <미리보기 폴더>`로 검수한다. 경로 인자는 호출한 현재 디렉터리 기준이다.
- 기본 슬라이드 비율은 별도 지정이 없으면 16:9로 한다.
- 자체 AppKit 미리보기, ZIP/XML 무결성 확인, 실제 PowerPoint/LibreOffice에서의 열기 및 렌더링을 구분해 보고한다. 실제 프로그램으로 확인하지 않았다면 검수 완료로 표현하지 않는다.
- 생성물 삭제를 요청받으면 PPTX, 미리보기, 중간 생성물과 검수 산출물을 정리하되 입력·디자인·소스·지침은 보존한다.
