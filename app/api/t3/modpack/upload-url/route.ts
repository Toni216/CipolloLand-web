import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { r2, BUCKET } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function POST(req: Request) {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')

  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { filename } = await req.json()
  const key = `t3/${Date.now()}-${filename}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  // La URL caduca en 5 minutos — de sobra para subir 21MB
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 })

  return NextResponse.json({ uploadUrl, key })
}