// lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

const googleClientId = process.env.AUTH_GOOGLE_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET

if (!googleClientId || !googleClientSecret) {
  throw new Error("AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are required")
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db as never),
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
})
