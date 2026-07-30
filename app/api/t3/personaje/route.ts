import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const {
    nombre_pj, edad_pj, pj_who, historia_pj,
    faccion_pj, raza_pj, clase_pj,
    objetivos, reaccion_peligro, comida_favorita, apodo_odiado
  } = body

  if (!nombre_pj?.trim()) {
    return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 })
  }

  try {
    const temporadas = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM temporadas WHERE slug = 't3' LIMIT 1`
    )
    const temporadaId = temporadas[0]?.id
    if (!temporadaId) return NextResponse.json({ error: 'Temporada no encontrada.' }, { status: 404 })

    // Los admins/owners se saltan la comprobación de acceso aprobado
    const usuarioActual = await prisma.$queryRawUnsafe<Array<{ rol: string }>>(
      `SELECT rol FROM users WHERE id = $1 LIMIT 1`,
      session.user.id
    )
    const esAdmin = ['admin', 'owner'].includes(usuarioActual[0]?.rol ?? '')

    // Determinar el dueño real del personaje
    let userIdFinal: string | null = session.user.id
    let esNpc = false

    if (esAdmin && body.tipo_dueno) {
      if (body.tipo_dueno === 'jugador' && body.dueno_username) {
        const jugadorBuscado = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL LIMIT 1`,
          body.dueno_username
        )
        if (!jugadorBuscado.length) {
          return NextResponse.json({ error: 'No se encontró ese jugador.' }, { status: 404 })
        }
        userIdFinal = jugadorBuscado[0].id
      } else if (body.tipo_dueno === 'sin_dueno') {
        userIdFinal = null
      } else if (body.tipo_dueno === 'npc') {
        userIdFinal = null
        esNpc = true
      }
      // 'yo_mismo' deja userIdFinal como session.user.id, sin cambios
    }

    if (!esAdmin) {
      // Comprobar acceso aprobado
      const acceso = await prisma.$queryRawUnsafe<Array<{ slots_permitidos: number }>>(
        `SELECT ar.slots_permitidos FROM access_requests ar
         JOIN temporadas t ON t.id = ar.temporada_id
         WHERE ar.user_id = $1 AND t.slug = 't3' AND ar.status = 'aprobado'
         LIMIT 1`,
        session.user.id
      )
      if (!acceso.length) {
        return NextResponse.json({ error: 'No tienes acceso aprobado.' }, { status: 403 })
      }

      // Comprobar slots disponibles (solo aplica a usuarios normales)
      const usados = await prisma.$queryRawUnsafe<[{ count: string }]>(
        `SELECT COUNT(*)::text as count FROM perfil_jugador
         WHERE user_id = $1 AND temporada_id = $2 AND deleted_at IS NULL`,
        session.user.id, temporadaId
      )
      const slotsUsados = parseInt(usados[0].count)
      if (slotsUsados >= acceso[0].slots_permitidos) {
        return NextResponse.json({ error: 'Has alcanzado el límite de personajes.' }, { status: 400 })
      }
    }

    // Crear personaje
    await prisma.$queryRawUnsafe(
      `INSERT INTO perfil_jugador
       (temporada_id, user_id, status, nombre_pj, edad_pj, pj_who, historia_pj,
        faccion_pj, raza_pj, clase_pj, objetivos, reaccion_peligro, comida_favorita, apodo_odiado, es_npc)
       VALUES ($1, $2, 'aprobado', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      temporadaId, userIdFinal, nombre_pj.trim(),
      edad_pj ? parseInt(edad_pj) : null,
      pj_who || null, historia_pj || null,
      faccion_pj || null, raza_pj || null, clase_pj || null,
      objetivos || null, reaccion_peligro || null,
      comida_favorita || null, apodo_odiado || null,
      esNpc
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.error('Error creando personaje:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}