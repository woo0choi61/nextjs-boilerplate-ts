# Next.js Boilerplate — Design Spec

**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

오픈소스 공유용 Next.js 보일러플레이트. 새 프로젝트를 시작할 때 즉시 가져다 쓸 수 있는 최소한의 완전한 기반을 제공한다. 과도한 추상화 없이 이해하기 쉬운 구조를 목표로 한다.

---

## Tech Stack

| 역할 | 라이브러리 | 버전 |
|---|---|---|
| 프레임워크 | Next.js (App Router) | 15 |
| 스타일 | Tailwind CSS | v4 |
| UI 컴포넌트 | shadcn/ui | latest |
| 인증 | NextAuth (Auth.js) | v5 |
| ORM | Prisma | latest |
| DB | PostgreSQL | - |
| 검증 | Zod | latest |
| 환경변수 검증 | @t3-oss/env-nextjs | latest |
| Dark mode | next-themes | latest |

---

## Folder Structure

```
src/
  app/
    (marketing)/
      page.tsx              ← 랜딩 페이지
      layout.tsx
    (auth)/
      login/page.tsx
      register/page.tsx
      layout.tsx
    (dashboard)/
      dashboard/page.tsx    ← 기본 대시보드 예시 페이지
      layout.tsx            ← 세션 체크 + 사이드바 레이아웃
  components/
    ui/                     ← shadcn 자동 생성 컴포넌트
    layout/
      header.tsx
      sidebar.tsx
      footer.tsx
  lib/
    auth.ts                 ← NextAuth config
    db.ts                   ← Prisma client singleton
    validations.ts          ← Zod 스키마 (로그인, 회원가입)
  actions/
    auth.ts                 ← 로그인/회원가입 Server Actions
  config/
    site.ts                 ← 사이트 메타데이터, 피처 목록
  env.ts                    ← @t3-oss/env-nextjs 환경변수 검증
prisma/
  schema.prisma
  seed.ts
.env.example
README.md
```

---

## Authentication

### Strategy

- 세션 방식: JWT (Vercel Edge 환경에 적합, DB 세션 불필요)
- 미들웨어(`middleware.ts`)로 `(dashboard)` 라우트 전체 보호 — 미인증 시 `/login` 리다이렉트

### Providers

1. **Credentials Provider** — 이메일 + 비밀번호 (bcrypt 해시 저장)
2. **GitHub OAuth Provider** — 소셜 로그인 예시

### Prisma Schema (NextAuth 호환)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### Auth Pages

- `/login` — shadcn `<Card>` + 이메일/비밀번호 폼 + GitHub 소셜 버튼
- `/register` — 이메일/이름/비밀번호 폼
- 입력 검증: Zod 스키마 → Server Action에서 처리

---

## Landing Page

### Sections

1. **Header** — 로고, 네비게이션, "로그인" + "시작하기" 버튼
2. **Hero** — 제목, 부제목, CTA 버튼 2개 (시작하기 / GitHub 보기)
3. **Features** — 3개 카드 (shadcn `<Card>`, 아이콘 + 제목 + 설명)
4. **Footer** — 링크, 저작권

### Site Config

`src/config/site.ts` 파일 하나에서 텍스트 콘텐츠를 중앙 관리한다.

```ts
export const siteConfig = {
  name: "My App",
  description: "A Next.js boilerplate with auth and database.",
  url: "https://example.com",
  features: [
    { title: "인증", description: "NextAuth v5로 안전한 로그인", icon: "Shield" },
    { title: "데이터베이스", description: "Prisma + PostgreSQL", icon: "Database" },
    { title: "UI", description: "shadcn/ui + Tailwind CSS", icon: "Palette" },
  ],
}
```

### Dark Mode

`next-themes` + shadcn 테마 토글 버튼. Header에 포함.

---

## Dashboard

### Layout

- `(dashboard)/layout.tsx` — 서버 컴포넌트에서 `auth()` 호출, 세션 없으면 `redirect("/login")`
- 좌측 Sidebar + 상단 Header(유저 아바타, 로그아웃)
- 모바일: Sidebar → shadcn `<Sheet>` 드로어로 전환

### Example Page

`/dashboard` — 로그인한 유저 이름/이메일 표시, 환영 메시지.

---

## Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

`src/env.ts`에서 `@t3-oss/env-nextjs`로 빌드 타임에 검증. 누락 시 빌드 실패.

---

## Developer Experience

- `.env.example` — 모든 환경변수 키 포함 (값은 비워둠)
- `prisma/seed.ts` — 테스트용 유저 1명 (`test@example.com` / `password`)
- `README.md` — 시작 가이드 (clone → env 설정 → `prisma migrate dev` → `npm run dev`)
- ESLint + Prettier 기본 설정 포함

---

## Out of Scope

다음은 이 보일러플레이트에 포함하지 않는다:

- 이메일 발송 (Resend 등)
- 결제 (Stripe)
- 테스트 코드
- CI/CD 파이프라인
- Docker
