import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Historial de versiones anteriores de una sugerencia (público, cualquiera puede verlo)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const versiones = await prisma.sugerencia_versiones.findMany({
      where: { sugerencia_id: id },
      orderBy: { guardado_en: 'desc' },
    })
    return NextResponse.json({ versiones })
  } catch (e) {
    console.error('Error obteniendo versiones:', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}