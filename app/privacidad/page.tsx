import Navbar from '@/app/t3/components/Navbar'
import Footer from '@/app/t3/components/Footer'
import { auth } from '@/auth'

function Seccion({ titulo, children }: { titulo: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontFamily: 'var(--font-bebas)', fontSize: '22px',
        color: 'var(--green-bright)', letterSpacing: '0.04em', marginBottom: '12px'
      }}>
        {titulo}
      </h2>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '14px',
        color: 'var(--text-mid)', lineHeight: 1.8
      }}>
        {children}
      </div>
    </div>
  )
}

export default async function PrivacidadPage() {
  const session = await auth()
  return (
    <>
      <Navbar session={session} />
      <div style={{ paddingTop: '150px', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 32px 100px' }}>

          <p style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
            letterSpacing: '0.28em', textTransform: 'uppercase' as const,
            color: 'var(--green-bright)', opacity: 0.75, marginBottom: '12px'
          }}>
            CipolloLand
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)', fontSize: 'clamp(40px, 6vw, 64px)',
            color: 'var(--bone)', letterSpacing: '0.02em', marginBottom: '40px', lineHeight: 1
          }}>
            Política de Privacidad
          </h1>

          <Seccion titulo="1. Responsable del tratamiento">
            <p>
              CipolloLand es un proyecto personal y comunitario, sin ánimo de lucro en su
              estado actual. El responsable del tratamiento de los datos recogidos a
              través de esta web es su administrador, contactable en{' '}
              <a href="mailto:rmantoniomanuel.dev@proton.me" style={{ color: 'var(--green-bright)' }}>
                rmantoniomanuel.dev@proton.me
              </a>.
            </p>
          </Seccion>

          <Seccion titulo="2. Qué datos recogemos">
            <p style={{ marginBottom: '10px' }}>Al crear una cuenta y usar la web, recogemos:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
              <li>Nombre de usuario y correo electrónico (o identificador de Discord, si inicias sesión así)</li>
              <li>Contraseña, almacenada siempre cifrada (nunca en texto plano)</li>
              <li>Nick de Minecraft, si decides vincularlo a tu cuenta</li>
              <li>Datos que añadas voluntariamente a tu perfil (biografía, usuario de Discord, información de tus personajes de rol)</li>
              <li>Estadísticas de juego (horas jugadas, muertes, bloques, etc.) generadas por tu actividad en el servidor de Minecraft</li>
            </ul>
          </Seccion>

          <Seccion titulo="3. Para qué usamos tus datos">
            <p>
              Únicamente para el funcionamiento de la comunidad: identificarte, gestionar
              el acceso a las temporadas de rol, mostrar tu perfil público (personajes,
              estadísticas, insignias) y permitir la moderación del servidor. No vendemos
              ni cedemos tus datos a terceros con fines publicitarios.
            </p>
          </Seccion>

          <Seccion titulo="4. Menores de edad">
            <p>
              El acceso a las temporadas de rol de CipolloLand está restringido a
              personas mayores de 18 años, confirmado explícitamente en el formulario de
              solicitud de acceso. No recogemos ni tratamos intencionadamente datos de
              menores de edad.
            </p>
          </Seccion>

          <Seccion titulo="5. Tus derechos">
            <p>
              Puedes solicitar en cualquier momento el acceso, rectificación o eliminación
              de tus datos, así como la eliminación completa de tu cuenta, escribiendo a{' '}
              <a href="mailto:rmantoniomanuel.dev@proton.me" style={{ color: 'var(--green-bright)' }}>
                rmantoniomanuel.dev@proton.me
              </a>.
            </p>
          </Seccion>

          <Seccion titulo="6. Cambios en esta política">
            <p>
              Esta política puede actualizarse a medida que el proyecto evolucione. Los
              cambios importantes se anunciarán a la comunidad a través de los canales
              oficiales del servidor.
            </p>
          </Seccion>

          <p style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
            color: 'var(--text-dim)', marginTop: '40px'
          }}>
            Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

        </div>
      </div>
      <Footer />
    </>
  )
}