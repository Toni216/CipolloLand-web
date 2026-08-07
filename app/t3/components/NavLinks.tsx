'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const linksDirectos = [
  { label: 'Lore',       href: '/t3/lore' },
  { label: 'Anuncios',   href: '/t3/anuncios' },
  { label: 'Personajes', href: '/t3/personajes' },
]

const linksDesplegable = [
  { label: 'Eventos',       href: '/t3/eventos' },
  { label: 'Foro',          href: '/t3/foro' },
  { label: 'Mapa',          href: '/t3/mapa' },
  { label: 'Clasificación', href: '/t3/clasificacion' },
  { label: 'Roadmap',       href: '/t3/roadmap' },
]

const linkStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '15px',
  color: active ? 'var(--green-bright)' : 'var(--text-mid)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  fontWeight: 500,
  padding: '8px 16px',
  border: `1px solid ${active ? 'rgba(74,124,63,0.25)' : 'transparent'}`,
  textDecoration: 'none',
  transition: 'color 0.2s, border-color 0.2s',
  display: 'block',
})

export default function NavLinks() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activoEnDesplegable = linksDesplegable.some(l => l.href === pathname)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{ display: 'flex', gap: '4px', margin: '0 auto', alignItems: 'center' }} className="nav-links-desktop">
      {linksDirectos.map(l => {
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            style={linkStyle(active)}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--green-bright)'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(74,124,63,0.25)'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-mid)'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent'
              }
            }}
          >
            {l.label}
          </Link>
        )
      })}

      {/* Desplegable "Más" */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            ...linkStyle(activoEnDesplegable),
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          Más <span style={{ fontSize: '10px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0,
            background: 'rgba(9,10,7,0.99)',
            border: '1px solid rgba(74,124,63,0.2)',
            backdropFilter: 'blur(12px)',
            minWidth: '180px', zIndex: 490,
            display: 'flex', flexDirection: 'column',
            padding: '6px 0',
          }}>
            {linksDesplegable.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  ...linkStyle(pathname === l.href),
                  border: 'none', padding: '10px 20px',
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}