'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavLink {
  label: string
  href: string
}

export default function NavMobile({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        className="nav-hamburger-btn"
        style={{
          display: 'none',
          flexDirection: 'column', gap: '5px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', padding: '4px', marginLeft: 'auto'
        }}
      >
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            display: 'block',
            width: '18px', height: '1.5px',
            background: 'var(--green-bright)',
            transition: 'transform 0.3s, opacity 0.3s',
            transform: open
              ? i === 0 ? 'translateY(6.5px) rotate(45deg)'
              : i === 2 ? 'translateY(-6.5px) rotate(-45deg)'
              : 'none'
              : 'none',
            opacity: open && i === 1 ? 0 : 1
          }} />
        ))}
      </button>

      {/* Menú desplegable */}
      {open && (
        <div style={{
          position: 'fixed',
          top: '70px', left: 0, right: 0,
          background: 'rgba(9,10,7,0.99)',
          borderBottom: '1px solid rgba(74,124,63,0.2)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          zIndex: 490, padding: '8px 0'
        }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '14px', color: 'var(--text-mid)',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                fontWeight: 500, padding: '12px 24px',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.055)',
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/login" onClick={() => setOpen(false)} style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600,
              padding: '10px 16px', textAlign: 'center',
              border: '1px solid rgba(74,124,63,0.4)',
              color: 'var(--green-bright)', textDecoration: 'none'
            }}>
              Iniciar sesión
            </Link>
            <Link href="/registro" onClick={() => setOpen(false)} style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600,
              padding: '10px 16px', textAlign: 'center',
              background: 'var(--blood-dim)',
              border: '1px solid var(--blood)',
              color: 'var(--bone)', textDecoration: 'none'
            }}>
              Crear cuenta
            </Link>
          </div>
        </div>
      )}
    </>
  )
}