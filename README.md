# HANBOM GALLERY

학교 커뮤니티 웹사이트

## 기능

- 회원가입 / 로그인
- 공지사항 (관리자 전용)
- 자유게시판
- 질문답변 게시판
- 관리자 페이지 (회원 관리)

## 기술 스택

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Supabase (PostgreSQL)
- 인증: localStorage 기반

## 설치 및 실행

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. 다음 테이블 생성:
   - `users` (회원 정보)
   - `notice` (공지사항)
   - `free` (자유게시판)
   - `qna` (질문답변)

### 2. 환경 설정

```bash
# config.example.js를 config.js로 복사
cp config.example.js config.js

# config.js 파일을 열어 실제 Supabase URL과 API 키 입력
```

### 3. 실행

로컬 서버로 실행:
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server
```

브라우저에서 `http://localhost:8000` 접속

## 프로젝트 구조

```
├── index.html          # 메인 페이지
├── login.html          # 로그인
├── register.html       # 회원가입
├── admin.html          # 관리자 페이지
├── notice.html         # 공지사항
├── free.html           # 자유게시판
├── qna.html            # 질문답변
├── config.js           # Supabase 설정 (gitignore)
├── config.example.js   # 설정 예시
├── common.js           # 공통 함수
├── login.js            # 로그인 로직
├── register.js         # 회원가입 로직
├── admin.js            # 관리자 로직
├── index.js            # 메인 페이지 로직
├── notice.js           # 공지사항 로직
├── free.js             # 자유게시판 로직
├── qna.js              # 질문답변 로직
├── style.css           # 공통 스타일
├── login.css           # 로그인/회원가입 스타일
└── admin.css           # 관리자 스타일
```

## 보안 주의사항

⚠️ **중요**: 
- `config.js` 파일은 절대 Git에 커밋하지 마세요
- 실제 배포 시 환경변수 사용 권장
- 비밀번호 해싱 구현 필요 (현재 평문 저장)
- 서버 측 권한 검증 추가 필요

## 관리자 계정

기본 관리자 계정은 `id`가 "admin"인 사용자입니다.
회원가입 시 아이디를 "admin"으로 설정하면 자동으로 관리자 권한이 부여됩니다.

## 라이선스

MIT
