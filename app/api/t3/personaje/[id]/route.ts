import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const personajes = await prisma.$queryRawUnsafe<Array<{ user_id: string | null }>>(
    `SELECT user_id FROM perfil_jugador WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
    id
  )
  const personaje = personajes[0]
  if (!personaje) {
    return NextResponse.json({ error: 'Personaje no encontrado.' }, { status: 404 })
  }

  const usuarioActual = await prisma.$queryRawUnsafe<Array<{ rol: string }>>(
    `SELECT rol FROM users WHERE id = $1 LIMIT 1`,
    session.user.id
  )
  const esAdmin = ['admin', 'owner'].includes(usuarioActual[0]?.rol ?? '')
  const esDueno = personaje.user_id === session.user.id

  if (!esAdmin && !esDueno) {
    return NextResponse.json({ error: 'No tienes permiso para eliminar este personaje.' }, { status: 403 })
  }

  await prisma.$queryRawUnsafe(
    `UPDATE perfil_jugador SET deleted_at = now() WHERE id = $1`,
    id
  )

  return NextResponse.json({ ok: true })
}