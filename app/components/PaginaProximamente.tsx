export default function PaginaProximamente({ titulo, sub }: { titulo: string, sub?: string }) {
  return (
    <div style={{ paddingTop: '150px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 32px 100px', textAlign: 'center' as const }}>
        <h1 style={{
          fontFamily: 'var(--font-bebas)', fontSize: 'clamp(40px, 6vw, 64px)',
          color: 'var(--bone)', letterSpacing: '0.04em', marginBottom: '16px'
        }}>
          {titulo}
        </h1>
        {sub && (
          <p style={{
            fontFamily: 'var(--font-special-elite)', fontSize: '14px',
            color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '32px'
          }}>
            {sub}
          </p>
        )}
        <div style={{
          border: '1px solid rgba(255,255,255,0.055)', background: 'var(--bg2)',
          padding: '32px', display: 'inline-block'
        }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
            letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--text-dim)'
          }}>
            Esta página está en construcción
          </div>
        </div>
      </div>
    </div>
  )
}