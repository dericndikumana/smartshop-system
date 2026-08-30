import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true }
        })

        if (!user) return null

        if (user.status === "BLOCKED" || user.status === "INACTIVE") {
          throw new Error("Access denied. Your account is " + user.status.toLowerCase() + ".")
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          shopId: user.shopId,
          status: user.status
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.shopId = (user as any).shopId
        token.status = (user as any).status
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
})
