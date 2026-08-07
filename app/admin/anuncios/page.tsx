import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import ListaAnuncios from './components/ListaAnuncios'
import Link from 'next/link'

async function getAnuncios() {
  return prisma.anuncios.findMany({
    where: { temporadas: { slug: 't3' } },
    orderBy: [
      { pinned: 'desc' },
      { created_at: 'desc' },
    ],
    include: { users: { select: { username: true } } },
  })
}

async function getJugadoresCount() {
  const rows = await prisma.$queryRawUnsafe<[{ count: string }]>(
    `SELECT COUNT(*)::text as count
     FROM perfil_jugador pp
     JOIN temporadas t ON t.id = pp.temporada_id
     WHERE pp.status = 'aprobado' AND pp.deleted_at IS NULL AND t.slug = 't3'`
  )
  return parseInt(rows[0].count)
}

export default async function AnunciosAdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!['admin', 'owner'].includes(session.user.rol)) redirect('/t3')

  const [anuncios, jugadores] = await Promise.all([
    getAnuncios(),
    getJugadoresCount(),
  ])

  return (
    <>
      <NavController jugadores={jugadores} session={session} />

      {/* Barra de admin */}
      <div style={{
        position: 'fixed', top: '114px', left: 0, right: 0,
        zIndex: 400,
        background: 'rgba(9,10,7,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        padding: '0 36px',
        display: 'flex', alignItems: 'center', gap: '0',
        height: '44px'
      }}>
        <Link href="/perfil" style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-dim)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '0 16px 0 0',
          borderRight: '1px solid rgba(255,255,255,0.055)',
          marginRight: '16px',
          transition: 'color 0.2s'
        }}>
          ← Perfil
        </Link>

        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '9px', letterSpacing: '0.25em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-dim)', marginRight: '16px'
        }}>
          Admin
        </div>

        {[
          { label: 'Panel',       href: '/admin' },
          { label: 'Solicitudes', href: '/admin/solicitudes' },
          { label: 'Usuarios',    href: '/admin/usuarios' },
          { label: 'Anuncios',    href: '/admin/anuncios' },
          { label: 'Sugerencias', href: '/admin/sugerencias' },
          { label: 'Roadmap', href: '/admin/roadmap' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: l.href === '/admin/anuncios' ? 'var(--green-bright)' : 'var(--text-dim)',
            textDecoration: 'none', padding: '0 14px',
            borderBottom: l.href === '/admin/anuncios' ? '2px solid var(--green-bright)' : '2px solid transparent',
            height: '44px', display: 'flex', alignItems: 'center',
            transition: 'color 0.2s'
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ paddingTop: '158px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px 100px' }}>

          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '10px', letterSpacing: '0.28em',
              textTransform: 'uppercase' as const,
              color: 'var(--green-bright)', opacity: 0.75,
              marginBottom: '8px', fontWeight: 600
            }}>
              Admin · T3
            </div>
            <h1 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '48px', color: 'var(--bone)',
              letterSpacing: '0.04em', lineHeight: 1,
              marginBottom: '8px'
            }}>
              Anuncios
            </h1>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', color: 'var(--text-mid)',
              letterSpacing: '0.06em'
            }}>
              {anuncios.length} anuncio{anuncios.length !== 1 ? 's' : ''} publicado{anuncios.length !== 1 ? 's' : ''}
            </div>
          </div>

          <ListaAnuncios anuncios={anuncios} />
        </div>
      </div>
      <Footer />
    </>
  )
}