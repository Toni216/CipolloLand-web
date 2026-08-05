import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Alterna el voto del usuario actual sobre una sugerencia (si ya votó, lo quita)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  try {
    const existente = await prisma.sugerencia_votos.findUnique({
      where: { sugerencia_id_user_id: { sugerencia_id: id, user_id: session.user.id } },
    })

    if (existente) {
      await prisma.sugerencia_votos.delete({ where: { id: existente.id } })
      return NextResponse.json({ ok: true, votado: false })
    }

    await prisma.sugerencia_votos.create({
      data: { sugerencia_id: id, user_id: session.user.id },
    })
    return NextResponse.json({ ok: true, votado: true })
  } catch (e) {
    console.error('Error votando sugerencia:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}