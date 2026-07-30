import Image from 'next/image'
import HeroBg from './components/HeroBg'
import Countdown from './components/Countdown'
import ServerInfo from './components/ServerInfo'
import LorePreview from './components/LorePreview'
import Anuncios from './components/Anuncios'
import Facciones from './components/Facciones'
import NavCards from './components/NavCards'
import Footer from './components/Footer'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Temporada {
  subtitulo: string | null
  open_date: Date | null
  year: number | null
}

async function getTemporada(): Promise<Temporada | null> {
  const { prisma } = await import('@/lib/prisma')
  return prisma.temporadas.findFirst({
    where: { slug: 't3' },
    select: { subtitulo: true, open_date: true, year: true }
  })
}

async function getServerInfo(estaAutorizado: boolean) {
  if (!estaAutorizado) return null
  const configs = await prisma.$queryRawUnsafe<Array<{
    server_ip: string | null
    modpack_url: string | null
    modpack_version: string | null
  }>>(
    `SELECT ssc.server_ip, ssc.modpack_url, ssc.modpack_version
     FROM season_server_configs ssc
     JOIN temporadas t ON t.id = ssc.temporada_id
     WHERE t.slug = 't3'
     LIMIT 1`
  )
  return configs[0] ?? null
}

export default async function T3Page() {
  const session = await auth()
  const temporada = await getTemporada()

  // Comprobar si el usuario tiene acceso
  let estaAutorizado = false
  if (session?.user?.id) {
    const rol = session.user.rol
    if (['admin', 'owner'].includes(rol)) {
      estaAutorizado = true
    } else {
      const perfiles = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT ar.id FROM access_requests ar
        JOIN temporadas t ON t.id = ar.temporada_id
        WHERE ar.user_id = $1
          AND t.slug = 't3'
          AND ar.status = 'aprobado'
        LIMIT 1`,
        session.user.id
      )
estaAutorizado = perfiles.length > 0
    }
  }

  const serverInfo = await getServerInfo(estaAutorizado)

  return (
    <div>
      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroBg />
        <div className="relative z-10 text-center px-6 w-full max-w-3xl mx-auto">

          <p style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '11px', letterSpacing: '0.3em',
            color: 'var(--green-bright)',
            textTransform: 'uppercase' as const,
            opacity: 0.65, marginBottom: '22px'
          }}>
            3ª Edición &nbsp;·&nbsp; Forge 1.20.1 &nbsp;·&nbsp; {temporada?.year ?? '2026'}
          </p>

          <div style={{ margin: '0 auto 32px', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/LOGOCOMPLETO.png"
              alt="CipolloLand"
              width={750} height={750}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          <p style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '14px', color: 'var(--text-mid)',
            marginTop: '28px', letterSpacing: '0.1em',
            maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',
            lineHeight: 1.95
          }}>
            <em style={{ color: 'var(--bone-dim)', fontStyle: 'normal' }}>
              Los Pilares del Destino cayeron.
            </em>{' '}<br />
            La nigromancia se despertó.<br />
            El mundo ya no es el mismo que conocías.
          </p>

          <Countdown openDate={temporada?.open_date?.toISOString() ?? null} />
          <ServerInfo
            estaAutorizado={estaAutorizado}
            serverIp={serverInfo?.server_ip ?? null}
            modpackVersion={serverInfo?.modpack_version ?? null}
          />

        </div>
      </main>

      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(74,124,63,0.2), rgba(155,28,28,0.15), transparent)'
      }} />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '1px', background: 'rgba(255,255,255,0.055)',
        borderTop: '1px solid rgba(255,255,255,0.055)'
      }}>
        <div style={{ background: 'var(--bg)' }}><LorePreview /></div>
        <div style={{ background: 'var(--bg)' }}><Anuncios /></div>
      </div>

      <Facciones />
      <NavCards />
    </div>
  )
}