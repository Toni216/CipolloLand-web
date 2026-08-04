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

// Editar una insignia existente
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params
  const { nombre, descripcion, icono, color, grant_access } = await req.json()

  if (nombre !== undefined) {
    if (!nombre.trim()) return NextResponse.json({ error: 'El nombre no puede estar vacío.' }, { status: 400 })
    if (nombre.trim().length > 64) return NextResponse.json({ error: 'El nombre no puede superar los 64 caracteres.' }, { status: 400 })
  }
  if (color !== undefined && color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return NextResponse.json({ error: 'El color debe ser un hexadecimal tipo #RRGGBB.' }, { status: 400 })
  }

  try {
    if (nombre !== undefined) {
      const otraConEseNombre = await prisma.badges.findFirst({ where: { nombre: nombre.trim(), NOT: { id } } })
      if (otraConEseNombre) {
        return NextResponse.json({ error: 'Ya existe otra insignia con ese nombre.' }, { status: 400 })
      }
    }

    const badge = await prisma.badges.update({
      where: { id },
      data: {
        ...(nombre !== undefined ? { nombre: nombre.trim() } : {}),
        ...(descripcion !== undefined ? { descripcion: descripcion.trim() || null } : {}),
        ...(icono !== undefined ? { icono: icono.trim() || null } : {}),
        ...(color !== undefined ? { color: color || null } : {}),
        ...(grant_access !== undefined ? { grant_access: !!grant_access } : {}),
      },
    })

    return NextResponse.json({ ok: true, badge })
  } catch (e) {
    console.error('Error editando insignia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}

// Borrar una insignia (y sus asignaciones, por el onDelete: Cascade en user_badges)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params

  try {
    await prisma.badges.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error borrando insignia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}