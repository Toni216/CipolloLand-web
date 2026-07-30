import ServerStatus from './ServerStatus'

interface Props {
  jugadores: number
}

export default function InfoStrip({ jugadores }: Props) {
  const dot = (
    <div style={{
      width: '5px', height: '5px', borderRadius: '50%',
      background: 'var(--green)', flexShrink: 0
    }} />
  )

  const itemStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '0 18px',
    fontSize: '11px', color: 'var(--text-mid)',
    borderRight: '1px solid rgba(255,255,255,0.055)',
    fontFamily: 'var(--font-barlow-condensed)',
    letterSpacing: '0.06em',
  }

  const items = [
    { label: <span>Versión <strong>Forge 1.20.1</strong></span> },
    { label: <span><strong>{jugadores} supervivientes</strong> esta temporada</span> },
    { label: <span>Rol &amp; Supervivencia <strong>activos</strong></span> },
  ]

  return (
    <div style={{
      background: '#0b0e09',
      borderBottom: '1px solid rgba(255,255,255,0.055)',
      padding: '9px 28px',
      display: 'flex', gap: 0, alignItems: 'center',
      justifyContent: 'center', flexWrap: 'wrap' as const,
      overflow: 'hidden'
    }}>
      <ServerStatus />
      {items.map((item, i) => (
        <div key={i} style={{
          ...itemStyle,
          borderRight: i === items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.055)'
        }}>
          {dot}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}