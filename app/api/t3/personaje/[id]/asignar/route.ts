import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')

  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { username } = await req.json()

  const usuarios = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL LIMIT 1`,
    username
  )
  const nuevoDuenoId = usuarios[0]?.id
  if (!nuevoDuenoId) {
    return NextResponse.json({ error: 'Jugador no encontrado.' }, { status: 404 })
  }

  const personajes = await prisma.$queryRawUnsafe<Array<{ user_id: string | null }>>(
    `SELECT user_id FROM perfil_jugador WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
    id
  )
  if (!personajes.length) {
    return NextResponse.json({ error: 'Personaje no encontrado.' }, { status: 404 })
  }
  if (personajes[0].user_id !== null) {
    return NextResponse.json({ error: 'Este personaje ya tiene dueño.' }, { status: 409 })
  }

  await prisma.$queryRawUnsafe(
    `UPDATE perfil_jugador SET user_id = $1 WHERE id = $2`,
    nuevoDuenoId, id
  )

  return NextResponse.json({ ok: true })
}