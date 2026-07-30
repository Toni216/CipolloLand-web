'use client'

import Image from 'next/image'
import { cerrarSesion } from '@/app/t3/components/actions'

interface Props {
  usuario: {
    username: string
    email: string
    rol: string
    minecraft_username: string | null
    created_at: Date
  }
  seccionActiva: string
  onSeccion: (s: string) => void
  badges: Array<{ nombre: string }>
  esAdmin: boolean
}

const rolColor = (rol: string) => {
  if (rol === 'owner') return { color: '#c9962a', bg: 'rgba(201,150,42,0.08)', border: 'rgba(201,150,42,0.4)' }
  if (rol === 'admin') return { color: 'var(--green-bright)', bg: 'rgba(74,124,63,0.08)', border: 'rgba(74,124,63,0.4)' }
  return { color: 'var(--text-mid)', bg: 'transparent', border: 'rgba(255,255,255,0.1)' }
}

export default function Sidebar({ usuario, seccionActiva, onSeccion, badges, esAdmin }: Props) {
  const rc = rolColor(usuario.rol)
  const avatarUrl = usuario.minecraft_username
    ? `https://minotar.net/bust/${usuario.minecraft_username}/72`
    : null

  const grupos = [
    {
      label: 'Cuenta',
      items: [
        { id: 'personajes',     icon: '🧬', label: 'Mis personajes' },
        { id: 'ajustes',        icon: '⚙',  label: 'Ajustes' },
        { id: 'privacidad',     icon: '🔒', label: 'Privacidad' },
        { id: 'notificaciones', icon: '🔔', label: 'Notificaciones' },
      ]
    },
    {
      label: 'Actividad',
      items: [
        { id: 'historial',    icon: '📋', label: 'Historial global' },
        { id: 'insignias',    icon: '🏅', label: 'Badges', count: badges.length },
        { id: 'estadisticas', icon: '⏱',  label: 'Estadísticas' },
      ]
    },
    {
      label: 'Gestión',
      items: [
        { id: 'nicks',    icon: '📝', label: 'Historial de nicks' },
        { id: 'papelera', icon: '🗑',  label: 'Papelera' },
      ]
    },
    ...(esAdmin ? [{
      label: 'Especial',
      items: [
        { id: 'admin', icon: '✦', label: 'Panel de admin' },
      ]
    }] : [])
  ]

  return (
    <aside style={{ position: 'sticky', top: '130px', alignSelf: 'start' }}>

      {/* Tarjeta de cuenta */}
      <div style={{
        border: '1px solid rgba(255,255,255,0.055)',
        background: 'var(--bg2)',
        padding: '24px',
        marginBottom: '1px',
        display: 'flex', flexDirection: 'column' as const,
        alignItems: 'center', textAlign: 'center' as const, gap: '10px'
      }}>
        {/* Avatar */}
        <div style={{
          width: '72px', height: '72px',
          borderWidth: '2px', borderStyle: 'solid', borderColor: 'rgba(74,124,63,0.4)',
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(74,124,63,0.08)',
        }}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={usuario.username}
              width={72} height={72}
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          ) : (
            <span style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '36px', color: 'var(--green-bright)'
            }}>
              {usuario.username[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Nick */}
        <div style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '24px', color: 'var(--bone)',
          letterSpacing: '0.06em', lineHeight: 1
        }}>
          {usuario.username}
        </div>

        {/* Email */}
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', color: 'var(--text-dim)',
          letterSpacing: '0.06em'
        }}>
          {usuario.email}
        </div>

        {/* Badge de rol */}
        <span style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '10px', letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          padding: '3px 10px',
          borderWidth: '1px', borderStyle: 'solid', borderColor: rc.border,
          color: rc.color,
          background: rc.bg
        }}>
          {usuario.rol}
        </span>

        {/* Miembro desde */}
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '10px', color: 'var(--text-dim)',
          letterSpacing: '0.06em'
        }}>
          Miembro desde {new Date(usuario.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </div>

        {/* Cerrar sesión */}
        <form action={cerrarSesion} style={{ width: '100%' }}>
          <button type="submit" style={{
            width: '100%',
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            background: 'transparent',
            color: 'var(--blood-bright)',
            borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(155,28,28,0.3)',
            padding: '7px', cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Nav lateral */}
      <div style={{
        borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.055)',
        background: 'var(--bg2)',
        padding: '8px 0',
      }}>
        {grupos.map(g => (
          <div key={g.label}>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '9px', letterSpacing: '0.25em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-dim)', padding: '10px 16px 4px',
            }}>
              {g.label}
            </div>
            {g.items.map(item => (
              <button key={item.id} onClick={() => onSeccion(item.id)} style={{
                width: '100%', textAlign: 'left' as const,
                display: 'flex', alignItems: 'center', gap: '10px',
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '13px', letterSpacing: '0.06em',
                padding: '9px 16px',
                background: seccionActiva === item.id ? 'rgba(74,124,63,0.08)' : 'transparent',
                borderTopWidth: '0', borderRightWidth: '0', borderBottomWidth: '0',
                borderLeftWidth: '2px', borderLeftStyle: 'solid' as const,
                borderLeftColor: seccionActiva === item.id ? 'var(--green-bright)' : 'transparent',
                color: seccionActiva === item.id ? 'var(--green-bright)' : 'var(--text-mid)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {'count' in item && item.count !== undefined && item.count > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontSize: '10px', color: 'var(--green-bright)',
                    background: 'rgba(74,124,63,0.15)',
                    padding: '1px 6px'
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}