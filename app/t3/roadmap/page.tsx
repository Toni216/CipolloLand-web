import { prisma } from '@/lib/prisma'

const COLUMNAS = [
  { estado: 'planeado',      titulo: 'Planeado',      color: 'var(--text-mid)' },
  { estado: 'en_desarrollo', titulo: 'En desarrollo', color: '#c9962a' },
  { estado: 'lanzado',       titulo: 'Lanzado',       color: 'var(--green-bright)' },
]

async function getItems() {
  const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
  if (!temporada) return []

  return prisma.roadmap_items.findMany({
    where: { temporada_id: temporada.id },
    orderBy: { created_at: 'desc' },
    include: { sugerencias: { select: { titulo: true } } },
  })
}

export default async function RoadmapPage() {
  const items = await getItems()

  return (
    <div style={{ paddingTop: '114px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 32px 100px' }}>

        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', letterSpacing: '0.28em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)', opacity: 0.75,
            marginBottom: '8px', fontWeight: 600
          }}>
            3ª Edición · Apocalipsis
          </div>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '48px', color: 'var(--bone)',
            letterSpacing: '0.04em', lineHeight: 1,
            marginBottom: '8px'
          }}>
            Roadmap
          </h1>
          <p style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '13px', color: 'var(--text-mid)',
            lineHeight: 1.8
          }}>
            Qué se viene, qué se está viniendo y qué se vino.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
        className="roadmap-columnas"
        >
          {COLUMNAS.map(col => {
            const itemsColumna = items.filter(i => i.estado === col.estado)
            return (
              <div key={col.estado}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '16px', paddingBottom: '10px',
                  borderBottom: `2px solid ${col.color}`,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-bebas)', fontSize: '20px',
                    color: col.color, letterSpacing: '0.05em',
                  }}>
                    {col.titulo}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-bebas)', fontSize: '16px',
                    color: col.color, opacity: 0.85,
                  }}>
                    ({itemsColumna.length})
                  </span>
                </div>

                {itemsColumna.length === 0 ? (
                  <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12px', color: 'var(--text-dim)' }}>
                    Nada por aquí todavía.
                  </p>
                ) : (
                  itemsColumna.map(item => (
                    <div key={item.id} style={{
                      border: '1px solid rgba(255,255,255,0.055)',
                      background: 'var(--bg2)',
                      padding: '16px 18px',
                      marginBottom: '12px',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-bebas)', fontSize: '17px',
                        color: 'var(--bone)', letterSpacing: '0.03em',
                        marginBottom: '6px', lineHeight: 1.2,
                        overflowWrap: 'break-word', wordBreak: 'break-word',
                      }}>
                        {item.titulo}
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-special-elite)', fontSize: '12px',
                        color: 'var(--text-mid)', lineHeight: 1.75,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word', wordBreak: 'break-word',
                      }}>
                        {item.descripcion}
                      </p>
                      {item.sugerencias && (
                        <div style={{
                          fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
                          color: 'var(--green-bright)', marginTop: '10px',
                        }}>
                          💡 Idea de la comunidad: {item.sugerencias.titulo}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}