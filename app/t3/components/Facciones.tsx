import Link from 'next/link'
import Image from 'next/image'

const facciones = [
  {
    nombre: 'Protocolo Lázaro',
    icono: '/lazaro.png',
    tag: 'Facción',
    desc: 'Científicos, investigadores y soñadores que se niegan a aceptar este destino. Creen que aún es posible restaurar el equilibrio del mundo… y quizás, devolver la magia.',
    color: '#20B2AA',
    glow: 'rgba(32,178,170,0.15)',
    border: 'rgba(32,178,170,0.3)',
    href: '/t3/facciones/lazaro',
    btnStyle: {
      border: '1px solid rgba(32,178,170,0.4)',
      color: '#20B2AA',
      background: 'transparent',
    }
  },
  {
    nombre: 'Las Cucarachas',
    icono: '/cucarachas.png',
    tag: 'Facción',
    desc: 'Ni el fin del mundo acabará con nosotros. La supervivencia es adaptarse a las nuevas adversidades y controlarlas a su favor. Si este mundo decide deshacerse de la humanidad, la humanidad se hará uno con el mundo.',
    color: '#c9962a',
    glow: 'rgba(201,150,42,0.15)',
    border: 'rgba(201,150,42,0.3)',
    href: '/t3/facciones/cucarachas',
    btnStyle: {
      border: '1px solid rgba(201,150,42,0.4)',
      color: '#c9962a',
      background: 'transparent',
    }
  },
  {
    nombre: 'Los Vestigios',
    icono: '/vestigios.png',
    tag: 'Sin Facción',
    desc: 'Perdidos en un mar de escombros y muertos. Guiados por instinto pero no por ideales, no se someten a ideologías o facciones. Todos hemos sido vestigios, y la vida sigue.',
    color: '#8a8070',
    glow: 'rgba(138,128,112,0.12)',
    border: 'rgba(138,128,112,0.25)',
    href: '/t3/facciones/vestigios',
    btnStyle: {
      border: '1px solid rgba(138,128,112,0.35)',
      color: '#8a8070',
      background: 'transparent',
    }
  },
]

export default function Facciones() {
  return (
    <>
      {/* Divisor */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(74,124,63,0.2), rgba(155,28,28,0.15), transparent)'
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '1px',
        background: 'rgba(255,255,255,0.055)',
        borderTop: '1px solid rgba(255,255,255,0.055)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}>
        {facciones.map(f => (
          <div key={f.nombre} style={{
            background: 'var(--bg)',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glow de fondo */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: f.color,
              opacity: 0.6
            }} />
            <div style={{
              position: 'absolute',
              top: 0, left: '-50%', right: '-50%',
              height: '120px',
              background: f.glow,
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }} />

            {/* Icono + Nombre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Image
                src={f.icono}
                alt={f.nombre}
                width={48}
                height={48}
                style={{ objectFit: 'contain' }}
            />
            <div style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: 'clamp(24px, 3vw, 40px)',
                color: 'var(--bone)',
                letterSpacing: '0.04em',
                lineHeight: 1
            }}>
                {f.nombre}
            </div>
            </div>

            {/* Tag */}
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '10px', letterSpacing: '0.28em',
              textTransform: 'uppercase' as const,
              color: f.color,
              marginBottom: '10px', fontWeight: 600, opacity: 0.75
            }}>
              {f.tag}
            </div>

            {/* Línea */}
            <div style={{
              width: '40px', height: '2px',
              background: f.color,
              marginBottom: '20px', opacity: 0.5
            }} />

            {/* Descripción */}
            <p style={{
              fontFamily: 'var(--font-special-elite)',
              fontSize: '13px', color: 'var(--text-mid)',
              lineHeight: 1.9
            }}>
              {f.desc}
            </p>

            {/* Botón */}
            <Link href={f.href} style={{
              display: 'inline-flex', alignItems: 'center',
              marginTop: '24px',
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '11px', letterSpacing: '0.18em',
              textTransform: 'uppercase' as const, fontWeight: 600,
              padding: '8px 16px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              ...f.btnStyle
            }}>
              Ver facción →
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}