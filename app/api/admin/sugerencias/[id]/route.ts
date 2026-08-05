import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const ESTADOS_VALIDOS = ['pendiente', 'en_progreso', 'hecho', 'descartado']

// Cambiar el estado de una sugerencia (solo admin/owner)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'owner'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
  }

  const { id } = await params
  const { estado } = await req.json()

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 })
  }

  try {
    const sugerencia = await prisma.sugerencias.update({ where: { id }, data: { estado } })
    return NextResponse.json({ ok: true, sugerencia })
  } catch (e) {
    console.error('Error actualizando estado de sugerencia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}