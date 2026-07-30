'use client'

import { useRouter } from 'next/navigation'

export default function TopBarMinimal() {
  const router = useRouter()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 500,
      background: 'rgba(9,10,7,0.97)',
      borderBottom: '1px solid rgba(74,124,63,0.2)',
      backdropFilter: 'blur(10px)',
      height: '64px',
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
    }}>
      <button onClick={() => router.back()} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '11px', letterSpacing: '0.16em',
        textTransform: 'uppercase' as const,
        color: 'var(--text-mid)', background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '7px 16px', cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--green-bright)'; e.currentTarget.style.borderColor = 'rgba(74,124,63,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mid)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        ← Volver
      </button>
    </nav>
  )
}