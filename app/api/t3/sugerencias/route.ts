import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const TITULO_MAX = 128
const CATEGORIAS_VALIDAS = ['web', 'servidor', 'rol_lore', 'eventos', 'otro']

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { titulo, descripcion, categoria } = await req.json()

  if (!titulo?.trim() || !descripcion?.trim()) {
    return NextResponse.json({ error: 'Título y descripción son obligatorios.' }, { status: 400 })
  }
  if (titulo.trim().length > TITULO_MAX) {
    return NextResponse.json({ error: `El título no puede superar los ${TITULO_MAX} caracteres.` }, { status: 400 })
  }
  const categoriaFinal = CATEGORIAS_VALIDAS.includes(categoria) ? categoria : 'otro'

  try {
    const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
    if (!temporada) return NextResponse.json({ error: 'Temporada no encontrada.' }, { status: 404 })

    const sugerencia = await prisma.sugerencias.create({
      data: {
        temporada_id: temporada.id,
        user_id: session.user.id,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoriaFinal,
      },
    })

    return NextResponse.json({ ok: true, sugerencia }, { status: 201 })
  } catch (e) {
    console.error('Error creando sugerencia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}