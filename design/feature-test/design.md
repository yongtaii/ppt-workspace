# 기능 검증 샘플 디자인 규칙

PptxGenJS 기능 검증용 12장 발표(`src/build_feature_test.js`)에만 적용한다. 실행용 수치는 [theme.json](theme.json).

## 기준
- [Apple 기본 디자인](../apple/ppt-design.md)의 색·글꼴·여백을 그대로 이어받는다. 밝고 미니멀한 프리미엄 기업 발표 톤.
- 이 발표는 검증 대상이므로 기본 규칙에서 금지한 **그라데이션과 그림자를 예외로 허용**한다. 그라데이션은 `accent`·`soft`·`glow` 세 가지, 그림자는 `soft`·`lift` 두 단계만 쓴다.
- 강조색은 블루 0066CC 하나. 차트는 `chart` 팔레트 4색 순서대로, 증감은 positive/negative만 쓴다.

## 공통 그리드
- 16:9 (13.333 × 7.5in), 좌우 여백 0.72in, 카드 간격 0.25in.
- 모든 슬라이드: 상단 좌측 브랜드, 상단 우측 섹션, eyebrow(0.95in) → 제목(1.3in, 36pt) → 본문 영역 2.4–6.75in → 하단 바닥글(7.06in).
- 카드 라운드 0.16in, 작은 타일 0.12in. 배경은 화이트와 F5F5F7을 교차한다.

## 타이포그래피
- 한글 Apple SD Gothic Neo, 제목 AppleSDGothicNeo-SemiBold, 영문·숫자 강조 Helvetica Neue.
- hero 54 / title 36 / lead 22 / body 18 / small 14 / caption 11pt.

## 콘텐츠
- 기업명 Aster와 모든 수치는 가상이다. 바닥글과 발표자 노트에 "가상 데이터"를 표시한다.
- 시상식 슬라이드는 `input/awards_2026.json`의 자리표시자를 그대로 쓰고, 사진이 없으면 생성한 자리표시자 이미지를 쓴다.
- 텍스트·도형·차트·표는 편집 가능한 개체로 만든다. 사진과 SVG 아이콘만 이미지로 넣는다.
