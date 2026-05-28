# next.js boilerplate

Minimal Next.js starter with Auth.js, Prisma, and shadcn-style UI components.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS v4
- Auth.js v5 with Google OAuth
- Prisma + PostgreSQL
- Base UI / shadcn-style components

## Getting Started

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`.
4. Optionally set `AUTH_SECRET` for a dedicated auth signing secret. If omitted, the app falls back to `AUTH_GOOGLE_SECRET`.
5. Run `pnpm prisma db push`.
6. Start the dev server with `pnpm dev`.

## Auth Setup

- Google sign-in starts at `/login`.
- Auth.js callbacks use `/api/auth/callback/google`.
- The auth configuration lives in [`lib/auth.ts`](./lib/auth.ts).

## Project Structure

- [`app/`](./app) - application routes
- [`components/ui/`](./components/ui) - UI primitives
- [`lib/`](./lib) - shared helpers and auth setup
- [`prisma/schema.prisma`](./prisma/schema.prisma) - Prisma schema
- [`proxy.ts`](./proxy.ts) - route protection proxy

## Notes

- If you change the Prisma schema, run `pnpm prisma generate`.
- If Google sign-in fails, confirm the OAuth redirect URI in Google Cloud Console matches your local or deployed URL.
