# TripZone Demo

TripZone는 숙소 탐색/예약/문의 흐름을 빠르게 시연할 수 있도록 만든 여행 숙소 예약 데모 프로젝트입니다.  
사용자/판매자/관리자 역할 기반 화면과 지도 중심 숙소 탐색 UI를 포함합니다.

## Demo Scope

- 사용자: 숙소 검색, 상세 조회, 예약, 내 예약/내 문의
- 판매자: 숙소 관리, 예약 현황, 문의 확인
- 관리자: 사용자/판매자/문의 목록 확인
- 인증: 이메일 로그인/회원가입 + 소셜 버튼 UI(데모 동작)

## Tech Stack

- Frontend: React + Vite + React Router + Axios + Leaflet
- Mock API: json-server
- Backend (준비/구현): Spring Boot (Maven, Java 17)

## Project Structure

```text
trip-demo/
├── backend/
│   └── tripzone-backend/      # Spring Boot API
│       ├── pom.xml
│       └── src/main/java/com/tripzone/
│           ├── config/        # Security & Web configuration
│           ├── controller/    # REST API endpoints
│           ├── domain/        # JPA Entities
│           ├── dto/           # Data Transfer Objects
│           ├── repository/    # Spring Data JPA Repositories
│           └── service/       # Business logic layer
└── frontend/                  # React demo app
    ├── package.json
    ├── mock/                  # json-server db/routes
    ├── public/                # Static assets
    └── src/
        ├── api/               # API integration (Axios calls)
        ├── components/        # Reusable UI components
        ├── constants/         # Role/Type constants
        ├── hooks/             # Custom React hooks
        ├── pages/             # Page components by role
        ├── router/            # React Router configuration
        ├── store/             # Global state
        └── styles/            # Design tokens
```

## Quick Start (Demo)

### 1) Frontend install

```bash
cd frontend
npm install
```

### 2) Mock API run (json-server)

```bash
npm run mock
```

### 3) Frontend run

```bash
npm run dev
```

기본적으로 Vite proxy를 통해 `/api` 요청이 mock 서버로 전달됩니다.
정적 참고 페이지도 같은 dev 서버에서 함께 열립니다.

- 메인 앱: `http://localhost:5173`
- 웹 프레젠테이션(기존): `http://localhost:5173/presentation/index.html`
- 웹 프레젠테이션(최종): `http://localhost:5173/presentation/TripZone_presentation_FINAL.html`
- DB ERD (Clean): `http://localhost:5173/presentation/TripZone_ERD_Clean.html`
- DB 스키마 대시보드: `http://localhost:5173/schema/index.html`
- 설계 문서 허브: `http://localhost:5173/presentation/design-reference/usecases.html`

## Build Check

```bash
cd frontend
npm run build
```

## Demo Accounts

- User: `user@test.com` / `1234`
- Seller: `seller@test.com` / `1234`
- Admin: `admin@test.com` / `1234`

## Notes

- 소셜 로그인 버튼은 현재 **실제 OAuth 연동이 아닌 데모 UI/동작**입니다.
- 데이터 저장/수정/삭제는 json-server 기준으로 동작합니다.
- 운영 배포 전에는 실제 인증/권한/백엔드 API 정합성 점검이 필요합니다.

## Presentation & References

- 웹 프레젠테이션(기존): `http://localhost:5173/presentation/index.html`
- 웹 프레젠테이션(최종): `http://localhost:5173/presentation/TripZone_presentation_FINAL.html`
- DB ERD (Clean): `http://localhost:5173/presentation/TripZone_ERD_Clean.html`
- DB 스키마 대시보드: `http://localhost:5173/schema/index.html`

## Recent Frontend Updates

- 사용자 혜택 흐름 확장: 등급, 쿠폰함, 포인트함, 출석체크 UI와 mock 동작 추가
- 프로모션/이벤트 분리: 쿠폰팩 성격의 프로모션과 참여형 이벤트를 별도 페이지로 구성
- 서비스 확장 화면 추가: 해외숙소, 패키지, 항공, 항공+숙소, 레저, 렌터카, 공간대여 결과형 페이지 구현
- 찜 기능 프론트 연결: 메인/목록/상세/찜목록 연동 및 localStorage 기반 저장
- 숙소 상세 고도화: 리뷰 섹션 1차 구현, 별점/이미지 첨부 UI 및 mock 리뷰 등록/삭제 추가
- 관리자/판매자 화면 정리: 공통 테이블, KPI 카드, 모바일 대응, 로딩/빈 상태 패턴 정리
- 공통 UX 개선: 헤더/푸터/라우팅/hover 상태/SPA 이동/코드 스플리팅 정리
- 문서/참고 페이지 정리:
  - `doc/project-structure-spec.md`
  - `doc/db-schema-reference.md`
  - `doc/lodging-review-plan.md`
  - `frontend/public/presentation/index.html`
  - `frontend/public/presentation/TripZone_presentation_FINAL.html`
  - `frontend/public/presentation/TripZone_ERD_Clean.html`
  - `frontend/public/schema/index.html`
