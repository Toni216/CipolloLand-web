import Link from 'next/link'

const LORE_PREVIEW = `En un tiempo olvidado, existió un reino llamado Cipollo, donde la magia no era un misterio, sino parte de la vida cotidiana. Criaturas fantásticas caminaban entre los hombres, y los cielos brillaban con hechizos antiguos que protegían sus tierras.

Una organización conocida como los Demoledores del Destino conspiraba contra el equilibrio del mundo. Su objetivo: encontrar los Pilares del Destino, antiguas estructuras que sostenían la realidad misma, y destruirlos para provocar el colapso de toda existencia.`

export default function LorePreview() {
  return (
    <div style={{ padding: '48px 40px' }}>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '10px', letterSpacing: '0.28em',
        textTransform: 'uppercase' as const,
        color: 'var(--green-bright)',
        marginBottom: '10px', fontWeight: 600, opacity: 0.75
      }}>
        Lore del servidor
      </div>

      <h2 style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: 'clamp(32px, 5vw, 56px)',
        color: 'var(--bone)', letterSpacing: '0.04em',
        lineHeight: 1, marginBottom: '16px'
      }}>
        El Origen del Apocalipsis
      </h2>

      <div style={{
        width: '40px', height: '2px',
        background: 'linear-gradient(to right, var(--blood), var(--green-dim))',
        marginBottom: '24px'
      }} />

      <p style={{
        fontFamily: 'var(--font-special-elite)',
        fontSize: '14px', color: 'var(--text-mid)',
        lineHeight: 1.95, whiteSpace: 'pre-line' as const
      }}>
        {LORE_PREVIEW}
      </p>

      <Link href="/t3/lore" style={{
        display: 'inline-flex', alignItems: 'center',
        marginTop: '24px',
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '12px', letterSpacing: '0.18em',
        textTransform: 'uppercase' as const, fontWeight: 600,
        padding: '11px 22px',
        border: '1px solid rgba(74,124,63,0.4)',
        color: 'var(--green-bright)',
        textDecoration: 'none',
      }}>
        Leer historia completa →
      </Link>
    </div>
  )
}