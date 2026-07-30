interface Props {
  seccionActiva: string
  onSeccion: (s: string) => void
  esAdmin: boolean
}

const ITEMS = [
  { id: 'cuenta', icon: '⚙', label: 'Cuenta' },
  { id: 'privacidad', icon: '🔒', label: 'Privacidad' },
  { id: 'notificaciones', icon: '🔔', label: 'Notificaciones' },
  { id: 'papelera', icon: '🗑', label: 'Papelera' },
]

export default function AjustesSidebar({ seccionActiva, onSeccion, esAdmin }: Props) {
  return (
    <aside style={{ position: 'sticky', top: '24px', alignSelf: 'start' }}>
      <div style={{
        border: '1px solid rgba(255,255,255,0.055)',
        background: 'var(--bg2)', padding: '8px 0',
      }}>
        {ITEMS.map(item => (
          <button key={item.id} onClick={() => onSeccion(item.id)} style={{
            width: '100%', textAlign: 'left' as const,
            display: 'flex', alignItems: 'center', gap: '10px',
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '13px', letterSpacing: '0.06em',
            padding: '11px 16px',
            background: seccionActiva === item.id ? 'rgba(74,124,63,0.08)' : 'transparent',
            borderLeft: seccionActiva === item.id ? '2px solid var(--green-bright)' : '2px solid transparent',
            color: seccionActiva === item.id ? 'var(--green-bright)' : 'var(--text-mid)',
            cursor: 'pointer', transition: 'all 0.15s'
          }}>
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {esAdmin && (
          <>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.055)', margin: '8px 0' }} />
            <button onClick={() => onSeccion('admin')} style={{
              width: '100%', textAlign: 'left' as const,
              display: 'flex', alignItems: 'center', gap: '10px',
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', letterSpacing: '0.06em',
              padding: '11px 16px',
              background: seccionActiva === 'admin' ? 'rgba(201,150,42,0.08)' : 'transparent',
              borderLeft: seccionActiva === 'admin' ? '2px solid #c9962a' : '2px solid transparent',
              color: seccionActiva === 'admin' ? '#c9962a' : 'var(--text-mid)',
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: '14px' }}>✦</span>
              Panel especial
            </button>
          </>
        )}
      </div>
    </aside>
  )
}