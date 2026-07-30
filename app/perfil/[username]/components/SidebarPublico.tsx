import Image from 'next/image'
import Link from 'next/link'

interface Personaje {
  faccion_pj: string | null
}

interface Badge {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color: string | null
  granted_at: Date
  destacada: boolean
}

interface Props {
  usuario: {
    username: string
    rol: string
    minecraft_username: string | null
    created_at: Date
    bio: string | null
    discord_username: string | null
  }
  personajes: Personaje[]
  badges: Badge[]
  esPropio: boolean
}

const rolColor = (rol: string) => {
  if (rol === 'owner') return { color: '#c9962a', bg: 'rgba(201,150,42,0.08)', border: 'rgba(201,150,42,0.4)' }
  if (rol === 'admin') return { color: 'var(--green-bright)', bg: 'rgba(74,124,63,0.08)', border: 'rgba(74,124,63,0.4)' }
  return { color: 'var(--text-mid)', bg: 'transparent', border: 'rgba(255,255,255,0.1)' }
}

const faccionColor: Record<string, string> = {
  'Protocolo Lázaro': '#20B2AA',
  'Las Cucarachas':   '#c9962a',
  'Los Vestigios':    '#8a8070',
}
const faccionIcono: Record<string, string> = {
  'Protocolo Lázaro': '/lazaro.png',
  'Las Cucarachas':   '/cucarachas.png',
  'Los Vestigios':    '/vestigios.png',
}

export default function SidebarPublico({ usuario, personajes, badges, esPropio }: Props) {
  const rc = rolColor(usuario.rol)
  const avatarUrl = usuario.minecraft_username
    ? `https://minotar.net/bust/${usuario.minecraft_username}/96`
    : null

  const facciones = [...new Set(personajes.map(p => p.faccion_pj).filter(Boolean))] as string[]
  const destacadas = badges.filter(b => b.destacada).slice(0, 5)

  return (
    <aside style={{ position: 'sticky', top: '88px', alignSelf: 'start' }}>
      <div style={{
        border: '1px solid rgba(255,255,255,0.055)',
        background: 'var(--bg2)',
        padding: '28px 24px',
        display: 'flex', flexDirection: 'column' as const,
        alignItems: 'center', textAlign: 'center' as const, gap: '14px'
      }}>
        <div style={{
          width: '96px', height: '96px',
          border: '2px solid rgba(74,124,63,0.4)',
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(74,124,63,0.08)',
        }}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={usuario.username} width={96} height={96} style={{ objectFit: 'cover' }} unoptimized />
          ) : (
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '44px', color: 'var(--green-bright)' }}>
              {usuario.username[0].toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '30px', color: 'var(--bone)', letterSpacing: '0.05em', lineHeight: 1 }}>
            {usuario.username}
          </div>
          {usuario.minecraft_username && (
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.06em', marginTop: '4px' }}>
              {usuario.minecraft_username}
            </div>
          )}
        </div>

        {/* Bio */}
        {usuario.bio && (
          <p style={{
            fontFamily: 'var(--font-special-elite)', fontSize: '13px',
            color: 'var(--text-mid)', lineHeight: 1.6, margin: 0,
            borderTop: '1px solid rgba(255,255,255,0.055)',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
            padding: '10px 0', width: '100%',
          }}>
            {usuario.bio}
          </p>
        )}

        <span style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          padding: '4px 12px',
          border: `1px solid ${rc.border}`,
          color: rc.color, background: rc.bg
        }}>
          {usuario.rol}
        </span>

        <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
          Miembro desde {new Date(usuario.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </div>

        {/* Discord */}
        {usuario.discord_username && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px',
            color: '#8a95e8',
          }}>
            <svg viewBox="0 0 24 24" fill="#5865F2" style={{ width: '15px', height: '15px', flexShrink: 0 }}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.127 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            {usuario.discord_username}
          </div>
        )}

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '4px' }}>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: 'var(--bone)' }}>
              {personajes.length}
            </div>
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
              Personajes
            </div>
          </div>
        </div>

        {/* Badges destacadas */}
        {destacadas.length > 0 && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' as const, paddingTop: '4px' }}>
            {destacadas.map(b => (
              <span key={b.id} title={b.nombre} style={{
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${b.color ?? 'rgba(74,124,63,0.3)'}`,
                background: `${b.color ?? '#4a7c3f'}11`,
                fontSize: '17px', cursor: 'default'
              }}>
                {b.icono ?? '🏅'}
              </span>
            ))}
          </div>
        )}

        {/* Facción — banner protagonista */}
        {facciones.length > 0 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '8px', paddingTop: '6px' }}>
            {facciones.map(f => {
              const color = faccionColor[f] ?? 'var(--green-bright)'
              const icono = faccionIcono[f]
              return (
                <div key={f} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px',
                  background: `${color}12`, border: `1px solid ${color}44`,
                }}>
                  {icono && (
                    <Image src={icono} alt={f} width={32} height={32} style={{ objectFit: 'contain', flexShrink: 0 }} />
                  )}
                  <div style={{ textAlign: 'left' as const }}>
                    <div style={{
                      fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px',
                      letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                      color, opacity: 0.7,
                    }}>
                      Facción
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-bebas)', fontSize: '19px',
                      color, letterSpacing: '0.04em', lineHeight: 1.1,
                    }}>
                      {f}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {esPropio && (
          <Link href="/perfil/ajustes" style={{
            width: '100%', textAlign: 'center' as const, marginTop: '8px',
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            padding: '9px', textDecoration: 'none',
            color: 'var(--text-dim)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            Ajustes de cuenta
          </Link>
        )}
      </div>
    </aside>
  )
}