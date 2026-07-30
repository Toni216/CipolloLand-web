import Link from 'next/link'

export default function SecAdmin() {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '28px', color: 'var(--bone)',
          letterSpacing: '0.04em', lineHeight: 1
        }}>Panel Especial</h2>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '12px', color: 'var(--text-dim)',
          letterSpacing: '0.08em', marginTop: '4px'
        }}>Accesos rápidos de administración</div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '1px', background: 'rgba(255,255,255,0.055)'
      }}>
        {[
          { label: 'Panel de admin',      href: '/admin' },
          { label: 'Solicitudes',         href: '/admin/solicitudes' },
          { label: 'Gestionar usuarios',  href: '/admin/usuarios' },
          { label: 'Publicar anuncio',    href: '/admin/anuncios' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            background: 'var(--bg2)', padding: '20px 24px',
            textDecoration: 'none', display: 'block',
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '13px', color: 'var(--text-mid)',
            letterSpacing: '0.06em', transition: 'background 0.2s'
          }}>
            {item.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}