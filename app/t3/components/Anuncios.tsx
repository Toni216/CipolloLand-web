import { prisma } from '@/lib/prisma'

export default async function Anuncios() {
  const anuncio = await prisma.anuncios.findFirst({
    where: { temporadas: { slug: 't3' } },
    orderBy: [
      { pinned: 'desc' },
      { created_at: 'desc' }
    ],
    include: { users: { select: { username: true } } }
  })

  return (
    <div style={{ padding: '48px 40px' }}>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '10px', letterSpacing: '0.28em',
        textTransform: 'uppercase' as const,
        color: 'var(--green-bright)',
        marginBottom: '10px', fontWeight: 600, opacity: 0.75
      }}>
        Anuncios
      </div>

      <h2 style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: 'clamp(32px, 5vw, 56px)',
        color: 'var(--bone)', letterSpacing: '0.04em',
        lineHeight: 1, marginBottom: '16px'
      }}>
        Novedades
      </h2>

      <div style={{
        width: '40px', height: '2px',
        background: 'linear-gradient(to right, var(--blood), var(--green-dim))',
        marginBottom: '24px'
      }} />

      {anuncio ? (
        <div>
          {anuncio.pinned && (
            <div style={{
              display: 'inline-block',
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: 'var(--green-bright)',
              border: '1px solid rgba(74,124,63,0.4)',
              padding: '2px 8px', marginBottom: '12px'
            }}>
              📌 Fijado
            </div>
          )}
          <div style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '22px', color: 'var(--bone-dim)',
            letterSpacing: '0.06em', marginBottom: '10px'
          }}>
            {anuncio.titulo}
          </div>
          <p style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '14px', color: 'var(--text-mid)',
            lineHeight: 1.95
          }}>
            {anuncio.cuerpo}
          </p>
          <div style={{
            marginTop: '16px',
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', color: 'var(--text-dim)',
            letterSpacing: '0.1em'
          }}>
            {anuncio.users?.username && `Por ${anuncio.users.username} · `}
            {new Date(anuncio.created_at).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
        </div>
      ) : (
        <p style={{
          fontFamily: 'var(--font-special-elite)',
          fontSize: '14px', color: 'var(--text-dim)',
          lineHeight: 1.95
        }}>
          No hay anuncios por el momento.
        </p>
      )}
    </div>
  )
}