'use client'

import { useState } from 'react'

interface Props {
  ip: string
}

export default function ServerInfoIP({ ip }: Props) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(ip)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '13px', letterSpacing: '0.1em',
        color: 'var(--bone)',
        overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const, flex: 1
      }}>
        {ip}
      </div>
      <button onClick={copiar} style={{
        background: copiado ? 'rgba(74,124,63,0.15)' : 'transparent',
        border: `1px solid ${copiado ? 'rgba(74,124,63,0.4)' : 'rgba(255,255,255,0.1)'}`,
        padding: '4px', cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
        }}>
        {copiado ? (
            <svg viewBox="0 0 16 16" fill="none" style={{ width: '12px', height: '12px' }}>
            <path d="M3 8l3.5 3.5L13 4" stroke="#6db560" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ) : (
            <svg viewBox="0 0 16 16" fill="none" style={{ width: '12px', height: '12px' }}>
                <rect x="5" y="1" width="9" height="11" rx="1" stroke="#4a7c3f" strokeWidth="1.2"/>
                <path d="M3 4H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="#4a7c3f" strokeWidth="1.2"/>
            </svg>
        )}
        </button>
    </div>
  )
}