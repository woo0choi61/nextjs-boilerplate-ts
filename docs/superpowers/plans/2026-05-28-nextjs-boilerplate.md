# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a production-ready, open-source Next.js 15 boilerplate with Tailwind v4, shadcn/ui, NextAuth v5 (Credentials + GitHub), Prisma + PostgreSQL, and a landing page + auth + dashboard flow.

**Architecture:** Route groups `(marketing)`, `(auth)`, and `(dashboard)` separate the three visual zones without affecting URLs. Auth state is JWT-based and protected by a single `middleware.ts`. UI is built from shadcn/ui primitives driven by a `siteConfig` object for easy customization.

**Tech Stack:** Next.js 15, Tailwind CSS v4, shadcn/ui, NextAuth v5 (Auth.js), Prisma, PostgreSQL, Zod, @t3-oss/env-nextjs, next-themes, bcryptjs, lucide-react

---

## File Map

```
src/
  app/
    layout.tsx                              ← root layout + ThemeProvider
    api/auth/[...nextauth]/route.ts         ← NextAuth handlers
    (marketing)/
      layout.tsx                            ← Header + Footer wrapper
      page.tsx                              ← landing page (Hero + Features)
    (auth)/
      layout.tsx                            ← centered card wrapper
      login/page.tsx                        ← login page shell
      register/page.tsx                     ← register page shell
    (dashboard)/
      layout.tsx                            ← session guard + Sidebar + DashboardHeader
      dashboard/page.tsx                    ← welcome page
  components/
    theme-provider.tsx                      ← next-themes wrapper
    theme-toggle.tsx                        ← dark/light toggle button
    layout/
      header.tsx                            ← marketing header (server component)
      footer.tsx                            ← marketing footer
      user-menu.tsx                         ← avatar dropdown (client)
      sidebar.tsx                           ← dashboard sidebar (client)
      dashboard-header.tsx                  ← dashboard top bar
    auth/
      login-form.tsx                        ← login form (client)
      register-form.tsx                     ← register form (client)
    ui/                                     ← shadcn auto-generated
  lib/
    auth.ts                                 ← NextAuth config + exports
    db.ts                                   ← Prisma client singleton
    validations.ts                          ← Zod schemas
    utils.ts                                ← shadcn cn() utility (auto-generated)
  actions/
    auth.ts                                 ← login + register server actions
  config/
    site.ts                                 ← site name, description, features
  types/
    next-auth.d.ts                          ← session type augmentation
  env.ts                                    ← @t3-oss/env-nextjs validation
  middleware.ts                             ← route protection
prisma/
  schema.prisma                             ← User + NextAuth adapter tables
  seed.ts                                   ← test user seed
.env.example
.env.local                                  ← created by developer, not committed
next.config.ts
README.md
```

---

## Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx` (temporary, deleted in Task 13)

- [ ] **Step 1: Run create-next-app in current directory**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted for project name, it will detect `.` as current directory — confirm.

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:3000`, no errors in terminal. Stop with `Ctrl+C`.

- [ ] **Step 3: Commit initial scaffold**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 15 project"
```

---

## Task 2: Install additional dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install next-auth@beta @auth/prisma-adapter @prisma/client zod @t3-oss/env-nextjs next-themes lucide-react bcryptjs
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma @types/bcryptjs tsx prettier eslint-config-prettier prettier-plugin-tailwindcss
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Also add `"prettier"` to the `"extends"` array in `.eslintrc.json` (or `eslint.config.mjs` depending on what create-next-app generated):

If `.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals", "next/typescript", "prettier"]
}
```

If `eslint.config.mjs`, add `eslintConfigPrettier` to the config array:
```bash
# install the flat config compat version
npm install -D eslint-config-prettier
```
Then in `eslint.config.mjs`:
```js
import prettier from "eslint-config-prettier"
// add `prettier` as the last item in the default export array
```

- [ ] **Step 4: Initialize Prisma**

```bash
npx prisma init
```

Expected: creates `prisma/schema.prisma` and `.env` file.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (or only "cannot find module" errors for files not yet created — acceptable at this stage).

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: install dependencies, initialize Prisma, add Prettier config"
```

---

## Task 3: Initialize shadcn/ui and add components

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/*`

- [ ] **Step 1: Run shadcn init**

```bash
npx shadcn@latest init -d
```

The `-d` flag uses defaults (style: default, base color: slate, CSS variables: yes). If it asks for the CSS file path, enter `src/app/globals.css`.

- [ ] **Step 2: Add required shadcn components**

```bash
npx shadcn@latest add button card input label avatar dropdown-menu sheet separator
```

Expected: components appear in `src/components/ui/`.

