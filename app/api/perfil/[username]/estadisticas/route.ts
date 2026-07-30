import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params
  const username = decodeURIComponent(raw)
  const { searchParams } = new URL(req.url)
  const temporada = searchParams.get('temporada') ?? 't3'

  const usuarios = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL LIMIT 1`,
    username
  )
  const userId = usuarios[0]?.id
  if (!userId) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  if (temporada === 'global') {
    const totales = await prisma.$queryRawUnsafe<Array<{
      horas_jugadas: string
      kills: string
      muertes: string
      bloques_colocados: string
      bloques_rotos: string
      distancia_recorrida_km: string
    }>>(
      `SELECT
         COALESCE(SUM(horas_jugadas), 0)::text as horas_jugadas,
         COALESCE(SUM(kills), 0)::text as kills,
         COALESCE(SUM(muertes), 0)::text as muertes,
         COALESCE(SUM(bloques_colocados), 0)::text as bloques_colocados,
         COALESCE(SUM(bloques_rotos), 0)::text as bloques_rotos,
         COALESCE(SUM(distancia_recorrida_km), 0)::text as distancia_recorrida_km
       FROM estadisticas_jugador WHERE user_id = $1`,
      userId
    )

    const porTemporada = await prisma.$queryRawUnsafe<Array<{
      slug: string
      horas_jugadas: string
      kills: string
      muertes: string
      bloques_colocados: string
      bloques_rotos: string
      distancia_recorrida_km: string
    }>>(
      `SELECT t.slug, ej.horas_jugadas, ej.kills, ej.muertes, ej.bloques_colocados,
              ej.bloques_rotos, ej.distancia_recorrida_km
       FROM estadisticas_jugador ej
       JOIN temporadas t ON t.id = ej.temporada_id
       WHERE ej.user_id = $1`,
      userId
    )

    return NextResponse.json({ stats: totales[0], porTemporada, actualizado_en: null })
  }

  const filas = await prisma.$queryRawUnsafe<Array<{
    horas_jugadas: string
    kills: string
    muertes: string
    bloques_colocados: string
    bloques_rotos: string
    distancia_recorrida_km: string
    actualizado_en: Date
  }>>(
    `SELECT ej.horas_jugadas, ej.kills, ej.muertes, ej.bloques_colocados, ej.bloques_rotos,
            ej.distancia_recorrida_km, ej.actualizado_en
     FROM estadisticas_jugador ej
     JOIN temporadas t ON t.id = ej.temporada_id
     WHERE ej.user_id = $1 AND t.slug = $2`,
    userId, temporada
  )

  return NextResponse.json({ stats: filas[0] ?? null, porTemporada: [], actualizado_en: filas[0]?.actualizado_en ?? null })
}