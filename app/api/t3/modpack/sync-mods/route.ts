import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { r2, BUCKET } from '@/lib/r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import JSZip from 'jszip'
import { resolveProjectIds, fetchProjects, mapCategorias, toPgTextArray } from '@/lib/modrinth'
import { createHash } from 'crypto'

interface MrpackFile {
  path: string
  hashes: { sha1: string }
}

interface MrpackIndex {
  files: MrpackFile[]
}

export async function POST() {
  const session = await auth()
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')

  if (!esAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // 1. Sacamos el key del modpack actual
  const config = await prisma.$queryRawUnsafe<Array<{ modpack_url: string | null }>>(
    `SELECT ssc.modpack_url FROM season_server_configs ssc
     JOIN temporadas t ON t.id = ssc.temporada_id
     WHERE t.slug = 't3' LIMIT 1`
  )

  const key = config[0]?.modpack_url
  if (!key) {
    return NextResponse.json({ error: 'No hay modpack subido' }, { status: 404 })
  }

  // 2. Descargamos el .mrpack y leemos el manifiesto
  const obj = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const bytes = await obj.Body!.transformToByteArray()
  const zip = await JSZip.loadAsync(bytes)
  const indexFile = zip.file('modrinth.index.json')

  if (!indexFile) {
    return NextResponse.json({ error: 'El .mrpack no tiene modrinth.index.json' }, { status: 422 })
  }

  const raw = await indexFile.async('string')
  const index: MrpackIndex = JSON.parse(raw)

  const modFilesDeclarados = index.files.filter(f => f.path.startsWith('mods/'))

const archivosOverride: { path: string, hash: string }[] = []

  const rutasOverrideMods = Object.keys(zip.files).filter(ruta => {
    if (!ruta.startsWith('overrides/mods/')) return false
    if (!ruta.endsWith('.jar')) return false
    const resto = ruta.slice('overrides/mods/'.length)
    return !resto.includes('/') // sin subcarpetas, ej. sin .connector
  })

  console.log('🔍 Jars encontrados en overrides/mods:', rutasOverrideMods.length, rutasOverrideMods.slice(0, 5))

  for (const ruta of rutasOverrideMods) {
    const archivoZip = zip.file(ruta)
    if (!archivoZip) continue

    const bytesArchivo = await archivoZip.async('nodebuffer')
    const hashSha1 = createHash('sha1').update(bytesArchivo).digest('hex')

    archivosOverride.push({ path: ruta, hash: hashSha1 })
  }

  // Unificamos las dos fuentes: los declarados en el índice + los empaquetados sueltos
  const modFiles = [
    ...modFilesDeclarados.map(f => ({ path: f.path, hash: f.hashes.sha1 })),
    ...archivosOverride,
  ]

  const hashes = modFiles.map(f => f.hash)

  // 3. Preguntamos a Modrinth qué project_id corresponde a cada hash
  const hashToVersion = await resolveProjectIds(hashes)
  const projectIds = [...new Set(Object.values(hashToVersion).map(v => v.project_id))]

  // 4. Pedimos los datos completos de cada mod reconocido
  const proyectos = await fetchProjects(projectIds)

  // 5. temporada_id de T3
  const temporada = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM temporadas WHERE slug = 't3' LIMIT 1`
  )
  const temporadaId = temporada[0]?.id
  if (!temporadaId) {
    return NextResponse.json({ error: 'Temporada t3 no encontrada' }, { status: 404 })
  }

  // 6. Upsert de cada mod reconocido
  for (const p of proyectos) {
    await prisma.$queryRawUnsafe(
      `INSERT INTO season_mods
         (temporada_id, nombre, descripcion, categoria, icono_url, modrinth_id, modrinth_url, origen)
       VALUES ($1, $2, $3, $4::text[], $5, $6, $7, 'modrinth')
       ON CONFLICT (temporada_id, modrinth_id)
       DO UPDATE SET
         nombre = EXCLUDED.nombre,
         descripcion = EXCLUDED.descripcion,
         categoria = EXCLUDED.categoria,
         icono_url = EXCLUDED.icono_url,
         modrinth_url = EXCLUDED.modrinth_url,
         updated_at = now()`,
      temporadaId,
      p.title,
      p.description,
      mapCategorias(p.categories) === null ? null : toPgTextArray(mapCategorias(p.categories)),
      p.icon_url,
      p.id,
      `https://modrinth.com/mod/${p.slug}`
    )
  }

  // 7. Borramos mods sincronizados antes que ya no estén en el pack actual
  //    (nunca tocamos origen='manual')
  const idsActuales = proyectos.map(p => p.id)
  if (idsActuales.length > 0) {
    await prisma.$queryRawUnsafe(
      `DELETE FROM season_mods
       WHERE temporada_id = $1 AND origen = 'modrinth' AND modrinth_id NOT IN (${idsActuales.map((_, i) => `$${i + 2}`).join(',')})`,
      temporadaId,
      ...idsActuales
    )
  }

  // 8. Mods no reconocidos por Modrinth → placeholder para editar a mano
  const hashesResueltos = new Set(Object.keys(hashToVersion))
  const archivosNoReconocidos = modFiles.filter(f => !hashesResueltos.has(f.hash))

  for (const f of archivosNoReconocidos) {
    const nombreArchivo = f.path.split('/').pop() ?? f.path
    await prisma.$queryRawUnsafe(
      `INSERT INTO season_mods (temporada_id, nombre, origen, archivo_jar)
       VALUES ($1, $2, 'manual', $3)
       ON CONFLICT (temporada_id, archivo_jar) WHERE archivo_jar IS NOT NULL
       DO NOTHING`,
      temporadaId,
      nombreArchivo.replace(/\.jar$/, ''),
      nombreArchivo
    )
  }

  return NextResponse.json({
    success: true,
    sincronizados: proyectos.length,
    noReconocidos: archivosNoReconocidos.length,
  })
}