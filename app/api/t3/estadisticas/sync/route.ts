import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface StatsJugador {
  minecraft_username: string
  horas_jugadas: number
  kills: number
  muertes: number
  bloques_colocados: number
  bloques_rotos: number
  distancia_recorrida_km: number
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-stats-secret')
  if (secret !== process.env.STATS_SYNC_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { jugadores, temporada_slug = 't3' }: { jugadores: StatsJugador[], temporada_slug?: string } = await req.json()

  const temporadas = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM temporadas WHERE slug = $1 LIMIT 1`,
    temporada_slug
  )
  const temporadaId = temporadas[0]?.id
  if (!temporadaId) return NextResponse.json({ error: 'Temporada no encontrada' }, { status: 404 })

  let actualizados = 0
  let pendientesCreados = 0
  let noEncontrados: string[] = []

  for (const j of jugadores) {
    const usuarios = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM users WHERE minecraft_username = $1 AND deleted_at IS NULL LIMIT 1`,
      j.minecraft_username
    )
    const userId = usuarios[0]?.id

    if (!userId) {
      // No existe cuenta con ese nick todavía — lo guardamos como pendiente
      await prisma.$queryRawUnsafe(
        `INSERT INTO estadisticas_jugador
           (user_id, minecraft_username_pendiente, temporada_id, horas_jugadas, kills, muertes, bloques_colocados, bloques_rotos, distancia_recorrida_km)
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (minecraft_username_pendiente, temporada_id) WHERE user_id IS NULL
         DO UPDATE SET
           horas_jugadas = EXCLUDED.horas_jugadas,
           kills = EXCLUDED.kills,
           muertes = EXCLUDED.muertes,
           bloques_colocados = EXCLUDED.bloques_colocados,
           bloques_rotos = EXCLUDED.bloques_rotos,
           distancia_recorrida_km = EXCLUDED.distancia_recorrida_km,
           actualizado_en = now()`,
        j.minecraft_username, temporadaId, j.horas_jugadas, j.kills, j.muertes,
        j.bloques_colocados, j.bloques_rotos, j.distancia_recorrida_km
      )
      pendientesCreados++
      noEncontrados.push(j.minecraft_username)
      continue
    }

    await prisma.$queryRawUnsafe(
      `INSERT INTO estadisticas_jugador
         (user_id, temporada_id, horas_jugadas, kills, muertes, bloques_colocados, bloques_rotos, distancia_recorrida_km)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, temporada_id)
       DO UPDATE SET
         horas_jugadas = EXCLUDED.horas_jugadas,
         kills = EXCLUDED.kills,
         muertes = EXCLUDED.muertes,
         bloques_colocados = EXCLUDED.bloques_colocados,
         bloques_rotos = EXCLUDED.bloques_rotos,
         distancia_recorrida_km = EXCLUDED.distancia_recorrida_km,
         actualizado_en = now()`,
      userId, temporadaId, j.horas_jugadas, j.kills, j.muertes,
      j.bloques_colocados, j.bloques_rotos, j.distancia_recorrida_km
    )
    actualizados++
  }

  return NextResponse.json({ ok: true, actualizados, pendientesCreados, noEncontrados })
}