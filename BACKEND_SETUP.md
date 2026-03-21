# Backend Setup Guide

## 목표

- 로컬 개발은 H2로 빠르게 시작한다.
- 실제 연동 전환은 Spring Boot + Oracle DB 기준으로 맞춘다.
- 프론트 API 경로 `/api/v1/...` 는 유지한다.

## 팀원 공유용 빠른 실행 요약

### 백엔드만 먼저 확인할 때

```bash
cd backend/tripzone-backend
cp .env.example .env
./mvnw test
./mvnw spring-boot:run
```

### 프론트까지 같이 띄울 때

```bash
cd frontend
npm install
npm run mock
npm run dev
```

### 기본 연결 기준

- 프론트: `http://localhost:5173`
- 백엔드: `http://localhost:8080`
- API 경로: `/api/v1/...`
- 기본 프로필: `local`
- 로컬 DB: `H2 in-memory`

## 현재 기본 구성

- 백엔드 경로: `backend/tripzone-backend`
- 빌드 도구: Maven Wrapper
- 기본 프로필: `local`
- 로컬 DB: H2 in-memory
- 실DB 전환 프로필: `oracle`

## 처음 실행

```bash
cd backend/tripzone-backend
cp .env.example .env
./mvnw test
./mvnw spring-boot:run
```

## 환경변수 파일

- 예시 파일: `backend/tripzone-backend/.env.example`
- 실제 로컬값: `backend/tripzone-backend/.env`

기본 예시:

```env
SPRING_PROFILES_ACTIVE=local
SERVER_PORT=8080
SESSION_COOKIE_NAME=TRIPZONESESSION
SESSION_COOKIE_SAME_SITE=Lax
SESSION_COOKIE_SECURE=false
SESSION_TIMEOUT=30m
CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:5173,http://localhost:5174
JPA_SHOW_SQL=true
JPA_FORMAT_SQL=true
JPA_DDL_AUTO=update
JPA_OPEN_IN_VIEW=false
JPA_DEFAULT_BATCH_FETCH_SIZE=100
DB_DRIVER_CLASS_NAME=oracle.jdbc.OracleDriver
DB_URL=jdbc:oracle:thin:@localhost:1521/FREEPDB1
DB_USERNAME=tripzone
DB_PASSWORD=tripzone
DB_SCHEMA=TRIPZONE
JPA_DATABASE_PLATFORM=org.hibernate.dialect.OracleDialect
```

## 프로필 구조

- `application.properties`
  - 공통 설정
  - `.env` import
  - 세션/CORS/JPA 공통값
- `application-local.properties`
  - H2 메모리 DB
  - 로컬 테스트/부트 확인용
- `application-oracle.properties`
  - Oracle 연결용
  - `.env` 값 사용

## Oracle DB 전환 순서

1. `.env` 에서 프로필을 `oracle` 로 변경
2. `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA` 입력
3. Oracle 계정/권한 확인
4. `./mvnw test` 또는 `./mvnw spring-boot:run` 실행
5. 프론트 proxy 또는 배포 env 에서 백엔드 주소 연결

예시:

```env
SPRING_PROFILES_ACTIVE=oracle
DB_URL=jdbc:oracle:thin:@localhost:1521/FREEPDB1
DB_USERNAME=tripzone
DB_PASSWORD=tripzone
DB_SCHEMA=TRIPZONE
```

## Oracle 주의사항

- 현재 엔티티 PK 전략은 `GenerationType.IDENTITY`
- Oracle 12c+ identity column 기준이면 그대로 사용 가능
- 시퀀스 기반으로 갈 경우 엔티티 PK 전략을 함께 수정해야 함
- enum 문자열은 프론트 상수와 맞춰 유지하는 편이 안전함
- API 응답 필드의 `userId`, `lodgingId`, `bookingId`, `inquiryId` 계약을 먼저 유지하는 게 중요함

## 프론트 연동 기준

- 프론트는 `/api/v1/...` 경로를 사용함
- 인증은 세션 쿠키 기반
- axios 는 `withCredentials=true`
- 따라서 JWT를 급하게 추가하기보다 세션 인증을 먼저 안정화하는 편이 효율적임

## 자주 쓰는 명령

```bash
cd backend/tripzone-backend
./mvnw test
./mvnw spring-boot:run
./mvnw clean
```

## 현재 검증 상태

- `mvn test` 통과
- active profile: `local`
- H2 console: `/h2-console`

## 관련 파일

- `backend/tripzone-backend/pom.xml`
- `backend/tripzone-backend/.env.example`
- `backend/tripzone-backend/src/main/resources/application.properties`
- `backend/tripzone-backend/src/main/resources/application-local.properties`
- `backend/tripzone-backend/src/main/resources/application-oracle.properties`
