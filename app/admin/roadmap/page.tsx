import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import GestionRoadmap from './components/GestionRoadmap'
import Link from 'next/link'

async function getDatos() {
  const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
  if (!temporada) return { items: [], sugerencias: [], jugadores: 0 }

  const [items, sugerencias, jugadores] = await Promise.all([
    prisma.roadmap_items.findMany({
      where: { temporada_id: temporada.id },
      orderBy: { created_at: 'desc' },
      include: {
        sugerencias: { select: { id: true, titulo: true } },
      },
    }),
    prisma.sugerencias.findMany({
      where: { temporada_id: temporada.id },
      select: { id: true, titulo: true },
      orderBy: { created_at: 'desc' },
    }),
    prisma.perfil_jugador.count({ where: { temporada_id: temporada.id, status: 'aprobado', deleted_at: null } }),
  ])

  return {
    items: items.map(i => ({
      id: i.id,
      titulo: i.titulo,
      descripcion: i.descripcion,
      estado: i.estado,
      sugerencia_id: i.sugerencia_id,
      sugerenciaTitulo: i.sugerencias?.titulo ?? null,
      created_at: i.created_at,
    })),
    sugerencias,
    jugadores,
  }
}

export default async function RoadmapAdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!['admin', 'owner'].includes(session.user.rol)) redirect('/t3')

  const { items, sugerencias, jugadores } = await getDatos()

  return (
    <>
      <NavController jugadores={jugadores} session={session} />

      <div style={{
        position: 'fixed', top: '114px', left: 0, right: 0, zIndex: 400,
        background: 'rgba(9,10,7,0.97)', borderBottom: '1px solid rgba(255,255,255,0.055)',
        padding: '0 36px', display: 'flex', alignItems: 'center', height: '44px'
      }}>
        <Link href="/perfil" style={{
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const, color: 'var(--text-dim)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px 0 0',
          borderRight: '1px solid rgba(255,255,255,0.055)', marginRight: '16px',
        }}>
          ← Perfil
        </Link>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', letterSpacing: '0.25em',
          textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginRight: '16px'
        }}>
          Admin
        </div>
        {[
          { label: 'Panel', href: '/admin' },
          { label: 'Solicitudes', href: '/admin/solicitudes' },
          { label: 'Usuarios', href: '/admin/usuarios' },
          { label: 'Anuncios', href: '/admin/anuncios' },
          { label: 'Sugerencias', href: '/admin/sugerencias' },
          { label: 'Roadmap', href: '/admin/roadmap' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: l.href === '/admin/roadmap' ? 'var(--green-bright)' : 'var(--text-dim)',
            textDecoration: 'none', padding: '0 14px',
            borderBottom: l.href === '/admin/roadmap' ? '2px solid var(--green-bright)' : '2px solid transparent',
            height: '44px', display: 'flex', alignItems: 'center',
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ paddingTop: '158px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 32px 100px' }}>

          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.28em',
              textTransform: 'uppercase' as const, color: 'var(--green-bright)', opacity: 0.75,
              marginBottom: '8px', fontWeight: 600
            }}>
              Admin · T3
            </div>
            <h1 style={{
              fontFamily: 'var(--font-bebas)', fontSize: '48px', color: 'var(--bone)',
              letterSpacing: '0.04em', lineHeight: 1,
            }}>
              Roadmap
            </h1>
          </div>

          <GestionRoadmap items={items} sugerencias={sugerencias} />
        </div>
      </div>
      <Footer />
    </>
  )
}