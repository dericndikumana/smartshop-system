import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Configured in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as import("next-auth").User
        token.id = u.id
        token.role = u.role
        token.shopId = u.shopId
        token.status = u.status
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.shopId = token.shopId as string | null
        session.user.status = token.status as string
      }
      return session
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig
