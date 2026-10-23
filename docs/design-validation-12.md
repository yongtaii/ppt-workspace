# FORM — PPT 디자인·기능 검증용 12장

2026-10-23 제작. PptxGenJS 4.0.1, 16:9, 밝은 기업 발표자료 스타일.

## 결과물

- 편집용 PPTX: `output/design_validation/form_design_validation_12.pptx`
- PDF: `output/design_validation/form_design_validation_12.pdf`
- 슬라이드 PNG: `output/design_validation/png/slide-01.png`–`slide-12.png` (각 1920×1080)
- 전체 미리보기: `output/design_validation/png/overview.png`
- PNG 압축: `output/design_validation/slide_pngs.zip`
- 로컬 웹 뷰어: `output/design_validation/web/index.html`
- 검수 보고서: `output/design_validation/validation_report.json`
- 브라우저 보고서: `output/design_validation/browser/browser_report.json`
- 범용 구조 검사: `output/design_validation/inspection/structural_report.json`

웹 뷰어는 실제 PPTX에서 렌더링한 PNG를 표시한다. 텍스트·도형·표·차트의 개별 편집은 PPTX에서 한다. 웹에서 PPTX·PDF·PNG·검수 보고서를 내려받을 수 있다. 방향키, 스와이프, F 전체화면, G 전체 슬라이드 보기, URL 해시 이동을 지원한다.

## 슬라이드 구성

| 장 | 검증 항목 | 실제 구현 |
|---|---|---|
| 01 | 기본 및 고급 도형 | 사각형·타원·라운드·육각형·셰브런·다이아몬드·도넛·별·구름 |
| 02 | 그라데이션·투명도·그림자 | 네이티브 선형 채우기, 0/35/70% 투명도, 외부 그림자 |
| 03 | 카드형·비대칭 레이아웃 | 큰 메시지 패널과 서로 다른 크기의 보조 카드 |
| 04 | 이미지 크롭·마스킹 | 동일 원본 JPEG에 직사각형·원형·둥근 모서리 마스크 |
| 05 | 타이포그래피 | 한글·영문·숫자, 크기·자간·행간, 문장 내부 리치 텍스트 |
| 06 | KPI 대시보드 | KPI 4개, 실적·목표 네이티브 선 차트 |
| 07 | 차트·표 | 네이티브 막대·도넛 차트, 5×3 표, Excel 통합 문서 내장 |
| 08 | 프로세스 다이어그램 | 셰브런 4단계, 화살표, 단계별 산출물과 책임 |
| 09 | 시스템 아키텍처 | 3계층 노드, 연결점이 지정된 네이티브 연결선 6개 |
| 10 | 타임라인 | 5개 마일스톤, 위·아래 교차 배치, 기간 막대 |
| 11 | SVG 아이콘 | 편집 가능한 자유형 아이콘 6개 + SVG 원본 1개 별도 삽입 |
| 12 | 시상식·인물 소개 | 가상 수상자, 교체 가능한 사진, 편집 가능한 메달 |

## 공통 디자인 시스템과 편집

`design/validation-system.json`이 색상·글꼴·크기·간격의 기준이다. 기존 Apple 기본 규칙을 바탕으로 블루, 슬레이트, 화이트, 연한 회색을 사용했다. 골드는 시상식 장에 한정했다. 효과 검증 요청에 따라 02장에서만 그라데이션·그림자를 사용한다.

PPTX에는 텍스트 206개, 도형 102개, 사진/SVG 이미지 5개, 차트 3개, 실제 표 1개, 연결선 6개가 있다. 자유형 아이콘 6개는 도형 수에 포함된다. 사진은 독립 이미지로 교체·크롭할 수 있고, 마스크와 원본 JPEG가 PPTX에 보존된다. SVG 원본은 이미지 개체이며, 위쪽 6개 아이콘은 점과 선을 편집할 수 있는 네이티브 자유형 도형이다. 슬라이드 전체를 이미지 한 장으로 평면화하지 않았다.

PptxGenJS가 직접 제공하지 않는 그라데이션과 자유형 SVG 경로 변환은 생성 후 JSZip으로 DrawingML 속성을 보완한다. 연결선은 실제 `p:cxnSp`이며 노드의 연결점 ID가 지정되어 있다. 생성 코드에 이 후처리가 포함되어 있다.

