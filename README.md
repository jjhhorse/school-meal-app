# 학교 급식 조회 앱

NEIS Open API를 이용해 학교를 검색하고, 선택한 학교의 월요일부터 금요일까지 중식 급식을 조회하는 React + Vite 앱입니다.

## 실행

```bash
npm install
npm run dev
```

## Windows 앱 만들기

```bash
npm run dist:win
```

생성된 설치 파일은 `release` 폴더에 만들어집니다. 설치 파일 하나만 다른 Windows 컴퓨터로 복사해 실행할 수 있습니다.

## 주요 기능

- 17개 시도교육청 선택
- NEIS `schoolInfo` 학교 검색
- 학교 행정표준코드 기반 급식 조회
- NEIS `mealServiceDietInfo` 월~금 중식 조회
- 조회 기준일 카드 강조
- Netlify 배포 지원

급식 조회에는 인터넷 연결이 필요합니다.
