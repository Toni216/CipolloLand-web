'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'Lore',       href: '/t3/lore' },
  { label: 'Anuncios',   href: '/t3/anuncios' },
  { label: 'Personajes', href: '/t3/personajes' },
  { label: 'Eventos',    href: '/t3/eventos' },
  { label: 'Foro',       href: '/t3/foro' },
  { label: 'Mapa',       href: '/t3/mapa' },
  { label: 'Clasificación', href: '/t3/leaderboard' }
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', gap: '4px', margin: '0 auto' }} className="nav-links-desktop">
      {links.map(l => {
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
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
            }}
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
    </div>
  )
}