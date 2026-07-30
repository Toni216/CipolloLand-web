import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const users = await prisma.$queryRawUnsafe<Array<{
          id: string
          email: string
          password_hash: string | null
          username: string
          rol: string
          deleted_at: Date | null
        }>>(
          `SELECT id, email, password_hash, username, rol, deleted_at
           FROM users
           WHERE email = $1
             AND deleted_at IS NULL
           LIMIT 1`,
          credentials.email
        )

        const user = users[0]
        if (!user || !user.password_hash) return null

        const passwordOk = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )
        if (!passwordOk) return null

        return {
          id:    user.id,
          email: user.email,
          name:  user.username,
          rol:   user.rol,
        }
      }
    })
  ],
})