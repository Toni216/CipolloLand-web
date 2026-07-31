import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { username, email, password, invite } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    const existentes = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1`,
      email, username
    )

    if (existentes.length > 0) {
      return NextResponse.json({ error: 'El email o nick ya están en uso.' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const nuevoUsuario = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO users (username, email, password_hash, rol)
       VALUES ($1, $2, $3, 'user')
       RETURNING id`,
      username, email, password_hash
    )
    const userId = nuevoUsuario[0].id

    // Si viene con un código de invitación válido y activo, creamos
    // automáticamente su solicitud de acceso (pendiente de revisión igual)
    if (invite) {
      const invitaciones = await prisma.$queryRawUnsafe<Array<{ id: string, slots_otorgados: number }>>(
        `SELECT id, slots_otorgados FROM invitaciones WHERE codigo = $1 AND activo = true LIMIT 1`,
        invite
      )
      const invitacion = invitaciones[0]

      if (invitacion) {
        const temporadas = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM temporadas WHERE slug = 't3' LIMIT 1`
        )
        const temporadaId = temporadas[0]?.id

        if (temporadaId) {
          await prisma.$queryRawUnsafe(
            `INSERT INTO access_requests
               (user_id, temporada_id, tipo_solicitud, status, motivacion, how_found, is_adult, slots_permitidos)
             VALUES ($1, $2, 'temporada', 'pendiente', $3, $4, NULL, $5)`,
            userId, temporadaId,
            'Registrado mediante link de invitación directa',
            'Link de invitación',
            invitacion.slots_otorgados
          )

          await prisma.$queryRawUnsafe(
            `UPDATE invitaciones SET usos = usos + 1 WHERE id = $1`,
            invitacion.id
          )
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 })

  } catch (e) {
    console.error('Error en registro:', e)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}