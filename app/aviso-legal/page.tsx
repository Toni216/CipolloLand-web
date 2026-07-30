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

export default async function AvisoLegalPage() {
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
            Aviso Legal
          </h1>

          <Seccion titulo="1. Titularidad del proyecto">
            <p>
              CipolloLand (nombre, marca, logotipos, concepto de las temporadas y todo el
              contenido original de esta web) es un proyecto personal creado y mantenido
              por su administrador, quien se reserva todos los derechos sobre el nombre y
              el concepto de "CipolloLand" como comunidad e identidad de marca, incluso en
              su fase actual como proyecto sin ánimo de lucro. Cualquier uso comercial o
              reproducción del nombre, la marca o el concepto sin autorización expresa
              queda reservado a su titular.
            </p>
          </Seccion>

          <Seccion titulo="2. Naturaleza del proyecto">
            <p>
              Esta web es un proyecto personal desarrollado con fines de entretenimiento y
              comunidad, ligado a un servidor privado de Minecraft. No constituye, en su
              estado actual, una actividad mercantil ni una empresa registrada.
            </p>
          </Seccion>

          <Seccion titulo="3. Minecraft y propiedad intelectual de terceros">
            <p>
              CipolloLand no está afiliado, respaldado ni patrocinado por Mojang Studios,
              Microsoft, ni ninguna de sus filiales. "Minecraft" es una marca registrada de
              Mojang Synergies AB. Todo el contenido de mods de terceros utilizado en el
              modpack pertenece a sus respectivos autores y se enlaza siempre a sus
              fuentes originales (Modrinth, CurseForge).
            </p>
          </Seccion>

          <Seccion titulo="4. Condiciones de acceso">
            <p>
              El acceso al servidor y a las temporadas de rol requiere solicitud previa y
              aprobación por parte del equipo de administración, y está restringido a
              personas mayores de 18 años. El administrador se reserva el derecho de
              admisión y de expulsión de cualquier usuario que incumpla las normas de la
              comunidad.
            </p>
          </Seccion>

          <Seccion titulo="5. Contenido generado por los usuarios">
            <p>
              El contenido de rol (historias, personajes, descripciones) que los usuarios
              crean dentro de la plataforma sigue perteneciendo a sus autores. Al
              publicarlo en CipolloLand, el usuario concede al proyecto una licencia no
              exclusiva para mostrarlo dentro de la propia web mientras su cuenta
              permanezca activa.
            </p>
          </Seccion>

          <Seccion titulo="6. Limitación de responsabilidad">
            <p>
              CipolloLand se ofrece "tal cual", sin garantías de disponibilidad continua
              del servicio. El administrador no se hace responsable de pérdidas de datos
              de juego, interrupciones del servicio, ni de contenido publicado por
              terceros usuarios dentro de la plataforma.
            </p>
          </Seccion>

          <Seccion titulo="7. Contacto">
            <p>
              Para cualquier consulta legal relacionada con este aviso, puedes escribir a{' '}
              <a href="mailto:rmantoniomanuel.dev@proton.me" style={{ color: 'var(--green-bright)' }}>
                rmantoniomanuel.dev@proton.me
              </a>.
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