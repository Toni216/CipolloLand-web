import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const ROLES_VALIDOS = ['user', 'moderador', 'admin', 'owner']

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { ok: false as const, status: 401, error: 'No autorizado' }
  if (!['admin', 'owner'].includes(session.user.rol)) {
    return { ok: false as const, status: 403, error: 'No tienes permiso.' }
  }
  return { ok: true as const, session }
}

// Actualiza rol, estado (baneo) y/o slots_permitidos de un usuario
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params
  const { rol, baneado, slots_permitidos } = await req.json()

  try {
    const usuario = await prisma.users.findUnique({ where: { id } })
    if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })

    // No permitir que alguien se banee o se quite el propio rol de owner a sí mismo por error
    if (id === check.session.user.id && (baneado === true || rol === 'user')) {
      return NextResponse.json({ error: 'No puedes aplicarte esta acción a ti mismo.' }, { status: 400 })
    }

    if (rol !== undefined) {
      if (!ROLES_VALIDOS.includes(rol)) {
        return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 })
      }
      // Solo el owner puede otorgar/quitar el rol de owner
      if ((rol === 'owner' || usuario.rol === 'owner') && check.session.user.rol !== 'owner') {
        return NextResponse.json({ error: 'Solo el owner puede gestionar el rol de owner.' }, { status: 403 })
      }
      await prisma.users.update({ where: { id }, data: { rol } })
    }

    if (baneado !== undefined) {
      await prisma.users.update({
        where: { id },
        data: { deleted_at: baneado ? new Date() : null },
      })
    }

    if (slots_permitidos !== undefined) {
      const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
      if (!temporada) return NextResponse.json({ error: 'Temporada no encontrada.' }, { status: 404 })

      const solicitud = await prisma.access_requests.findFirst({
        where: { user_id: id, temporada_id: temporada.id, status: 'aprobado' },
      })
      if (!solicitud) {
        return NextResponse.json(
          { error: 'Este usuario no tiene una solicitud aprobada en la T3, no se puede ajustar el nº de personajes.' },
          { status: 400 }
        )
      }
      if (typeof slots_permitidos !== 'number' || slots_permitidos < 1 || slots_permitidos > 20) {
        return NextResponse.json({ error: 'El número de personajes debe estar entre 1 y 20.' }, { status: 400 })
      }
      await prisma.access_requests.update({
        where: { id: solicitud.id },
        data: { slots_permitidos },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error actualizando usuario:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}