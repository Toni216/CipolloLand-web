import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { minecraft_username, bio, discord_username } = await req.json()

  if (bio && bio.length > 160) {
    return NextResponse.json({ error: 'La bio no puede superar 160 caracteres.' }, { status: 400 })
  }

await prisma.$queryRawUnsafe(
    `UPDATE users SET minecraft_username = $1, bio = $2, discord_username = $3, updated_at = NOW() WHERE id = $4`,
    minecraft_username || null,
    bio || null,
    discord_username || null,
    session.user.id
  )

  // Si hay estadísticas pendientes con este nick de Minecraft, las reclamamos
  if (minecraft_username) {
    await prisma.$queryRawUnsafe(
      `UPDATE estadisticas_jugador
       SET user_id = $1, minecraft_username_pendiente = NULL
       WHERE minecraft_username_pendiente = $2 AND user_id IS NULL`,
      session.user.id, minecraft_username
    )
  }

  return NextResponse.json({ ok: true })
}