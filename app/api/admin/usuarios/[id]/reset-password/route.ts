import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { ok: false as const, status: 401, error: 'No autorizado' }
  if (!['admin', 'owner'].includes(session.user.rol)) {
    return { ok: false as const, status: 403, error: 'No tienes permiso.' }
  }
  return { ok: true as const, session }
}

function generarPasswordTemporal() {
  // 10 caracteres alfanuméricos, fáciles de leer/dictar (sin 0/O/1/l confusos)
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  const bytes = crypto.randomBytes(10)
  for (let i = 0; i < 10; i++) {
    pass += alfabeto[bytes[i] % alfabeto.length]
  }
  return pass
}

// Genera una contraseña temporal nueva para el usuario y la devuelve UNA VEZ, en claro,
// para que el admin se la pase manualmente (por Discord, etc.)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await checkAdmin()
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status })

  const { id } = await params

  try {
    const usuario = await prisma.users.findUnique({ where: { id } })
    if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })

    const nuevaPassword = generarPasswordTemporal()
    const hash = await bcrypt.hash(nuevaPassword, 10)

    await prisma.users.update({ where: { id }, data: { password_hash: hash } })

    return NextResponse.json({ ok: true, password: nuevaPassword })
  } catch (e) {
    console.error('Error reseteando contraseña:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}