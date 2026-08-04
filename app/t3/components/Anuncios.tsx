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

  const esReciente = anuncio
    ? (Date.now() - new Date(anuncio.created_at).getTime()) < 1000 * 60 * 60 * 48
    : false

  const acento = anuncio?.pinned ? 'var(--blood-bright)' : 'var(--green-bright)'

  return (
    <div style={{
      padding: '48px 40px',
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      borderLeft: anuncio ? `3px solid ${acento}` : undefined,
      background: anuncio?.pinned
        ? 'linear-gradient(135deg, rgba(155,28,28,0.05), transparent 60%)'
        : undefined,
    }}>
      {/* Textura de estática de fondo, muy sutil */}
      {anuncio && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
        }} />
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span
          className="senal-dot"
          style={{
            display: 'inline-block',
            width: '7px', height: '7px', borderRadius: '50%',
            background: acento, color: acento,
            animation: anuncio ? 'senalPulso 1.8s ease-in-out infinite' : undefined,
          }}
        />
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '10px', letterSpacing: '0.28em',
          textTransform: 'uppercase' as const,
          color: acento,
          fontWeight: 600, opacity: 0.85
        }}>
          {anuncio?.pinned ? 'Transmisión de emergencia' : 'Señal recibida'}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <h2 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(32px, 5vw, 56px)',
          color: 'var(--bone)', letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          Novedades
        </h2>
        {esReciente && !anuncio?.pinned && (
          <span style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)',
            border: '1px solid rgba(74,124,63,0.4)',
            padding: '3px 8px',
          }}>
            Nuevo
          </span>
        )}
      </div>

      <div style={{
        width: '40px', height: '2px',
        background: 'linear-gradient(to right, var(--blood), var(--green-dim))',
        marginBottom: '24px'
      }} />

      {anuncio ? (
        <div style={{ position: 'relative' }}>
          {anuncio.pinned && (
            <div style={{
              display: 'inline-block',
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: 'var(--blood-bright)',
              border: '1px solid rgba(155,28,28,0.4)',
              background: 'rgba(155,28,28,0.06)',
              padding: '2px 8px', marginBottom: '12px'
            }}>
              📌 Fijado
            </div>
          )}
          <div style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '24px', color: 'var(--bone-dim)',
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