import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NavController from '@/app/t3/components/NavController'
import Footer from '@/app/t3/components/Footer'
import SolicitudForm from './components/SolicitudForm'

export default async function SolicitudPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Comprobar si ya tiene solicitud activa
  const solicitudes = await prisma.$queryRawUnsafe<Array<{
    status: string
  }>>(
    `SELECT ar.status
     FROM access_requests ar
     JOIN temporadas t ON t.id = ar.temporada_id
     WHERE ar.user_id = $1 AND t.slug = 't3'
     ORDER BY ar.created_at DESC LIMIT 1`,
    session.user.id
  )

  const solicitud = solicitudes[0] ?? null

  // Si ya está aprobado, redirige al perfil
  if (solicitud?.status === 'aprobado') redirect('/perfil')

  // Si tiene una pendiente, muestra mensaje
  const jugadores = await prisma.$queryRawUnsafe<[{ count: string }]>(
    `SELECT COUNT(*)::text as count
     FROM perfil_jugador pp
     JOIN temporadas t ON t.id = pp.temporada_id
     WHERE pp.status = 'aprobado' AND pp.deleted_at IS NULL AND t.slug = 't3'`
  )

  return (
    <>
      <NavController jugadores={parseInt(jugadores[0].count)} session={session} />
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
            <p style={{
              fontFamily: 'var(--font-special-elite)',
              fontSize: '13px', color: 'var(--text-mid)',
              lineHeight: 1.8
            }}>
              Rellena el formulario para solicitar acceso a la Temporada 3. 
              Un admin revisará tu solicitud y te avisará cuando haya una respuesta.
            </p>
          </div>

          {solicitud?.status === 'pendiente' ? (
            <div style={{
              border: '1px solid rgba(201,150,42,0.3)',
              background: 'rgba(201,150,42,0.04)',
              padding: '28px 24px'
            }}>
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: '24px',
                color: '#c9962a', letterSpacing: '0.06em', marginBottom: '8px'
              }}>
                ⏳ Solicitud pendiente
              </div>
              <p style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '13px', color: 'var(--text-mid)', letterSpacing: '0.06em'
              }}>
                Ya tienes una solicitud en revisión. Te avisaremos cuando haya respuesta.
              </p>
            </div>
          ) : (
            <SolicitudForm estaRechazado={solicitud?.status === 'rechazado'} />
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}