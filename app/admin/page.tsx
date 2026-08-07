import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import GestionInsignias from './components/GestionInsignias'
import Link from 'next/link'

const seccionStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.055)',
  background: 'var(--bg2)',
  padding: '24px 28px',
  marginBottom: '20px',
}

const tituloSeccion: React.CSSProperties = {
  fontFamily: 'var(--font-bebas)', fontSize: '22px',
  color: 'var(--bone)', letterSpacing: '0.05em', marginBottom: '16px',
}

async function getDatosPanel() {
  const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
  if (!temporada) return null
  const temporadaId = temporada.id

  const [
    pendientes, totalUsuarios, baneadosCount, totalAnuncios, jugadoresAprobados,
    ultimosUsuarios, ultimosPersonajes, ultimasSolicitudes,
    porFaccion, porRaza, porClase,
    staff, ultimosBaneados,
    badges,
  ] = await Promise.all([
    prisma.access_requests.count({ where: { temporada_id: temporadaId, status: 'pendiente' } }),
    prisma.users.count(),
    prisma.users.count({ where: { deleted_at: { not: null } } }),
    prisma.anuncios.count({ where: { temporada_id: temporadaId } }),
    prisma.perfil_jugador.count({ where: { temporada_id: temporadaId, status: 'aprobado', deleted_at: null } }),

    prisma.users.findMany({ take: 5, orderBy: { created_at: 'desc' }, select: { username: true, created_at: true } }),
    prisma.perfil_jugador.findMany({
      where: { temporada_id: temporadaId }, take: 5, orderBy: { created_at: 'desc' },
      select: {
        nombre_pj: true, created_at: true, es_npc: true,
        users_perfil_jugador_user_idTousers: { select: { username: true } },
      },
    }),
    prisma.access_requests.findMany({
      where: { temporada_id: temporadaId }, take: 5, orderBy: { created_at: 'desc' },
      select: {
        status: true, created_at: true,
        users_access_requests_user_idTousers: { select: { username: true } },
      },
    }),

    prisma.perfil_jugador.groupBy({
      by: ['faccion_pj'], where: { temporada_id: temporadaId, status: 'aprobado', deleted_at: null }, _count: true,
    }),
    prisma.perfil_jugador.groupBy({
      by: ['raza_pj'], where: { temporada_id: temporadaId, status: 'aprobado', deleted_at: null }, _count: true,
    }),
    prisma.perfil_jugador.groupBy({
      by: ['clase_pj'], where: { temporada_id: temporadaId, status: 'aprobado', deleted_at: null }, _count: true,
    }),

    prisma.users.findMany({
      where: { rol: { in: ['admin', 'owner', 'moderador'] }, deleted_at: null },
      orderBy: { rol: 'asc' },
      select: { username: true, rol: true },
    }),
    prisma.users.findMany({
      where: { deleted_at: { not: null } }, take: 5, orderBy: { deleted_at: 'desc' },
      select: { username: true, deleted_at: true },
    }),

    prisma.badges.findMany({
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { user_badges: true } } },
    }),
  ])

  // Actividad combinada
  type Actividad = { tipo: string; texto: string; fecha: Date }
  const actividad: Actividad[] = [
    ...ultimosUsuarios.map(u => ({ tipo: '👤', texto: `${u.username} se registró`, fecha: u.created_at })),
    ...ultimosPersonajes.map(p => ({
      tipo: '🧟',
      texto: `Personaje "${p.nombre_pj}" creado${p.es_npc ? ' (NPC)' : p.users_perfil_jugador_user_idTousers ? ` para ${p.users_perfil_jugador_user_idTousers.username}` : ' (sin dueño)'}`,
      fecha: p.created_at,
    })),
    ...ultimasSolicitudes.map(s => ({
      tipo: '📋',
      texto: `Solicitud de ${s.users_access_requests_user_idTousers?.username ?? '?'} (${s.status})`,
      fecha: s.created_at,
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 10)

  return {
    pendientes, totalUsuarios, baneadosCount, totalAnuncios, jugadoresAprobados,
    actividad, porFaccion, porRaza, porClase, staff, ultimosBaneados, badges,
  }
}

function BarraReparto({ titulo, datos }: { titulo: string, datos: { key: string, count: number }[] }) {
  const total = datos.reduce((acc, d) => acc + d.count, 0) || 1
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
        letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)',
        marginBottom: '8px',
      }}>
        {titulo}
      </div>
      {datos.length === 0 ? (
        <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12px', color: 'var(--text-dim)' }}>
          Sin datos todavía.
        </span>
      ) : datos.map(d => (
        <div key={d.key} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--text-mid)', marginBottom: '2px' }}>
            <span>{d.key}</span>
            <span>{d.count}</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', width: `${(d.count / total) * 100}%`, background: 'var(--green-bright)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (!['admin', 'owner'].includes(session.user.rol)) redirect('/t3')

  const datos = await getDatosPanel()
  if (!datos) redirect('/t3')

  const {
    pendientes, totalUsuarios, baneadosCount, totalAnuncios, jugadoresAprobados,
    actividad, porFaccion, porRaza, porClase, staff, ultimosBaneados, badges,
  } = datos

  const tarjetas = [
    { label: 'Solicitudes', href: '/admin/solicitudes', valor: pendientes, valorLabel: 'pendientes', acento: pendientes > 0 ? 'var(--blood-bright)' : 'var(--green-bright)' },
    { label: 'Usuarios', href: '/admin/usuarios', valor: totalUsuarios, valorLabel: `registrados · ${baneadosCount} baneados`, acento: 'var(--green-bright)' },
    { label: 'Anuncios', href: '/admin/anuncios', valor: totalAnuncios, valorLabel: 'publicados', acento: 'var(--green-bright)' },
    { label: 'Personajes', href: '/admin/usuarios', valor: jugadoresAprobados, valorLabel: 'aprobados en T3', acento: 'var(--green-bright)' },
  ]

  return (
    <>
      <NavController jugadores={jugadoresAprobados} session={session} />

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
            color: l.href === '/admin' ? 'var(--green-bright)' : 'var(--text-dim)',
            textDecoration: 'none', padding: '0 14px',
            borderBottom: l.href === '/admin' ? '2px solid var(--green-bright)' : '2px solid transparent',
            height: '44px', display: 'flex', alignItems: 'center',
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ paddingTop: '158px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 100px' }}>

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
              Panel de administración
            </h1>
          </div>

          {/* Tarjetas resumen */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1px', background: 'rgba(255,255,255,0.055)', marginBottom: '20px',
          }}>
            {tarjetas.map((t, i) => (
              <Link key={i} href={t.href} style={{ background: 'var(--bg2)', padding: '22px 24px', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: '8px' }}>
                  {t.label}
                </div>
                <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '34px', color: t.acento, lineHeight: 1, marginBottom: '4px' }}>
                  {t.valor}
                </div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)' }}>
                  {t.valorLabel}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
            <div>
              {/* Actividad reciente */}
              <div style={seccionStyle}>
                <div style={tituloSeccion}>Actividad reciente</div>
                {actividad.length === 0 ? (
                  <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12px', color: 'var(--text-dim)' }}>
                    Sin actividad todavía.
                  </span>
                ) : actividad.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '10px', alignItems: 'baseline',
                    padding: '8px 0', borderBottom: i < actividad.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                  }}>
                    <span style={{ fontSize: '13px' }}>{a.tipo}</span>
                    <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12.5px', color: 'var(--text-mid)', flex: 1 }}>
                      {a.texto}
                    </span>
                    <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {new Date(a.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Insignias */}
              <div style={seccionStyle}>
                <div style={tituloSeccion}>Insignias</div>
                <GestionInsignias badges={badges} />
              </div>
            </div>

            <div>
              {/* Reparto de personajes */}
              <div style={seccionStyle}>
                <div style={tituloSeccion}>Reparto de personajes</div>
                <BarraReparto titulo="Facción" datos={porFaccion.map(f => ({ key: f.faccion_pj ?? 'Sin asignar', count: f._count }))} />
                <BarraReparto titulo="Raza" datos={porRaza.map(r => ({ key: r.raza_pj ?? 'Sin asignar', count: r._count }))} />
                <BarraReparto titulo="Clase" datos={porClase.map(c => ({ key: c.clase_pj ?? 'Sin asignar', count: c._count }))} />
              </div>

              {/* Staff actual */}
              <div style={seccionStyle}>
                <div style={tituloSeccion}>Staff actual</div>
                {staff.map(s => (
                  <div key={s.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--bone-dim)' }}>{s.username}</span>
                    <span style={{
                      color: s.rol === 'owner' ? 'var(--blood-bright)' : s.rol === 'admin' ? 'var(--green-bright)' : '#c9962a',
                      fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      {s.rol}
                    </span>
                  </div>
                ))}
              </div>

              {/* Últimos baneados */}
              <div style={seccionStyle}>
                <div style={tituloSeccion}>Últimos baneados</div>
                {ultimosBaneados.length === 0 ? (
                  <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12px', color: 'var(--text-dim)' }}>
                    Nadie baneado por ahora.
                  </span>
                ) : ultimosBaneados.map(u => (
                  <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--bone-dim)' }}>{u.username}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                      {u.deleted_at && new Date(u.deleted_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}