- [ ] **Step 3: Verify dev server still works**

```bash
npm run dev
```

Expected: starts without errors. Stop with `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize shadcn/ui and add base components"
```

---

## Task 4: Set up environment variables

**Files:**
- Create: `.env.example`, `src/env.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create `.env.example`**

```
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
NEXTAUTH_SECRET=your-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

- [ ] **Step 2: Create `.env.local` for development** (not committed)

Copy `.env.example` to `.env.local` and fill in real values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
- `DATABASE_URL`: your local PostgreSQL URL
- `NEXTAUTH_SECRET`: run `openssl rand -base64 32` and paste the output
- `NEXTAUTH_URL`: `http://localhost:3000`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: create a GitHub OAuth App at https://github.com/settings/developers (callback URL: `http://localhost:3000/api/auth/callback/github`)

- [ ] **Step 3: Create `src/env.ts`**

```ts
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url().optional(),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },
})
```

- [ ] **Step 4: Update `next.config.ts` to validate env at build time**

```ts
import "./src/env"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {}

export default nextConfig
```

- [ ] **Step 5: Ensure `.env.local` is gitignored**

Check `.gitignore` already contains `.env.local` (create-next-app adds it). If not, add it.

- [ ] **Step 6: Commit**

```bash
git add .env.example src/env.ts next.config.ts .gitignore
git commit -m "feat: add environment variable validation with t3-env"
```

---

## Task 5: Set up Prisma schema and DB client

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
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

- [ ] **Step 2: Create `src/lib/db.ts`**

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 3: Generate Prisma client**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client` message.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma src/lib/db.ts
git commit -m "feat: add Prisma schema and DB client singleton"
```

---

## Task 6: Set up NextAuth v5

**Files:**
- Create: `src/types/next-auth.d.ts`, `src/lib/validations.ts`, `src/lib/auth.ts`

- [ ] **Step 1: Create `src/types/next-auth.d.ts`**

```ts
import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
```

- [ ] **Step 2: Create `src/lib/validations.ts`**

```ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  email: z.string().email("유효한 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

- [ ] **Step 3: Create `src/lib/auth.ts`**

```ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { env } from "@/env"
import { loginSchema } from "@/lib/validations"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password)
        if (!passwordMatch) return null

        return user
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    jwt({ token, user }) {
      if (user) token.sub = user.id
      return token
    },
  },
})
```

- [ ] **Step 4: Verify TypeScript types compile**

```bash
npx tsc --noEmit
```

Expected: no type errors in the new files.

- [ ] **Step 5: Commit**

```bash
git add src/types src/lib/auth.ts src/lib/validations.ts
git commit -m "feat: configure NextAuth v5 with Credentials and GitHub providers"
```

---

## Task 7: Create API route and middleware

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`

- [ ] **Step 1: Create `src/app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 2: Create `src/middleware.ts`**

```ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isAuthRoute = pathname === "/login" || pathname === "/register"

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api src/middleware.ts
git commit -m "feat: add NextAuth API route and route-protection middleware"
```

---

## Task 8: Create auth Server Actions

**Files:**
- Create: `src/actions/auth.ts`

- [ ] **Step 1: Create `src/actions/auth.ts`**

```ts
"use server"

import { signIn } from "@/lib/auth"
import { db } from "@/lib/db"
import { registerSchema, loginSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

export async function login(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "이메일 또는 비밀번호가 올바르지 않습니다" }
    }
    throw error
  }
}

export async function register(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = registerSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existingUser) {
    return { error: "이미 사용 중인 이메일입니다" }
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10)

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    },
  })

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/actions/auth.ts
git commit -m "feat: add login and register server actions"
```

---

## Task 9: Create site config

**Files:**
- Create: `src/config/site.ts`

- [ ] **Step 1: Create `src/config/site.ts`**

```ts
export const siteConfig = {
  name: "My App",
  description: "A modern Next.js boilerplate with authentication and database.",
  url: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  features: [
    {
      title: "인증",
      description: "NextAuth v5로 안전하고 쉬운 로그인. 소셜 로그인(GitHub) 포함.",
      icon: "Shield",
    },
    {
      title: "데이터베이스",
      description: "Prisma ORM + PostgreSQL로 타입 안전한 DB 접근.",
      icon: "Database",
    },
    {
      title: "UI 컴포넌트",
      description: "shadcn/ui + Tailwind CSS로 다크모드 지원 인터페이스.",
      icon: "Palette",
    },
  ],
} as const
```

- [ ] **Step 2: Commit**

```bash
git add src/config/site.ts
git commit -m "feat: add site config for centralized content management"
```

---

## Task 10: Add theme support

**Files:**
- Create: `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`

- [ ] **Step 1: Install next-themes** (already installed in Task 2, verify it's in package.json)

```bash
npm ls next-themes
```

Expected: `next-themes@x.x.x` listed.

- [ ] **Step 2: Create `src/components/theme-provider.tsx`**

```tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

