import Link from 'next/link'
import Image from 'next/image'

const sociales = [
  {
    nombre: 'Discord', desc: 'Comunidad · Avisos · Rol',
    href: '#', color: '#5865F2',
    colorFaint: 'rgba(88,101,242,0.07)', colorHover: 'rgba(88,101,242,0.13)',
    svg: <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.127 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  },
  {
    nombre: 'WhatsApp', desc: 'Grupo · Amigos · Charlas',
    href: '#', color: '#25D366',
    colorFaint: 'rgba(37,211,102,0.06)', colorHover: 'rgba(37,211,102,0.11)',
    svg: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  },
]

const legal = [
  { label: 'Equipo',      href: '/equipo' },  
  { label: 'Normas',      href: '/normas' },
  { label: 'Privacidad',  href: '/privacidad' },
  { label: 'Aviso legal', href: '/aviso-legal' },
  { label: 'Contacto',    href: '/contacto' },
]

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(9,10,7,0.97)',
      borderTop: '1px solid rgba(74,124,63,0.2)',
      padding: '20px 36px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      alignItems: 'center',
      gap: '16px'
    }}>

      {/* Izquierda: logo + copyright debajo */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', justifySelf: 'start' }}>
        <Image
          src="/LOGOSOLOTEXTO.png"
          alt="CipolloLand"
          width={100}
          height={28}
          style={{ objectFit: 'contain', objectPosition: 'left' }}
        />
        <span style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', color: 'var(--text-dim)',
          letterSpacing: '0.1em'
        }}>
          © 2026 CipolloLand · <span style={{ color: 'var(--green-bright)', opacity: 0.6 }}>v0.1.0</span>
        </span>
      </div>

      {/* Centro: sociales */}
      <div style={{ display: 'flex', gap: '4px', justifySelf: 'center' }}>
        {sociales.map(s => (
          <a key={s.nombre} href={s.href} target="_blank" rel="noopener noreferrer" className="footer-social-btn" style={{ '--sc': s.color, '--sc-faint': s.colorFaint, '--sc-hover': s.colorHover } as React.CSSProperties}>
            <svg viewBox="0 0 24 24" fill={s.color} style={{ width: '14px', height: '14px', flexShrink: 0 }}>{s.svg}</svg>
            <div>
              <div className="footer-social-name">{s.nombre}</div>
              <div className="footer-social-desc">{s.desc}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Derecha: legal */}
      <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'end' }}>
        {legal.map((l, i) => (
          <span key={l.href} style={{ display: 'flex', alignItems: 'center' }}>
            <Link href={l.href} className="footer-legal-link">{l.label}</Link>
            {i < legal.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.08)', padding: '0 4px' }}>|</span>
            )}
          </span>
        ))}
      </div>

    </footer>
  )
}