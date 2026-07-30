import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    // Validaciones básicas
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    // Comprobar si el email o nick ya existen
    const existentes = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1`,
      email, username
    )

    if (existentes.length > 0) {
      return NextResponse.json({ error: 'El email o nick ya están en uso.' }, { status: 409 })
    }

    // Hashear contraseña
    const password_hash = await bcrypt.hash(password, 12)

    // Crear usuario
    await prisma.$queryRawUnsafe(
      `INSERT INTO users (username, email, password_hash, rol)
       VALUES ($1, $2, $3, 'user')`,
      username, email, password_hash
    )

    return NextResponse.json({ ok: true }, { status: 201 })

  } catch (e) {
    console.error('Error en registro:', e)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}