## 소스와 재생성

- PPTX 생성: `src/build_design_validation.js`
- 가상 데이터·사진 출처: `input/design_validation/data.json`
- 원본 사진·아이콘: `input/design_validation/assets/`
- 구조·기능 검증: `src/validate_design_validation.py`
- 렌더링 연결: `src/render_design_validation.js`
- PDF → PNG: `src/render_validation_pdf.swift`
- 웹 생성: `src/build_validation_web.js`
- 웹 검수: `src/check_validation_web.js`
- 사이트 소스: `src/design-validation-site/`

프로젝트 루트에서 실행한다. macOS, Python 3, Swift/PDFKit, LibreOffice가 필요하다.

```sh
npm run build:validation
npm run preview:validation
npm run inspect:validation
```

`preview:validation`은 실제 LibreOffice PDF 변환, PNG 생성, 기능·레이아웃 검수, PNG ZIP, 웹 빌드까지 수행한다. LibreOffice 기본 경로는 `/Applications/LibreOffice.app/Contents/MacOS/soffice`이다. 다른 위치면 `LIBREOFFICE_BIN` 환경 변수로 실행 파일을 지정한다. 이번 검수에서는 공식 LibreOffice 26.8.1 DMG를 작업용 임시 경로에 마운트하여 사용했으며 전역 설치하지 않았다.

LibreOffice headless가 macOS 시스템 글꼴을 찾도록 `design/validation-fontconfig.xml`을 사용한다. PPTX에 글꼴을 임베드하지 않았다. LibreOffice에서는 제목의 PostScript 이름을 Apple SD Gothic Neo 글꼴군으로 대응시키므로 PowerPoint와 굵기·줄바꿈이 다를 수 있다. PDF에 사용된 글꼴 이름은 검수 보고서에 기록했다.

브라우저 검수는 로컬 서버 `127.0.0.1:8771`, Chrome DevTools `127.0.0.1:9341`을 띄운 뒤 `npm run check:validation-web`로 실행한다.

## 검수 결과와 범위

- ZIP CRC, 전체 XML 파싱, 내부 파일 관계 확인.
- 12장과 16:9 비율, 그라데이션·그림자·투명도·마스크·표·차트·통합 문서·SVG·자유형 경로·연결점 구조 확인.
- 실제 OOXML의 323개 프레임 경계 검사 및 9개 정렬 그룹 검사 통과.
- 독립 텍스트 상자의 겹침 검사 통과. 카드 내부의 텍스트, 투명도 원, 메달과 사진 등 의도한 중첩은 오류로 처리하지 않았다.
- 실제 LibreOffice Impress에서 PPTX를 열고 PDF로 렌더링. 12장 모두 PNG 생성 후 육안 검수.
- 최종 PDF에서 독립 텍스트 206개가 모두 포함되는지 확인. 셰브런의 글자 대비 문제도 육안 확인 후 수정했다.
- 데스크톱 1440×1000, 모바일 390×844에서 12장 이미지 로딩·16:9·가로 넘침·키보드·해시·갤러리·끝 경계·검증 패널·전체화면 진입/해제·스와이프·다운로드·JS 오류 여부 검사 통과.
- Microsoft PowerPoint에서의 실제 열기·렌더링·대화형 편집 검수는 미수행.

범용 AppKit 미리보기는 고급 도형·차트·표·자유형·연결선을 완전히 지원하지 않는다. 따라서 AppKit 렌더링을 최종 PNG로 사용하지 않고, 범용 검수기는 구조 검사에만 사용했다. Keynote 자동화는 초기 대화상자에서 진행되지 않아 최종 검수 프로그램을 LibreOffice로 전환했다.

## 데이터와 사진

지표·일정·조직·인물 이름·수상 내역은 모두 가상 예시다. 사진 속 인물의 신원이나 실제 수상 내역을 주장하지 않는다.

- [사무실 사진 원본](https://images.unsplash.com/photo-1497366754035-f200968a6e72)
- [인물 사진 원본](https://images.unsplash.com/photo-1580489944761-15a19d654956)

이전 샘플과 사용자 입력·소스는 보존했다.

비공개 배포 완료: https://form-design-validation-12-ht.woollycrab12.chatgpt.site
