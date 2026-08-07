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
  return { ok: true as const, session }
}

export async function POST(req: Request) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { titulo, descripcion, estado, sugerencia_id } = await req.json()

  if (!titulo?.trim() || !descripcion?.trim()) {
    return NextResponse.json({ error: 'Título y descripción son obligatorios.' }, { status: 400 })
  }
  if (titulo.trim().length > TITULO_MAX) {
    return NextResponse.json({ error: `El título no puede superar los ${TITULO_MAX} caracteres.` }, { status: 400 })
  }
  const estadoFinal = ESTADOS_VALIDOS.includes(estado) ? estado : 'planeado'

  try {
    const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
    if (!temporada) return NextResponse.json({ error: 'Temporada no encontrada.' }, { status: 404 })

    const item = await prisma.roadmap_items.create({
      data: {
        temporada_id: temporada.id,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        estado: estadoFinal,
        sugerencia_id: sugerencia_id || null,
        creado_por: check.session.user.id,
      },
    })

    return NextResponse.json({ ok: true, item }, { status: 201 })
  } catch (e) {
    console.error('Error creando item de roadmap:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}