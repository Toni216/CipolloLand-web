import Link from 'next/link'

const cards = [
  { num: '01', titulo: 'Normas',     desc: 'Reglas de convivencia y rol del servidor.', href: '/t3/normas' },
  { num: '02', titulo: 'Personajes', desc: 'Barón Von Feli, el Lich y los supervivientes de Puerto Payo.', href: '/t3/personajes' },
  { num: '03', titulo: 'Eventos',    desc: 'Misiones globales y momentos clave del rol.', href: '/t3/eventos' },
  { num: '04', titulo: 'Foro',       desc: 'Debates, teorías y avisos de la comunidad.', href: '/t3/foro' },
  { num: '05', titulo: 'Mapa',       desc: 'Mapa de Puerto Payo.', href: '/t3/mapa' },
  { num: '06', titulo: 'Modpack',    desc: 'Descarga e instala el modpack de la temporada.', href: '/t3/modpack' },
  
]

export default function NavCards() {
  return (
    <>
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(74,124,63,0.2), rgba(155,28,28,0.15), transparent)'
      }} />

      {/* Título de sección */}
            <div style={{
                background: 'var(--bg2)',
                padding: '32px 40px 24px',
                borderTop: '1px solid rgba(255,255,255,0.055)',
                }}>
            <div style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    color: 'var(--bone)',
                    letterSpacing: '0.06em',
                    lineHeight: 1,
                    marginBottom: '8px'
                }}>
                    Explora la edición
            </div>
            <div style={{
                    width: '40px', height: '2px',
                    background: 'linear-gradient(to right, var(--blood), var(--green-dim))'
                }} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.055)',
            }}>
            {cards.map(c => (
            <Link key={c.num} href={c.href}
                className="nav-card"
                style={{
                background: 'var(--bg2)',
                padding: '32px 36px',
                textDecoration: 'none',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
                transition: 'background 0.2s',
                }}
            >
            <div style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '13px', color: 'var(--text-dim)',
              letterSpacing: '0.2em', marginBottom: '12px'
            }}>
              {c.num}
            </div>
            <div style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '28px', color: 'var(--bone)',
              letterSpacing: '0.06em', marginBottom: '8px',
              lineHeight: 1
            }}>
              {c.titulo}
            </div>
            <p style={{
              fontFamily: 'var(--font-special-elite)',
              fontSize: '12px', color: 'var(--text-mid)',
              lineHeight: 1.7, flex: 1
            }}>
              {c.desc}
            </p>
            <div style={{
              marginTop: '20px',
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '18px', color: 'var(--green-bright)',
              opacity: 0.6
            }}>
              ↗
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}