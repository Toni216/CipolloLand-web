'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  minecraftUsername: string | null
  bio: string | null
  discordUsername: string | null
  badges: Badge[]
  abierto: boolean
  onClose: () => void
}

export default function EditarPerfilDrawer({ minecraftUsername, bio, discordUsername, badges, abierto, onClose }: Props) {
  const [mc, setMc] = useState(minecraftUsername ?? '')
  const [bioTexto, setBioTexto] = useState(bio ?? '')
  const [discord, setDiscord] = useState(discordUsername ?? '')
  const [destacadas, setDestacadas] = useState<string[]>(badges.filter(b => b.destacada).map(b => b.id))
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function toggleDestacada(id: string) {
    setDestacadas(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  async function guardar() {
    setLoading(true)
    await Promise.all([
      fetch('/api/perfil/datos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minecraft_username: mc, bio: bioTexto, discord_username: discord }),
      }),
      fetch('/api/perfil/badges-destacadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeIds: destacadas }),
      }),
    ])
    setLoading(false)
    onClose()
    router.refresh()
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg)',
    border: '1px solid rgba(255,255,255,0.055)', color: 'var(--bone)',
    fontFamily: 'var(--font-barlow-condensed)', fontSize: '14px',
    padding: '10px 14px', outline: 'none',
  }

  const labelStyle = {
    fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
    letterSpacing: '0.2em', textTransform: 'uppercase' as const,
    color: 'var(--text-dim)', marginBottom: '6px', display: 'block'
  }

  return (
    <>
      {abierto && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.5)' }} />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 901,
        width: '360px', maxWidth: '90vw',
        background: 'var(--bg2)',
        borderLeft: '1px solid rgba(74,124,63,0.3)',
        padding: '24px',
        transform: abierto ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
        display: 'flex', flexDirection: 'column' as const, gap: '20px',
        overflowY: 'auto' as const,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', color: 'var(--bone)', letterSpacing: '0.06em' }}>
            Editar perfil
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-mid)', width: '28px', height: '28px', cursor: 'pointer'
          }}>×</button>
        </div>

        <div>
          <label style={labelStyle}>Nick de Minecraft</label>
          <input
            value={mc}
            onChange={e => setMc(e.target.value)}
            placeholder="TuNickDeMinecraft"
            maxLength={32}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Bio / Estado ({bioTexto.length}/160)</label>
          <textarea
            value={bioTexto}
            onChange={e => setBioTexto(e.target.value.slice(0, 160))}
            placeholder="Explorando el sector norte..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        </div>

        <div>
          <label style={labelStyle}>Discord</label>
          <input
            value={discord}
            onChange={e => setDiscord(e.target.value)}
            placeholder="tu_usuario"
            style={inputStyle}
          />
        </div>

        {badges.length > 0 && (
          <div>
            <label style={labelStyle}>Badges destacadas ({destacadas.length}/5)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
              {badges.map(b => {
                const activa = destacadas.includes(b.id)
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleDestacada(b.id)}
                    title={b.nombre}
                    style={{
                      width: '38px', height: '38px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', cursor: 'pointer',
                      background: activa ? `${b.color ?? '#4a7c3f'}22` : 'var(--bg)',
                      border: activa ? `2px solid ${b.color ?? 'var(--green-bright)'}` : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {b.icono ?? '🏅'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button onClick={guardar} disabled={loading} style={{
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '11px', cursor: 'pointer',
          background: loading ? 'rgba(74,124,63,0.3)' : 'var(--green)',
          color: 'var(--bone)', border: 'none',
        }}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </>
  )
}