- [ ] **Step 3: Create `src/components/theme-toggle.tsx`**

```tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">테마 변경</span>
    </Button>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/theme-provider.tsx src/components/theme-toggle.tsx
git commit -m "feat: add ThemeProvider and ThemeToggle components"
```

---

## Task 11: Update root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `src/app/layout.tsx` content**

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/config/site"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wrap root layout with ThemeProvider"
```

---

## Task 12: Create shared layout components

**Files:**
- Create: `src/components/layout/user-menu.tsx`, `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`

- [ ] **Step 1: Create `src/components/layout/user-menu.tsx`**

```tsx
"use client"

import { signOut } from "next-auth/react"
import { type User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  user: Pick<User, "name" | "email" | "image">
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-8 w-8">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
          <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/header.tsx`**

```tsx
import Link from "next/link"
import { auth } from "@/lib/auth"
import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/register">시작하기</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create `src/components/layout/footer.tsx`**

```tsx
import { siteConfig } from "@/config/site"

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Header, Footer, and UserMenu layout components"
```

---

## Task 13: Create marketing route group (landing page)

**Files:**
- Delete: `src/app/page.tsx` (default from create-next-app)
- Create: `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`

- [ ] **Step 1: Delete the default `src/app/page.tsx`**

```bash
rm src/app/page.tsx
```

(On Windows PowerShell: `Remove-Item src/app/page.tsx`)

- [ ] **Step 2: Create `src/app/(marketing)/layout.tsx`**

```tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/(marketing)/page.tsx`**

```tsx
import Link from "next/link"
import { Shield, Database, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/config/site"

const iconMap = { Shield, Database, Palette }

export default function HomePage() {
  return (
    <>
      <section className="container mx-auto flex flex-col items-center gap-6 px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">시작하기</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub 보기
            </a>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {siteConfig.features.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap]
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 4: Start dev server and verify landing page renders at `http://localhost:3000`**

```bash
npm run dev
```

Expected: landing page with Hero + 3 feature cards visible. Header shows "로그인" and "시작하기" buttons. Stop with `Ctrl+C`.

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: add landing page with Hero and Features sections"
```

---

## Task 14: Create auth form components

**Files:**
- Create: `src/components/auth/login-form.tsx`, `src/components/auth/register-form.tsx`

- [ ] **Step 1: Create `src/components/auth/login-form.tsx`**

```tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/actions/auth"

export function LoginForm() {
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(undefined)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">또는</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      >
        GitHub으로 로그인
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create `src/components/auth/register-form.tsx`**

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/actions/auth"

export function RegisterForm() {
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(undefined)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">이름</Label>
        <Input id="name" name="name" type="text" placeholder="홍길동" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" name="password" type="password" placeholder="8자 이상" required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "가입 중..." : "회원가입"}
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/
git commit -m "feat: add LoginForm and RegisterForm client components"
```

---

## Task 15: Create auth route group (login + register pages)

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create `src/app/(auth)/layout.tsx`**

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/(auth)/login/page.tsx`**

```tsx
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>이메일과 비밀번호로 로그인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center text-sm">
        계정이 없으신가요?{" "}
        <Link href="/register" className="ml-1 underline">
          회원가입
        </Link>
      </CardFooter>
    </Card>
  )
}
```

- [ ] **Step 3: Create `src/app/(auth)/register/page.tsx`**

```tsx
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>새 계정을 만들어 시작하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="justify-center text-sm">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="ml-1 underline">
          로그인
        </Link>
      </CardFooter>
    </Card>
  )
}
```

- [ ] **Step 4: Verify auth pages render**

```bash
npm run dev
```

Navigate to `http://localhost:3000/login` and `http://localhost:3000/register`. Both should show a centered Card with the respective forms. Stop with `Ctrl+C`.

- [ ] **Step 5: Commit**

```bash
git add src/app/(auth)/
git commit -m "feat: add login and register pages"
```

---

## Task 16: Create dashboard components

**Files:**
- Create: `src/components/layout/sidebar.tsx`, `src/components/layout/dashboard-header.tsx`

- [ ] **Step 1: Create `src/components/layout/sidebar.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "홈", icon: Home },
  { href: "/dashboard/settings", label: "설정", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r bg-muted/40 md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6 font-bold text-lg">
        My App
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              pathname === href && "bg-accent font-medium"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/dashboard-header.tsx`**

```tsx
import { type User } from "next-auth"
import { UserMenu } from "@/components/layout/user-menu"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-end border-b px-6">
      <UserMenu user={user} />
    </header>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx src/components/layout/dashboard-header.tsx
git commit -m "feat: add Sidebar and DashboardHeader components"
```

---

## Task 17: Create dashboard route group

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create `src/app/(dashboard)/layout.tsx`**

```tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/(dashboard)/dashboard/page.tsx`**

```tsx
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">
        안녕하세요, {session?.user?.name ?? "사용자"}님!
      </h1>
      <p className="text-muted-foreground">
        {session?.user?.email}으로 로그인하셨습니다.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/
git commit -m "feat: add dashboard layout with session guard and welcome page"
```

---

## Task 18: Add DB scripts and seed file

**Files:**
- Modify: `package.json`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Add DB scripts to `package.json`**

In the `"scripts"` section, add:

```json
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:push": "prisma db push",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"
```

Also add a top-level `"prisma"` field (at the same level as `"scripts"`):

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("password", 10)

  await db.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "테스트 유저",
      email: "test@example.com",
      password: hashedPassword,
    },
  })

  console.log("Seed complete: test@example.com / password")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
