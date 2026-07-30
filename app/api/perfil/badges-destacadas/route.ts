import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { badgeIds } = await req.json() as { badgeIds: string[] }

  if (!Array.isArray(badgeIds) || badgeIds.length > 5) {
    return NextResponse.json({ error: 'Máximo 5 insignias destacadas.' }, { status: 400 })
  }

  // Desmarcamos todas las tuyas, y volvemos a marcar solo las elegidas
  await prisma.$queryRawUnsafe(
    `UPDATE user_badges SET destacada = false WHERE user_id = $1`,
    session.user.id
  )

  if (badgeIds.length > 0) {
    await prisma.$queryRawUnsafe(
      `UPDATE user_badges SET destacada = true
       WHERE user_id = $1 AND badge_id = ANY($2::uuid[])`,
      session.user.id, badgeIds
    )
  }

  return NextResponse.json({ ok: true })
}