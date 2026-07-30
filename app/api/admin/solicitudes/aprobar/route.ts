import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !['moderador', 'admin', 'owner'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { solicitudId, userId, slots, nombrePj } = await req.json()

  try {
    // 1. Obtener temporada_id de la T3
    const temporadas = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM temporadas WHERE slug = 't3' LIMIT 1`
    )
    const temporadaId = temporadas[0]?.id
    if (!temporadaId) return NextResponse.json({ error: 'Temporada no encontrada' }, { status: 404 })

    // 2. Actualizar solicitud
    await prisma.$queryRawUnsafe(
      `UPDATE access_requests 
       SET status = 'aprobado', slots_permitidos = $1, revisado_por = $2, revisado_en = NOW()
       WHERE id = $3`,
      slots, session.user.id, solicitudId
    )

    // 3. Crear perfil_jugador SOLO si se especificó nombre
    if (nombrePj) {
    await prisma.$queryRawUnsafe(
        `INSERT INTO perfil_jugador (temporada_id, user_id, status, nombre_pj)
        VALUES ($1, $2, 'aprobado', $3)
        ON CONFLICT (temporada_id, user_id) WHERE deleted_at IS NULL
        DO UPDATE SET status = 'aprobado', nombre_pj = COALESCE($3, perfil_jugador.nombre_pj)`,
        temporadaId, userId, nombrePj
    )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error aprobando solicitud:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}