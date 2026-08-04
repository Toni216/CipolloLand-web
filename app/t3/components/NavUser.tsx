'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Session } from 'next-auth'

interface Props {
  user: Session['user']
}

export default function NavUser({ user }: Props) {
  const [open, setOpen] = useState(false)
  const [ocultarSolicitud, setOcultarSolicitud] = useState(false)
  const [esAdminOOwner, setEsAdminOOwner] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/t3/estado-acceso')
      .then(res => res.json())
      .then(data => {
        setOcultarSolicitud(data.esStaff || data.tieneAcceso)
        setEsAdminOOwner(data.esAdminOOwner)
      })
      .catch(() => {}) // si falla, se deja el estado por defecto (comportamiento anterior)
  }, [])

  async function handleLogout() {
    await signOut({ redirect: false })
    router.refresh()
  }

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>

      {/* Botón */}
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        padding: '6px 12px',
        borderLeft: '1px solid rgba(74,124,63,0.2)',
      }}>
        {/* Avatar */}
        <div style={{
          width: '28px', height: '28px',
          border: '1px solid rgba(74,124,63,0.3)',
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(74,124,63,0.1)',
        }}>
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ''} width={28} height={28} style={{ objectFit: 'cover' }} />
          ) : (
            <span style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '14px', color: 'var(--green-bright)'
            }}>
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>

        {/* Nick */}
        <span style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', color: 'var(--bone-dim)',
          letterSpacing: '0.08em', fontWeight: 500
        }}>
          {user.name}
        </span>

        {/* Flecha */}
        <svg viewBox="0 0 12 12" fill="none" style={{
          width: '10px', height: '10px',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          <path d="M2 4l4 4 4-4" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          minWidth: '200px',
          background: 'rgba(9,10,7,0.98)',
          border: '1px solid rgba(74,124,63,0.2)',
          backdropFilter: 'blur(12px)',
          zIndex: 600,
          animation: 'navFadeIn 0.15s ease'
        }}>
          {/* Info usuario */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
          }}>
            <div style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '16px', color: 'var(--bone)',
              letterSpacing: '0.06em'
            }}>
              {user.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '10px', color: 'var(--text-dim)',
              letterSpacing: '0.1em'
            }}>
              {user.email}
            </div>
          </div>

          {/* Links */}
          {[
            { label: 'Mi perfil', href: '/perfil' },
            { label: 'Ajustes',   href: '/perfil/ajustes' },
            ...(ocultarSolicitud ? [] : [{ label: 'Solicitar acceso', href: '/t3/solicitud' }]),
            ...(esAdminOOwner ? [{ label: 'Panel de admin', href: '/admin' }] : []),
          ].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
              display: 'block',
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', color: 'var(--text-mid)',
              letterSpacing: '0.08em',
              padding: '10px 16px',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.055)',
              transition: 'color 0.2s, background 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--green-bright)'
              e.currentTarget.style.background = 'rgba(74,124,63,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-mid)'
              e.currentTarget.style.background = 'transparent'
            }}
            >
              {l.label}
            </Link>
          ))}

          {/* Cerrar sesión */}
          <button onClick={handleLogout} style={{
            width: '100%', textAlign: 'left' as const,
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '13px', color: 'var(--blood-bright)',
            letterSpacing: '0.08em',
            padding: '10px 16px',
            background: 'transparent', border: 'none',
            cursor: 'pointer', transition: 'background 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(155,28,28,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}