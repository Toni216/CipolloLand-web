import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const TITULO_MAX = 128
const ESTADOS_VALIDOS = ['planeado', 'en_desarrollo', 'lanzado']

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { ok: false as const, status: 401, error: 'No autorizado' }
  if (!['admin', 'owner'].includes(session.user.rol)) {
    return { ok: false as const, status: 403, error: 'No tienes permiso.' }
  }
  return { ok: true as const }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params
  const { titulo, descripcion, estado, sugerencia_id } = await req.json()

  if (titulo !== undefined && !titulo.trim()) {
    return NextResponse.json({ error: 'El título no puede estar vacío.' }, { status: 400 })
  }
  if (titulo !== undefined && titulo.trim().length > TITULO_MAX) {
    return NextResponse.json({ error: `El título no puede superar los ${TITULO_MAX} caracteres.` }, { status: 400 })
  }
  if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 })
  }

  try {
    const item = await prisma.roadmap_items.update({
      where: { id },
      data: {
        ...(titulo !== undefined ? { titulo: titulo.trim() } : {}),
        ...(descripcion !== undefined ? { descripcion: descripcion.trim() } : {}),
        ...(estado !== undefined ? { estado } : {}),
        ...(sugerencia_id !== undefined ? { sugerencia_id: sugerencia_id || null } : {}),
      },
    })

    return NextResponse.json({ ok: true, item })
  } catch (e) {
    console.error('Error editando item de roadmap:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params

  try {
    await prisma.roadmap_items.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error borrando item de roadmap:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}