import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')

  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const personajes = await prisma.$queryRawUnsafe<Array<{
    id: string
    nombre_pj: string | null
    faccion_pj: string | null
  }>>(
    `SELECT pp.id, pp.nombre_pj, pp.faccion_pj
     FROM perfil_jugador pp
     JOIN temporadas t ON t.id = pp.temporada_id
     WHERE t.slug = 't3' AND pp.user_id IS NULL AND pp.es_npc = FALSE AND pp.deleted_at IS NULL
     ORDER BY pp.created_at ASC`
  )

  return NextResponse.json({ personajes })
}