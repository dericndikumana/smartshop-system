import NextAuth, { CredentialsSignin } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"
import { authConfig } from "./auth.config"

class SuspendedError extends CredentialsSignin {
  code = "suspended"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
          include: { role: true, shop: true }
        })

        if (!user) throw new CredentialsSignin()

        if (user.status === "BLOCKED" || user.status === "INACTIVE" || user.shop?.status === "BLOCKED") {
          throw new SuspendedError()
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) throw new CredentialsSignin()

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          shopId: user.shopId,
          status: user.status,
          language: user.language
        }
      }
    })
  ]
})
