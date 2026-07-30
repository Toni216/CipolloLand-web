'use client'

import { useEffect, useState } from 'react'

export default function ServerStatus() {
  const [online, setOnline] = useState(false)
  const [players, setPlayers] = useState<{ online: number, max: number } | null>(null)

  useEffect(() => {
    // TODO: reemplazar IP por dato de la API cuando haya auth
    fetch('/api/t3/server-status')
      .then(r => r.json())
      .then(data => {
        if (data.online) {
          setOnline(true)
          setPlayers({ online: data.players?.online ?? 0, max: data.players?.max ?? 25 })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '0 18px',
      fontSize: '11px', color: 'var(--text-mid)',
      borderRight: '1px solid rgba(255,255,255,0.055)',
      fontFamily: 'var(--font-barlow-condensed)',
      letterSpacing: '0.06em',
    }}>
      {/* Dot */}
      <div style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: online ? 'var(--green)' : 'var(--blood-bright)',
        flexShrink: 0,
        animation: online ? 'none' : 'pulseDot 2s ease-in-out infinite'
      }} />
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
      `}</style>

      {online && players
        ? <span>Servidor <strong>ONLINE</strong> · <strong>{players.online}/{players.max}</strong> jugadores</span>
        : <span>Servidor <strong>OFFLINE</strong> · Abre Agosto 2026</span>
      }
    </div>
  )
}