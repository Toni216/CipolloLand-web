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

// Conceder una badge a un usuario
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params
  const { badge_id } = await req.json()
  if (!badge_id) return NextResponse.json({ error: 'Falta badge_id.' }, { status: 400 })

  try {
    const yaLaTiene = await prisma.user_badges.findFirst({ where: { user_id: id, badge_id } })
    if (yaLaTiene) {
      return NextResponse.json({ error: 'El usuario ya tiene esta insignia.' }, { status: 400 })
    }

    await prisma.user_badges.create({
      data: { user_id: id, badge_id, granted_by: check.session.user.id },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    console.error('Error concediendo badge:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}

// Quitar una badge a un usuario (pasando user_badges.id en el body)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { user_badge_id } = await req.json()
  if (!user_badge_id) return NextResponse.json({ error: 'Falta user_badge_id.' }, { status: 400 })

  try {
    await prisma.user_badges.delete({ where: { id: user_badge_id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error quitando badge:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}