import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { ok: false as const, status: 401, error: 'No autorizado' }
  if (!['admin', 'owner'].includes(session.user.rol)) {
    return { ok: false as const, status: 403, error: 'No tienes permiso.' }
  }
  return { ok: true as const, session }
}

function validar(nombre: string, color?: string) {
  if (!nombre?.trim()) return 'El nombre es obligatorio.'
  if (nombre.trim().length > 64) return 'El nombre no puede superar los 64 caracteres.'
  if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) return 'El color debe ser un hexadecimal tipo #RRGGBB.'
  return null
}

// Crear una insignia nueva
export async function POST(req: Request) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { nombre, descripcion, icono, color, grant_access } = await req.json()
  const errorValidacion = validar(nombre, color)
  if (errorValidacion) return NextResponse.json({ error: errorValidacion }, { status: 400 })

  try {
    const existente = await prisma.badges.findUnique({ where: { nombre: nombre.trim() } })
    if (existente) {
      return NextResponse.json({ error: 'Ya existe una insignia con ese nombre.' }, { status: 400 })
    }

    const badge = await prisma.badges.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        icono: icono?.trim() || null,
        color: color || null,
        grant_access: !!grant_access,
      },
    })

    return NextResponse.json({ ok: true, badge }, { status: 201 })
  } catch (e) {
    console.error('Error creando insignia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}