import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import ModpackTabs from './components/ModpackTabs'

async function getModpackData() {
  const [configs, jugadoresCount, modsList] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{
      modpack_url: string | null
      modpack_version: string | null
      forge_version: string | null
      mods_count: number | null
    }>>(
      `SELECT ssc.modpack_url, ssc.modpack_version, ssc.forge_version, ssc.mods_count
       FROM season_server_configs ssc
       JOIN temporadas t ON t.id = ssc.temporada_id
       WHERE t.slug = 't3' LIMIT 1`
    ),
    prisma.$queryRawUnsafe<[{ count: string }]>(
      `SELECT COUNT(*)::text as count
       FROM perfil_jugador pp
       JOIN temporadas t ON t.id = pp.temporada_id
       WHERE pp.status = 'aprobado' AND pp.deleted_at IS NULL AND t.slug = 't3'`
    ),
    prisma.$queryRawUnsafe<Array<{
      id: string
      nombre: string
      descripcion: string | null
      categoria: string[] | null
      icono_url: string | null
      modrinth_url: string | null
      curseforge_url: string | null
      github_url: string | null
    }>>(
      `SELECT sm.id, sm.nombre, sm.descripcion, sm.categoria, sm.icono_url,
              sm.modrinth_url, sm.curseforge_url, sm.github_url
       FROM season_mods sm
       JOIN temporadas t ON t.id = sm.temporada_id
       WHERE t.slug = 't3'
       ORDER BY sm.sort_order, sm.nombre`
    )
  ])

  return {
    config: configs[0] ?? null,
    jugadores: parseInt(jugadoresCount[0].count),
    mods: modsList
  }
}

async function checkAcceso(userId: string) {
  const result = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT ar.id FROM access_requests ar
     JOIN temporadas t ON t.id = ar.temporada_id
     WHERE ar.user_id = $1 AND t.slug = 't3' AND ar.status = 'aprobado'
     LIMIT 1`,
    userId
  )
  return result.length > 0
}

export default async function ModpackPage() {
  const session = await auth()
  const { config, jugadores, mods } = await getModpackData()

  const estaAutorizado = session?.user?.id
    ? ['admin', 'owner'].includes(session.user.rol) || await checkAcceso(session.user.id)
    : false

  const tieneSesion = !!session?.user?.id
  const esAdmin = ['admin', 'owner'].includes(session?.user?.rol ?? '')
  const tieneModpack = !!config?.modpack_url

  return (
    <>
      <NavController jugadores={jugadores} session={session} />
      <div style={{ paddingTop: '150px', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>

        {/* Cabecera */}
        <div style={{
          position: 'absolute', top: '30px', left: '-100px',
          width: '500px', height: '300px',
          background: 'rgba(74,124,63,0.07)',
          filter: 'blur(80px)', pointerEvents: 'none'
        }} />

        <div style={{ padding: '0 40px 48px' }}>

          <p style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', letterSpacing: '0.28em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)', opacity: 0.75,
            marginBottom: '12px'
          }}>
            Forge 1.20.1 · 3ª Edición
          </p>

          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: 0.9, letterSpacing: '0.02em',
            color: 'var(--bone)', marginBottom: '20px'
          }}>
            Modpack<br />
            <span style={{ color: 'var(--green-bright)' }}>CipolloLand 2</span>
          </h1>

          {/* Stats — versión y mods, ya con datos reales */}
          <div style={{ display: 'flex', gap: '1px' }}>
            {[
              { val: config?.forge_version ?? 'No disponible', lbl: 'Versión' },
              { val: mods.length > 0 ? String(mods.length) : 'No disponible', lbl: 'Mods' },
            ].map(s => (
              <div key={s.lbl} style={{
                padding: '12px 20px',
                border: '1px solid rgba(255,255,255,0.055)',
                background: 'rgba(74,124,63,0.04)',
                marginRight: '1px'
              }}>
                <div style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '28px', color: s.val === 'No disponible' ? 'var(--text-dim)' : 'var(--bone)',
                  letterSpacing: '0.06em', lineHeight: 1
                }}>{s.val}</div>
                <div style={{
                  fontFamily: 'var(--font-barlow-condensed)',
                  fontSize: '10px', color: 'var(--text-dim)',
                  letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                  marginTop: '2px'
                }}>{s.lbl}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Tabs */}
        <ModpackTabs
          estaAutorizado={estaAutorizado}
          tieneSesion={tieneSesion}
          esAdmin={esAdmin}
          tieneModpack={tieneModpack}
          modpackVersion={config?.modpack_version ?? null}
          mods={mods}
        />

      </div>
    </>
  )
}