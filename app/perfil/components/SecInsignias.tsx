interface Props {
  badges: Array<{
    nombre: string
    descripcion: string | null
    icono: string | null
    color: string | null
    granted_at: Date
  }>
}

export default function SecInsignias({ badges }: Props) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '28px', color: 'var(--bone)',
          letterSpacing: '0.04em', lineHeight: 1
        }}>Insignias</h2>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '12px', color: 'var(--text-dim)',
          letterSpacing: '0.08em', marginTop: '4px'
        }}>Concedidas por el staff · Visibles en tu perfil público</div>
      </div>

      {badges.length > 0 ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1px', background: 'rgba(255,255,255,0.055)'
        }}>
          {badges.map(b => (
            <div key={b.nombre} style={{
              background: 'var(--bg2)', padding: '20px',
              borderTop: `2px solid ${b.color ?? 'rgba(74,124,63,0.3)'}`,
            }}>
              {b.icono && (
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{b.icono}</div>
              )}
              <div style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '18px', color: b.color ?? 'var(--bone)',
                letterSpacing: '0.06em', marginBottom: '4px'
              }}>
                {b.nombre}
              </div>
              {b.descripcion && (
                <div style={{
                  fontFamily: 'var(--font-barlow-condensed)',
                  fontSize: '11px', color: 'var(--text-dim)',
                  letterSpacing: '0.04em', lineHeight: 1.5
                }}>
                  {b.descripcion}
                </div>
              )}
              <div style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '10px', color: 'var(--text-dim)',
                letterSpacing: '0.08em', marginTop: '8px'
              }}>
                {new Date(b.granted_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          border: '1px solid rgba(255,255,255,0.055)',
          background: 'var(--bg2)', padding: '48px',
          textAlign: 'center' as const
        }}>
          <div style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '13px', color: 'var(--text-dim)'
          }}>
            Aún no tienes insignias.
          </div>
        </div>
      )}
    </div>
  )
}