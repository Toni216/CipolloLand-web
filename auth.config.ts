import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id  = user.id
        token.rol = (user as any).rol
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id  = token.id as string
        session.user.rol = token.rol as string
      }
      return session
    }
  },
  providers: []
}