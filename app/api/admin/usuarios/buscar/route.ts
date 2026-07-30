import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')
  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ usuarios: [] })
  }

  const usuarios = await prisma.$queryRawUnsafe<Array<{ username: string }>>(
    `SELECT username FROM users
     WHERE username ILIKE $1 AND deleted_at IS NULL
     ORDER BY username ASC
     LIMIT 8`,
    `%${q}%`
  )

  return NextResponse.json({ usuarios: usuarios.map(u => u.username) })
}