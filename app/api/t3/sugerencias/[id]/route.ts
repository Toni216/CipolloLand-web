import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const TITULO_MAX = 128
const VENTANA_EDICION_MS = 24 * 60 * 60 * 1000 // 24 horas
const ESTADOS_BORRABLES = ['pendiente', 'descartado']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { titulo, descripcion } = await req.json()

  if (!titulo?.trim() || !descripcion?.trim()) {
    return NextResponse.json({ error: 'Título y descripción son obligatorios.' }, { status: 400 })
  }
  if (titulo.trim().length > TITULO_MAX) {
    return NextResponse.json({ error: `El título no puede superar los ${TITULO_MAX} caracteres.` }, { status: 400 })
  }

  try {
    const sugerencia = await prisma.sugerencias.findUnique({ where: { id } })
    if (!sugerencia) return NextResponse.json({ error: 'Sugerencia no encontrada.' }, { status: 404 })
    if (sugerencia.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Solo puedes editar tus propias sugerencias.' }, { status: 403 })
    }
    const antiguedad = Date.now() - sugerencia.created_at.getTime()
    if (antiguedad > VENTANA_EDICION_MS) {
      return NextResponse.json({ error: 'Ya han pasado más de 24h, no se puede editar.' }, { status: 400 })
    }

    // Guardar la versión anterior en el historial antes de sobrescribir
    await prisma.sugerencia_versiones.create({
      data: {
        sugerencia_id: id,
        titulo: sugerencia.titulo,
        descripcion: sugerencia.descripcion,
      },
    })

    const actualizada = await prisma.sugerencias.update({
      where: { id },
      data: { titulo: titulo.trim(), descripcion: descripcion.trim(), editado: true },
    })

    return NextResponse.json({ ok: true, sugerencia: actualizada })
  } catch (e) {
    console.error('Error editando sugerencia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  try {
    const sugerencia = await prisma.sugerencias.findUnique({ where: { id } })
    if (!sugerencia) return NextResponse.json({ error: 'Sugerencia no encontrada.' }, { status: 404 })
    if (sugerencia.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Solo puedes borrar tus propias sugerencias.' }, { status: 403 })
    }
    if (!ESTADOS_BORRABLES.includes(sugerencia.estado)) {
      return NextResponse.json(
        { error: 'Esta sugerencia ya está en progreso o hecha, no se puede borrar.' },
        { status: 400 }
      )
    }

    await prisma.sugerencias.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error borrando sugerencia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}