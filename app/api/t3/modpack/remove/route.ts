import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { r2, BUCKET } from '@/lib/r2'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function POST() {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')

  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const config = await prisma.$queryRawUnsafe<Array<{ modpack_url: string | null }>>(
    `SELECT ssc.modpack_url FROM season_server_configs ssc
     JOIN temporadas t ON t.id = ssc.temporada_id
     WHERE t.slug = 't3' LIMIT 1`
  )

  const key = config[0]?.modpack_url

  if (key) {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  }

  await prisma.$queryRawUnsafe(
    `UPDATE season_server_configs
     SET modpack_url = NULL, modpack_version = NULL
     WHERE temporada_id = (SELECT id FROM temporadas WHERE slug = 't3')`
  )

  return NextResponse.json({ success: true })
}