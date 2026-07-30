export default function Placeholder({ titulo, sub }: { titulo: string, sub?: string }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '28px', color: 'var(--bone)',
          letterSpacing: '0.04em', lineHeight: 1
        }}>{titulo}</h2>
        {sub && (
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '12px', color: 'var(--text-dim)',
            letterSpacing: '0.08em', marginTop: '4px'
          }}>{sub}</div>
        )}
      </div>
      <div style={{
        border: '1px solid rgba(255,255,255,0.055)',
        background: 'var(--bg2)', padding: '48px',
        textAlign: 'center' as const
      }}>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '10px', letterSpacing: '0.25em',
          textTransform: 'uppercase' as const,
          color: 'var(--text-dim)'
        }}>
          {titulo} · Próximamente
        </div>
      </div>
    </div>
  )
}