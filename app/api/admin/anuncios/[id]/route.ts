import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const TITULO_MAX = 128

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, status: 401, error: 'No autorizado' }
  if (!['admin', 'owner'].includes(session.user.rol)) {
    return { ok: false, status: 403, error: 'No tienes permiso.' }
  }
  return { ok: true, session }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params
  const { titulo, cuerpo, pinned } = await req.json()

  if (titulo !== undefined && !titulo.trim()) {
    return NextResponse.json({ error: 'El título no puede estar vacío.' }, { status: 400 })
  }
  if (titulo !== undefined && titulo.trim().length > TITULO_MAX) {
    return NextResponse.json(
      { error: `El título no puede superar los ${TITULO_MAX} caracteres.` },
      { status: 400 }
    )
  }
  if (cuerpo !== undefined && !cuerpo.trim()) {
    return NextResponse.json({ error: 'El cuerpo no puede estar vacío.' }, { status: 400 })
  }

  try {
    const existente = await prisma.anuncios.findUnique({ where: { id } })
    if (!existente) {
      return NextResponse.json({ error: 'Anuncio no encontrado.' }, { status: 404 })
    }

    if (pinned === true) {
      await prisma.anuncios.updateMany({
        where: { temporada_id: existente.temporada_id, pinned: true },
        data: { pinned: false },
      })
    }

    const anuncio = await prisma.anuncios.update({
      where: { id },
      data: {
        ...(titulo !== undefined ? { titulo: titulo.trim() } : {}),
        ...(cuerpo !== undefined ? { cuerpo: cuerpo.trim() } : {}),
        ...(pinned !== undefined ? { pinned: !!pinned } : {}),
      },
    })

    return NextResponse.json({ ok: true, anuncio })
  } catch (e) {
    console.error('Error editando anuncio:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params

  try {
    await prisma.anuncios.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error borrando anuncio:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}