import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { detalles_publicos } = await req.json()

  const personajes = await prisma.$queryRawUnsafe<Array<{ user_id: string | null }>>(
    `SELECT user_id FROM perfil_jugador WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
    id
  )
  const personaje = personajes[0]
  if (!personaje) {
    return NextResponse.json({ error: 'Personaje no encontrado.' }, { status: 404 })
  }

  // Solo el dueño puede alternar su propia visibilidad (los admins no tocan esto por otros)
  if (personaje.user_id !== session.user.id) {
    return NextResponse.json({ error: 'No eres el dueño de este personaje.' }, { status: 403 })
  }

  await prisma.$queryRawUnsafe(
    `UPDATE perfil_jugador SET detalles_publicos = $1 WHERE id = $2`,
    !!detalles_publicos, id
  )

  return NextResponse.json({ ok: true })
}