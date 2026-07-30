import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { minecraft_username } = await req.json()

  await prisma.$queryRawUnsafe(
    `UPDATE users SET minecraft_username = $1, updated_at = NOW() WHERE id = $2`,
    minecraft_username || null,
    session.user.id
  )

  return NextResponse.json({ ok: true })
}