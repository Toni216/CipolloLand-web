import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { r2, BUCKET } from '@/lib/r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import JSZip from 'jszip'

interface MrpackIndex {
  name: string
  versionId: string
  dependencies: {
    minecraft?: string
    forge?: string
    neoforge?: string
  }
  files: Array<{ path: string }>
}

export async function POST(req: Request) {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')

  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { key, version } = await req.json()

  // 1. Descargamos el .mrpack recién subido, en memoria
  const obj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const bytes = await obj.Body!.transformToByteArray()

  // 2. Lo abrimos como ZIP y leemos el manifiesto de Modrinth
  const zip = await JSZip.loadAsync(bytes)
  const indexFile = zip.file('modrinth.index.json')

  let forgeVersion: string | null = null
  let modsCount: number | null = null

  if (indexFile) {
    const raw = await indexFile.async('string')
    const index: MrpackIndex = JSON.parse(raw)

    forgeVersion = index.dependencies.minecraft ?? null
    modsCount = index.files.filter(f => f.path.startsWith('mods/')).length
  }

  // 3. Guardamos todo
  await prisma.$queryRawUnsafe(
    `UPDATE season_server_configs
     SET modpack_url = $1, modpack_version = $2, forge_version = $3, mods_count = $4
     WHERE temporada_id = (SELECT id FROM temporadas WHERE slug = 't3')`,
    key,
    version,
    forgeVersion,
    modsCount
  )

  return NextResponse.json({ success: true, forgeVersion, modsCount })
}