```

- [ ] **Step 3: Commit**

```bash
git add package.json prisma/seed.ts
git commit -m "feat: add DB helper scripts and test user seed"
```

---

## Task 19: Run database migration and seed

**Files:** (no file changes — DB state only)

- [ ] **Step 1: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected output:
```
✔ Generated Prisma Client
The following migration(s) have been created and applied:
migrations/
  └─ 20260528000000_init/
    └─ migration.sql
```

If PostgreSQL is not running, start it first. If connection fails, check `DATABASE_URL` in `.env.local`.

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected: `Seed complete: test@example.com / password`

- [ ] **Step 3: Verify end-to-end auth flow**

```bash
npm run dev
```

1. Go to `http://localhost:3000` — landing page renders
2. Click "로그인" → `/login` page renders
3. Enter `test@example.com` / `password` → redirects to `/dashboard`
4. Dashboard shows user name and email
5. Click avatar → dropdown shows → click "로그아웃" → back to `/`
6. Try visiting `http://localhost:3000/dashboard` while logged out → redirects to `/login`

Stop with `Ctrl+C`.

---

## Task 20: Write README.md

**Files:**
- Create: `README.md` (replace default)

- [ ] **Step 1: Write `README.md`**

```markdown
# Next.js Boilerplate

A minimal, production-ready Next.js 15 starter with authentication and database.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Auth:** NextAuth v5 (Credentials + GitHub OAuth)
- **Database:** PostgreSQL + Prisma ORM
- **Validation:** Zod + @t3-oss/env-nextjs

## Getting Started

### 1. Clone and install

\`\`\`bash
git clone <your-repo>
cd <your-repo>
npm install
\`\`\`

### 2. Configure environment

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random string (run `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` for local) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |

To create a GitHub OAuth App: https://github.com/settings/developers  
Set callback URL to: `http://localhost:3000/api/auth/callback/github`

### 3. Set up the database

\`\`\`bash
npm run db:migrate    # run migrations
npm run db:seed       # create test user
\`\`\`

Test credentials: `test@example.com` / `password`

### 4. Start the dev server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

\`\`\`
src/
  app/
    (marketing)/      # Landing page (/)
    (auth)/           # /login, /register
    (dashboard)/      # /dashboard (protected)
  components/
    auth/             # LoginForm, RegisterForm
    layout/           # Header, Sidebar, Footer, etc.
    ui/               # shadcn/ui components
  lib/
    auth.ts           # NextAuth config
    db.ts             # Prisma client
    validations.ts    # Zod schemas
  actions/
    auth.ts           # Server Actions
  config/
    site.ts           # Edit site name, description, features here
prisma/
  schema.prisma
  seed.ts
\`\`\`

## Customization

Edit `src/config/site.ts` to change the site name, description, and landing page features.

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
```

---

## Task 21: Final type check and cleanup

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: no errors. If errors appear, fix them before proceeding.

- [ ] **Step 2: Run ESLint**

```bash
npm run lint
```

Expected: no errors. Fix any lint errors.

- [ ] **Step 3: Final dev server smoke test**

```bash
npm run dev
```

Check all routes:
- `http://localhost:3000` — landing page ✓
- `http://localhost:3000/login` — login form ✓
- `http://localhost:3000/register` — register form ✓
- `http://localhost:3000/dashboard` (logged out) — redirects to `/login` ✓
- Login with `test@example.com` / `password` → dashboard ✓
- Logout → back to `/` ✓

Stop with `Ctrl+C`.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: finalize boilerplate — type check and lint pass"
```
```
