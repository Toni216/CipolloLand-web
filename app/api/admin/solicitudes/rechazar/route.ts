import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !['moderador', 'admin', 'owner'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { solicitudId, motivoRechazo } = await req.json()

  try {
    await prisma.$queryRawUnsafe(
      `UPDATE access_requests 
       SET status = 'rechazado', motivo_rechazo = $1, revisado_por = $2, revisado_en = NOW()
       WHERE id = $3`,
      motivoRechazo || null, session.user.id, solicitudId
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Error rechazando solicitud:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}