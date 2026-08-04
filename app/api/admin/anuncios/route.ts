import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const TITULO_MAX = 128

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!['admin', 'owner'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
  }

  const { titulo, cuerpo, pinned } = await req.json()

  if (!titulo?.trim() || !cuerpo?.trim()) {
    return NextResponse.json({ error: 'Título y cuerpo son obligatorios.' }, { status: 400 })
  }
  if (titulo.trim().length > TITULO_MAX) {
    return NextResponse.json(
      { error: `El título no puede superar los ${TITULO_MAX} caracteres.` },
      { status: 400 }
    )
  }

  try {
    const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
    if (!temporada) {
      return NextResponse.json({ error: 'Temporada no encontrada.' }, { status: 404 })
    }

    // Si se marca como fijado, desfijamos el resto para que solo haya un anuncio fijado a la vez
    if (pinned) {
      await prisma.anuncios.updateMany({
        where: { temporada_id: temporada.id, pinned: true },
        data: { pinned: false },
      })
    }

    const anuncio = await prisma.anuncios.create({
      data: {
        temporada_id: temporada.id,
        titulo: titulo.trim(),
        cuerpo: cuerpo.trim(),
        pinned: !!pinned,
        autor_id: session.user.id,
      },
    })

    return NextResponse.json({ ok: true, anuncio }, { status: 201 })
  } catch (e) {
    console.error('Error creando anuncio:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}