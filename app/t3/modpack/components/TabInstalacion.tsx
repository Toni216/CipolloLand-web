import Image from 'next/image'

const pasos = [
  {
    num: '01',
    tag: 'Cuenta',
    titulo: 'Instala Modrinth e inicia sesión',
    desc: 'Descarga el launcher de Modrinth desde modrinth.com/app e inicia sesión con tu cuenta de Microsoft, la misma con la que compraste Minecraft.',
    tip: 'Si nunca has vinculado tu cuenta de Microsoft al launcher, Modrinth te guiará por el proceso la primera vez que abras la app.',
    captura: null,
  },
  {
    num: '02',
    tag: 'Instancia',
    titulo: 'Añade una nueva instancia',
    desc: 'En el launcher, haz clic en el botón "+" de la parte izquierda para crear una nueva instancia de juego.',
    tip: null,
    captura: '/tutorial/paso_1.png',
    imgW: 1923, imgH: 1034,
  },
  {
    num: '03',
    tag: 'Origen',
    titulo: 'Elige la opción central',
    desc: 'Se abrirá una ventana con 3 opciones para crear la instancia. Selecciona la del medio.',
    tip: null,
    captura: '/tutorial/paso_2.png',
    imgW: 514, imgH: 534,
  },
  {
    num: '04',
    tag: 'Importar',
    titulo: 'Importa el modpack',
    desc: 'Pulsa "Import modpack", busca el archivo .mrpack que descargaste desde la pestaña de Descarga y selecciónalo.',
    tip: null,
    captura: '/tutorial/paso_3.png',
    imgW: 512, imgH: 352,
  },
  {
    num: '05',
    tag: 'Configuración',
    titulo: 'Ve a los ajustes mientras se descarga',
    desc: 'El modpack empezará a descargarse, puede tardar un rato. Mientras esperas, entra en los ajustes para configurar la memoria RAM.',
    tip: null,
    captura: '/tutorial/paso_4.png',
    imgW: 153, imgH: 1030,
  },
  {
    num: '06',
    tag: 'RAM',
    titulo: 'Ajusta la memoria asignada',
    desc: 'Dentro de "Default instance options" encontrarás "Memory allocated". Ahí defines cuánta RAM podrá usar el juego.',
    tip: 'El valor se pone en MB. 1 GB son 1024 MB. Recomendamos entre 6 y 8 GB, es decir, entre 6144 y 8192 MB.',
    warn: true,
    captura: '/tutorial/paso_5.png',
    imgW: 943, imgH: 709,
  },
]

export default function TabInstalacion() {
  return (
    <div style={{ padding: '48px 40px' }}>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '10px', letterSpacing: '0.28em',
        textTransform: 'uppercase' as const,
        color: 'var(--green-bright)', opacity: 0.75,
        marginBottom: '32px', fontWeight: 600
      }}>
        Guía de instalación
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px' }}>
        {pasos.map(p => (
          <div key={p.num} style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: '0',
            background: 'rgba(255,255,255,0.055)',
          }}>
            {/* Número */}
            <div style={{
              background: 'var(--bg2)',
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'center', padding: '28px 0',
              borderRight: '1px solid rgba(255,255,255,0.055)'
            }}>
              <span style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '28px', color: 'var(--text-dim)',
                letterSpacing: '0.06em'
              }}>{p.num}</span>
            </div>

            {/* Contenido */}
            <div style={{ background: 'var(--bg)', padding: '28px 32px' }}>
              <div style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '9px', letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: 'var(--green-bright)', opacity: 0.6,
                marginBottom: '6px'
              }}>{p.tag}</div>

              <div style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '22px', color: 'var(--bone)',
                letterSpacing: '0.04em', marginBottom: '10px'
              }}>{p.titulo}</div>

              <p style={{
                fontFamily: 'var(--font-special-elite)',
                fontSize: '13px', color: 'var(--text-mid)',
                lineHeight: 1.8, marginBottom: '12px'
              }}>{p.desc}</p>

              {/* Captura real */}
              {p.captura && (
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  width: 'fit-content',
                  maxHeight: '420px',
                  border: '1px solid rgba(255,255,255,0.055)',
                  background: 'var(--bg2)',
                  marginBottom: '12px',
                  padding: '12px',
                }}>
                  <Image
                    src={p.captura}
                    alt={`Captura de pantalla — ${p.titulo}`}
                    width={p.imgW}
                    height={p.imgH}
                    style={{
                      width: 'auto', height: 'auto',
                      maxWidth: '100%', maxHeight: '396px',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}

              {/* Tip / Aviso */}
              {p.tip && (
                <div style={{
                  display: 'inline-flex', gap: '10px', alignItems: 'flex-start',
                  padding: '12px 16px',
                  maxWidth: '520px',
                  background: p.warn ? 'rgba(155,28,28,0.05)' : 'rgba(74,124,63,0.04)',
                  border: p.warn ? '1px solid rgba(155,28,28,0.25)' : '1px solid rgba(74,124,63,0.15)',
                }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{p.warn ? '⚠️' : '💡'}</span>
                  <span style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontSize: '13.5px', color: 'var(--text-mid)',
                    letterSpacing: '0.03em', lineHeight: 1.65
                  }}>{p.tip}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}