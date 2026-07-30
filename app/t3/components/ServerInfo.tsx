'use client'

import { useState } from 'react'
import Link from 'next/link'
import ServerInfoIP from './ServerInfoIP'

interface Props {
  estaAutorizado: boolean
  serverIp: string | null
  modpackVersion: string | null
}

function Tooltip({ texto, visible }: { texto: string, visible: boolean }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute' as const,
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(9,10,7,0.97)',
      border: '1px solid rgba(74,124,63,0.3)',
      padding: '7px 12px',
      fontFamily: 'var(--font-barlow-condensed)',
      fontSize: '11px', letterSpacing: '0.08em',
      color: 'var(--bone-dim)',
      whiteSpace: 'nowrap' as const,
      zIndex: 10,
      pointerEvents: 'none' as const,
    }}>
      {texto}
      {/* Triángulo */}
      <div style={{
        position: 'absolute' as const,
        top: '100%', left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '5px solid rgba(74,124,63,0.3)',
      }} />
    </div>
  )
}

export default function ServerInfo({ estaAutorizado, serverIp, modpackVersion }: Props) {
  const [tooltipIP, setTooltipIP]       = useState(false)
  const [tooltipModpack, setTooltipModpack] = useState(false)

  const tooltipTexto = !estaAutorizado
    ? 'Inicia sesión y solicita acceso para ver esto'
    : ''

  return (
    <div style={{
      marginTop: '36px',
      display: 'flex', alignItems: 'stretch',
      gap: '1px', justifyContent: 'center',
      flexWrap: 'wrap' as const,
      width: '100%', maxWidth: '560px',
      marginLeft: 'auto', marginRight: 'auto',
    }}>

      {/* Cajita IP */}
      <div
        style={{
          position: 'relative' as const, display: 'flex',
          alignItems: 'center', gap: '10px',
          border: '1px solid rgba(255,255,255,0.055)',
          background: 'rgba(13,16,11,0.75)',
          padding: '12px 16px', backdropFilter: 'blur(6px)',
          flex: 1, minWidth: 0,
          cursor: !estaAutorizado ? 'help' : 'auto',
        }}
        onMouseEnter={() => !estaAutorizado && setTooltipIP(true)}
        onMouseLeave={() => setTooltipIP(false)}
      >
        <Tooltip texto={tooltipTexto} visible={tooltipIP} />

        <svg viewBox="0 0 24 24" fill="none" style={{ width: '25px', height: '25px', flexShrink: 0 }}>
          <rect x="3" y="3" width="18" height="18" rx="1" stroke="#4a7c3f" strokeWidth="1.2" fill="none"/>
          <path d="M7 8h10M7 12h6M7 16h8" stroke="#4a7c3f" strokeWidth="1" opacity="0.5"/>
        </svg>
        <div style={{ textAlign: 'left' as const, flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', color: 'var(--text-mid)',
            letterSpacing: '0.15em', textTransform: 'uppercase' as const,
            marginBottom: '2px'
          }}>IP del servidor</div>
          {estaAutorizado ? (
            <ServerInfoIP ip={serverIp ?? 'IP no configurada'} />
          ) : (
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', letterSpacing: '0.1em',
              color: 'var(--bone-dim)',
              filter: 'blur(5px)',
              userSelect: 'none' as const,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
            }}>
              play.cipollland.net
            </div>
          )}
        </div>
        {!estaAutorizado && (
          <div style={{
            border: '1px solid rgba(74,124,63,0.25)',
            padding: '5px 7px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, opacity: 0.4
          }}>
            <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
              <rect x="4" y="9" width="12" height="9" rx="1" stroke="#4a7c3f" strokeWidth="1.3"/>
              <path d="M7 9V6a3 3 0 016 0v3" stroke="#4a7c3f" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Cajita Modpack */}
      <div
        style={{
          position: 'relative' as const, display: 'flex',
          alignItems: 'center', gap: '10px',
          border: '1px solid rgba(255,255,255,0.055)',
          background: 'rgba(13,16,11,0.75)',
          padding: '12px 16px', backdropFilter: 'blur(6px)',
          flex: 1, minWidth: 0,
          cursor: !estaAutorizado ? 'help' : 'auto',
        }}
        onMouseEnter={() => !estaAutorizado && setTooltipModpack(true)}
        onMouseLeave={() => setTooltipModpack(false)}
      >
        <Tooltip texto={tooltipTexto} visible={tooltipModpack} />

        <svg viewBox="0 0 24 24" fill="none" style={{ width: '30px', height: '30px', flexShrink: 0 }}>
          <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#4a7c3f" strokeWidth="1.2" fill="none"/>
          <path d="M12 2V22M4 7L12 12L20 7" stroke="#4a7c3f" strokeWidth="0.7" opacity="0.4"/>
        </svg>
        <div style={{ textAlign: 'left' as const, flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', color: 'var(--text-mid)',
            letterSpacing: '0.15em', textTransform: 'uppercase' as const,
            marginBottom: '2px'
          }}>Modpack</div>
          <div style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '16px', color: 'var(--bone-dim)',
            letterSpacing: '0.12em'
          }}>
            CipolloLand 2
          </div>
          <div style={{
            fontSize: '10px', color: 'var(--text-mid)',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-barlow-condensed)',
            marginTop: '1px'
          }}>
            Forge 1.20.1 · {modpackVersion ?? '~93 mods'}
          </div>
        </div>

        {estaAutorizado ? (
          <Link href="/t3/modpack" style={{
            border: '1px solid rgba(74,124,63,0.4)',
            padding: '5px 10px',
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)',
            textDecoration: 'none', flexShrink: 0
          }}>
            Descargar
          </Link>
        ) : (
          <div style={{
            border: '1px solid rgba(74,124,63,0.25)',
            padding: '5px 7px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, opacity: 0.4
          }}>
            <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
              <rect x="4" y="9" width="12" height="9" rx="1" stroke="#4a7c3f" strokeWidth="1.3"/>
              <path d="M7 9V6a3 3 0 016 0v3" stroke="#4a7c3f" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>

    </div>
  )
}