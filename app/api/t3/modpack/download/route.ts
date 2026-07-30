import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { r2, BUCKET } from '@/lib/r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const esAdmin = ['admin', 'owner'].includes(session.user.rol)

  if (!esAdmin) {
    const acceso = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT ar.id FROM access_requests ar
       JOIN temporadas t ON t.id = ar.temporada_id
       WHERE ar.user_id = $1 AND t.slug = 't3' AND ar.status = 'aprobado'
       LIMIT 1`,
      session.user.id
    )
    if (acceso.length === 0) {
      return NextResponse.json({ error: 'Necesitas ser jugador aprobado' }, { status: 403 })
    }
  }

  const config = await prisma.$queryRawUnsafe<Array<{ modpack_url: string | null }>>(
    `SELECT ssc.modpack_url FROM season_server_configs ssc
     JOIN temporadas t ON t.id = ssc.temporada_id
     WHERE t.slug = 't3' LIMIT 1`
  )

  const key = config[0]?.modpack_url
  if (!key) {
    return NextResponse.json({ error: 'Modpack no disponible' }, { status: 404 })
  }

const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: 'attachment; filename="CipolloLand-Apocalipsis-Edition.mrpack"',
    ResponseContentType: 'application/octet-stream',
  })
  const downloadUrl = await getSignedUrl(r2, command, { expiresIn: 60 })

  return NextResponse.redirect(downloadUrl)
}