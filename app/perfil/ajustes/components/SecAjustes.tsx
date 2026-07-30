'use client'

import { useState } from 'react'

interface Props {
  usuario: {
    username: string
    email: string
    minecraft_username: string | null
    bio: string | null
    discord_username: string | null
  }
}

export default function SecAjustes({ usuario }: Props) {
  const [mc, setMc] = useState(usuario.minecraft_username ?? '')
  const [bio, setBio] = useState(usuario.bio ?? '')
  const [discord, setDiscord] = useState(usuario.discord_username ?? '')
  const [guardado, setGuardado] = useState(false)
  const [loading, setLoading] = useState(false)

  async function guardar() {
    setLoading(true)
    const res = await fetch('/api/perfil/datos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minecraft_username: mc, bio, discord_username: discord })
    })
    setLoading(false)
    if (res.ok) {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    }
  }

  const inputStyle = {
    background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.055)',
    color: 'var(--bone)', fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '14px', padding: '10px 14px', outline: 'none',
    letterSpacing: '0.04em', width: '100%'
  }

  const labelStyle = {
    fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
    letterSpacing: '0.2em', textTransform: 'uppercase' as const,
    color: 'var(--text-dim)', marginBottom: '6px', display: 'block'
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '28px', color: 'var(--bone)', letterSpacing: '0.04em', lineHeight: 1 }}>Ajustes de Cuenta</h2>
        <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginTop: '4px' }}>
          Información básica y credenciales
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px' }}>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)', padding: '24px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--green-bright)', opacity: 0.75, marginBottom: '16px', fontWeight: 600 }}>
            Información básica
          </div>
          <div>
            <label style={labelStyle}>Nick</label>
            <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={usuario.username} disabled />
          </div>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em', marginTop: '10px' }}>
            El nick de la web no se puede cambiar de momento.
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)', padding: '24px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--green-bright)', opacity: 0.75, marginBottom: '16px', fontWeight: 600 }}>
            Perfil público
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nick de Minecraft</label>
              <input style={inputStyle} value={mc} onChange={e => setMc(e.target.value)} placeholder="TuNickDeMinecraft" maxLength={32} />
            </div>
            <div>
              <label style={labelStyle}>Bio / Estado ({bio.length}/160)</label>
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' as const }} value={bio} onChange={e => setBio(e.target.value.slice(0, 160))} placeholder="Explorando el sector norte..." />
            </div>
            <div>
              <label style={labelStyle}>Discord</label>
              <input style={inputStyle} value={discord} onChange={e => setDiscord(e.target.value)} placeholder="tu_usuario" />
            </div>
          </div>
          <button onClick={guardar} disabled={loading} style={{
            marginTop: '16px', fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px',
            letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 600,
            padding: '10px 20px', cursor: 'pointer',
            background: guardado ? 'rgba(74,124,63,0.3)' : 'var(--green)',
            color: 'var(--bone)', border: 'none', transition: 'background 0.2s'
          }}>
            {guardado ? '✓ Guardado' : loading ? '...' : 'Guardar cambios'}
          </button>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)', padding: '24px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--green-bright)', opacity: 0.75, marginBottom: '16px', fontWeight: 600 }}>
            Email
          </div>
          <label style={labelStyle}>Email actual</label>
          <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={usuario.email} disabled />
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em', marginTop: '10px' }}>
            Cambiar el email requiere verificación — función en desarrollo.
          </div>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(155,28,28,0.2)', padding: '24px' }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--blood-bright)', opacity: 0.75, marginBottom: '16px', fontWeight: 600 }}>
            Zona de peligro
          </div>
          <button style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const, fontWeight: 600, padding: '10px 20px', cursor: 'pointer',
            background: 'transparent', color: 'var(--blood-bright)', border: '1px solid rgba(155,28,28,0.4)',
          }}>
            Eliminar cuenta
          </button>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em', marginTop: '10px' }}>
            Esta acción es irreversible. Todos tus datos serán eliminados.
          </div>
        </div>

      </div>
    </div>
  )
}