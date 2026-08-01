import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import SolicitudForm from './components/SolicitudForm'

const ROLES_STAFF = ['admin', 'owner', 'moderador']

async function getAccessRequest(userId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ status: string }>>(
    `SELECT ar.status
     FROM access_requests ar
     JOIN temporadas t ON t.id = ar.temporada_id
     WHERE ar.user_id = $1 AND t.slug = 't3'
     ORDER BY ar.created_at DESC LIMIT 1`,
    userId
  )
  return rows[0] ?? null
}

async function getPerfilJugador(userId: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ status: string }>>(
    `SELECT pp.status
     FROM perfil_jugador pp
     JOIN temporadas t ON t.id = pp.temporada_id
     WHERE pp.user_id = $1 AND t.slug = 't3' AND pp.deleted_at IS NULL
     ORDER BY pp.created_at DESC LIMIT 1`,
    userId
  )
  return rows[0] ?? null
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

// Bloque de aviso reutilizable (mismo estilo que el de "pendiente")
function Aviso({
  icon,
  title,
  color,
  text,
}: {
  icon: string
  title: string
  color: string
  text: string
}) {
  return (
    <div
      style={{
        border: `1px solid ${color}4d`, // ~30% opacidad
        background: `${color}0a`, // ~4% opacidad
        padding: '28px 24px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '24px',
          color,
          letterSpacing: '0.06em',
          marginBottom: '8px',
        }}
      >
        {icon} {title}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px',
          color: 'var(--text-mid)',
          letterSpacing: '0.06em',
        }}
      >
        {text}
      </p>
    </div>
  )
}

export default async function SolicitudPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const esStaff = ROLES_STAFF.includes(session.user.rol)

  const [accessRequest, perfilJugador, jugadoresTotal] = await Promise.all([
    getAccessRequest(session.user.id),
    getPerfilJugador(session.user.id),
    getJugadoresCount(),
  ])

  const yaEsJugadorAprobado =
    accessRequest?.status === 'aprobado' || perfilJugador?.status === 'aprobado'

  // Determina qué se muestra en lugar del formulario, si aplica
  let aviso: React.ReactNode = null

  if (esStaff) {
    aviso = (
      <Aviso
        icon="🛡"
        title="Eres staff"
        color="var(--green-bright)"
        text="Como parte del equipo, ya tienes acceso completo a la Temporada 3. No necesitas rellenar este formulario."
      />
    )
  } else if (yaEsJugadorAprobado) {
    aviso = (
      <Aviso
        icon="✅"
        title="Ya tienes acceso"
        color="var(--green-bright)"
        text="Tu solicitud ya fue aprobada — puedes entrar directamente a tu perfil."
      />
    )
  } else if (accessRequest?.status === 'pendiente') {
    aviso = (
      <Aviso
        icon="⏳"
        title="Solicitud pendiente"
        color="#c9962a"
        text="Ya tienes una solicitud en revisión. Te avisaremos cuando haya respuesta."
      />
    )
  }

  return (
    <>
      <NavController jugadores={jugadoresTotal} session={session} />
      <div style={{ paddingTop: '114px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 32px 100px' }}>

          {/* Cabecera */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '10px', letterSpacing: '0.28em',
              textTransform: 'uppercase' as const,
              color: 'var(--green-bright)', opacity: 0.75,
              marginBottom: '8px', fontWeight: 600
            }}>
              Temporada 3 · Apocalipsis
            </p>
            <h1 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '48px', color: 'var(--bone)',
              letterSpacing: '0.04em', lineHeight: 1,
              marginBottom: '8px'
            }}>
              Solicitar acceso
            </h1>
            {!aviso && (
              <p style={{
                fontFamily: 'var(--font-special-elite)',
                fontSize: '13px', color: 'var(--text-mid)',
                lineHeight: 1.8
              }}>
                Rellena el formulario para solicitar acceso a la Temporada 3.
                Un admin revisará tu solicitud y te avisará cuando haya una respuesta.
              </p>
            )}
          </div>

          {aviso ?? <SolicitudForm estaRechazado={accessRequest?.status === 'rechazado'} />}
        </div>
      </div>
      <Footer />
    </>
  )
}