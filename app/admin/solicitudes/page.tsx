import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import ListaSolicitudes from './components/ListaSolicitudes'
import Link from 'next/link'

async function getSolicitudes() {
  return prisma.$queryRawUnsafe<Array<{
    id: string
    user_id: string | null
    username: string | null
    email: string | null
    status: string
    tipo_solicitud: string
    motivacion: string | null
    how_found: string | null
    recomendado_por: string | null
    is_adult: boolean | null
    motivo_rechazo: string | null
    slots_permitidos: number
    created_at: Date
    revisado_en: Date | null
  }>>(
    `SELECT 
       ar.id, ar.user_id, ar.status, ar.tipo_solicitud,
       ar.motivacion, ar.how_found, ar.recomendado_por,
       ar.is_adult, ar.motivo_rechazo, ar.slots_permitidos,
       ar.created_at, ar.revisado_en,
       u.username, u.email
     FROM access_requests ar
     LEFT JOIN users u ON u.id = ar.user_id
     JOIN temporadas t ON t.id = ar.temporada_id
     WHERE t.slug = 't3'
     ORDER BY 
       CASE ar.status WHEN 'pendiente' THEN 0 WHEN 'aprobado' THEN 1 ELSE 2 END,
       ar.created_at DESC`
  )
}

async function getJugadores() {
  return prisma.$queryRawUnsafe<[{ count: string }]>(
    `SELECT COUNT(*)::text as count
     FROM perfil_jugador pp
     JOIN temporadas t ON t.id = pp.temporada_id
     WHERE pp.status = 'aprobado'
       AND pp.deleted_at IS NULL
       AND t.slug = 't3'`
  )
}

export default async function SolicitudesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!['admin', 'owner'].includes(session.user.rol)) redirect('/t3')

  const [solicitudes, jugadoresCount] = await Promise.all([
    getSolicitudes(),
    getJugadores(),
  ])

  const jugadores = parseInt(jugadoresCount[0].count)

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
      {/* Volver */}
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

      {/* Separador */}
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '9px', letterSpacing: '0.25em',
        textTransform: 'uppercase' as const,
        color: 'var(--text-dim)', marginRight: '16px'
      }}>
        Admin
      </div>

      {/* Links de admin */}
      {[
        { label: 'Panel',       href: '/admin' },
        { label: 'Solicitudes', href: '/admin/solicitudes' },
        { label: 'Usuarios',    href: '/admin/usuarios' },
        { label: 'Anuncios',    href: '/admin/anuncios' },
        { label: 'Sugerencias', href: '/admin/sugerencias' },
      ].map(l => (
        <Link key={l.href} href={l.href} style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: l.href === '/admin/solicitudes' ? 'var(--green-bright)' : 'var(--text-dim)',
          textDecoration: 'none', padding: '0 14px',
          borderBottom: l.href === '/admin/solicitudes' ? '2px solid var(--green-bright)' : '2px solid transparent',
          height: '44px', display: 'flex', alignItems: 'center',
          transition: 'color 0.2s'
        }}>
          {l.label}
        </Link>
      ))}
    </div>

      <div style={{ paddingTop: '158px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 100px' }}>

          {/* Cabecera */}
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
              Solicitudes de acceso
            </h1>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', color: 'var(--text-mid)',
              letterSpacing: '0.06em'
            }}>
              {solicitudes.filter(s => s.status === 'pendiente').length} pendientes
              · {solicitudes.filter(s => s.status === 'aprobado').length} aprobadas
              · {solicitudes.filter(s => s.status === 'rechazado').length} rechazadas
            </div>
          </div>

          <ListaSolicitudes solicitudes={solicitudes} />
        </div>
      </div>
      <Footer />
    </>
  )
}