import { prisma } from '@/lib/prisma'

async function getAnuncios() {
  return prisma.anuncios.findMany({
    where: { temporadas: { slug: 't3' } },
    orderBy: [
      { pinned: 'desc' },
      { created_at: 'desc' },
    ],
    include: { users: { select: { username: true } } },
  })
}

export default async function AnunciosPage() {
  const anuncios = await getAnuncios()

  return (
    <div style={{ paddingTop: '114px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 32px 100px' }}>

        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', letterSpacing: '0.28em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)', opacity: 0.75,
            marginBottom: '8px', fontWeight: 600
          }}>
            Temporada 3 · Apocalipsis
          </div>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '48px', color: 'var(--bone)',
            letterSpacing: '0.04em', lineHeight: 1,
            marginBottom: '8px'
          }}>
            Anuncios
          </h1>
          <p style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '13px', color: 'var(--text-mid)',
            lineHeight: 1.8
          }}>
            Todas las transmisiones recibidas hasta ahora.
          </p>
        </div>

        {anuncios.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-special-elite)', fontSize: '14px',
            color: 'var(--text-dim)',
          }}>
            No hay anuncios todavía. Vuelve pronto.
          </p>
        ) : (
          anuncios.map(a => {
            const acento = a.pinned ? 'var(--blood-bright)' : 'var(--green-bright)'
            const esReciente = (Date.now() - new Date(a.created_at).getTime()) < 1000 * 60 * 60 * 48

            return (
              <div key={a.id} style={{
                borderLeft: `3px solid ${acento}`,
                background: a.pinned
                  ? 'linear-gradient(135deg, rgba(155,28,28,0.05), transparent 60%)'
                  : 'var(--bg2)',
                padding: '28px 32px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {a.pinned && (
                    <div style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '9px', letterSpacing: '0.15em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--blood-bright)',
                      border: '1px solid rgba(155,28,28,0.4)',
                      background: 'rgba(155,28,28,0.06)',
                      padding: '2px 8px',
                    }}>
                      📌 Fijado
                    </div>
                  )}
                  {esReciente && !a.pinned && (
                    <div style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '9px', letterSpacing: '0.15em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--green-bright)',
                      border: '1px solid rgba(74,124,63,0.4)',
                      padding: '2px 8px',
                    }}>
                      Nuevo
                    </div>
                  )}
                </div>

                <div style={{
                  fontFamily: 'var(--font-bebas)', fontSize: '26px',
                  color: 'var(--bone-dim)', letterSpacing: '0.06em', marginBottom: '10px'
                }}>
                  {a.titulo}
                </div>

                <p style={{
                  fontFamily: 'var(--font-special-elite)', fontSize: '14px',
                  color: 'var(--text-mid)', lineHeight: 1.95, marginBottom: '14px',
                  whiteSpace: 'pre-wrap',
                }}>
                  {a.cuerpo}
                </p>

                <div style={{
                  fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
                  color: 'var(--text-dim)', letterSpacing: '0.1em',
                }}>
                  {a.users?.username && `Por ${a.users.username} · `}
                  {new Date(a.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}