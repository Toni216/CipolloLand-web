import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { toPgTextArray } from '@/lib/modrinth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')

  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { nombre, descripcion, categoria, modrinth_url, curseforge_url, github_url } = await req.json()

  await prisma.$queryRawUnsafe(
    `UPDATE season_mods
     SET nombre = $1, descripcion = $2, categoria = $3::text[],
         modrinth_url = $4, curseforge_url = $5, github_url = $6,
         updated_at = now()
     WHERE id = $7`,
    nombre, descripcion, toPgTextArray(categoria), modrinth_url, curseforge_url, github_url, id
  )

  return NextResponse.json({ success: true })
}