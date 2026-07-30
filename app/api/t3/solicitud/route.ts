import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { motivacion, howFound, recomendadoPor, isAdult } = await req.json()

  if (!motivacion) {
    return NextResponse.json({ error: 'La motivación es obligatoria.' }, { status: 400 })
  }

  if (!isAdult) {
    return NextResponse.json({ error: 'Debes ser mayor de 18 años.' }, { status: 400 })
  }

  try {
    // Obtener temporada_id de la T3
    const temporadas = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM temporadas WHERE slug = 't3' LIMIT 1`
    )
    const temporadaId = temporadas[0]?.id
    if (!temporadaId) {
      return NextResponse.json({ error: 'Temporada no encontrada.' }, { status: 404 })
    }

    // Comprobar si ya tiene solicitud pendiente
    const existentes = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM access_requests
       WHERE user_id = $1 AND temporada_id = $2 AND status = 'pendiente'
       LIMIT 1`,
      session.user.id, temporadaId
    )

    if (existentes.length > 0) {
      return NextResponse.json({ error: 'Ya tienes una solicitud pendiente.' }, { status: 409 })
    }

    // Crear solicitud
    await prisma.$queryRawUnsafe(
      `INSERT INTO access_requests 
       (user_id, temporada_id, tipo_solicitud, status, motivacion, how_found, recomendado_por, is_adult)
       VALUES ($1, $2, 'temporada', 'pendiente', $3, $4, $5, $6)`,
      session.user.id, temporadaId, motivacion,
      howFound || null, recomendadoPor || null, isAdult
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.error('Error creando solicitud:', e)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}