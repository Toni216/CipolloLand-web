import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import ListaUsuarios from './components/ListaUsuarios'
import Link from 'next/link'

async function getUsuarios() {
  const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })

  const [usuarios, solicitudesAprobadas, badgesDisponibles] = await Promise.all([
    prisma.users.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user_badges_user_badges_user_idTousers: {
          include: { badges: true },
        },
      },
    }),
    temporada
      ? prisma.access_requests.findMany({
          where: { temporada_id: temporada.id, status: 'aprobado' },
          select: { user_id: true, slots_permitidos: true },
        })
      : [],
    prisma.badges.findMany({ orderBy: { nombre: 'asc' } }),
  ])

  const slotsPorUsuario = new Map(
    solicitudesAprobadas.map(s => [s.user_id, s.slots_permitidos])
  )

  const usuariosFormateados = usuarios.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    rol: u.rol,
    minecraft_username: u.minecraft_username,
    deleted_at: u.deleted_at,
    created_at: u.created_at,
    slots_permitidos: slotsPorUsuario.get(u.id) ?? null,
    badges: u.user_badges_user_badges_user_idTousers.map(ub => ({
      user_badge_id: ub.id,
      badge_id: ub.badge_id,
      nombre: ub.badges.nombre,
      color: ub.badges.color,
    })),
  }))

  return { usuarios: usuariosFormateados, badgesDisponibles }
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

export default async function UsuariosAdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!['admin', 'owner'].includes(session.user.rol)) redirect('/t3')

  const [{ usuarios, badgesDisponibles }, jugadores] = await Promise.all([
    getUsuarios(),
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
            color: l.href === '/admin/usuarios' ? 'var(--green-bright)' : 'var(--text-dim)',
            textDecoration: 'none', padding: '0 14px',
            borderBottom: l.href === '/admin/usuarios' ? '2px solid var(--green-bright)' : '2px solid transparent',
            height: '44px', display: 'flex', alignItems: 'center',
            transition: 'color 0.2s'
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ paddingTop: '158px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 100px' }}>

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
              Usuarios
            </h1>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', color: 'var(--text-mid)',
              letterSpacing: '0.06em'
            }}>
              {usuarios.length} usuarios registrados
              · {usuarios.filter(u => u.deleted_at).length} baneados
            </div>
          </div>

          <ListaUsuarios
            usuarios={usuarios}
            badgesDisponibles={badgesDisponibles}
            miId={session.user.id}
            miRol={session.user.rol}
          />
        </div>
      </div>
      <Footer />
    </>
  )
}