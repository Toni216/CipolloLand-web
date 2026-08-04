'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Anuncio {
  id: string
  titulo: string
  cuerpo: string
  pinned: boolean
  created_at: Date
  users: { username: string } | null
}

interface Props {
  anuncios: Anuncio[]
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '11px', letterSpacing: '0.15em',
  textTransform: 'uppercase', color: 'var(--text-dim)',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--bone)',
  padding: '10px 12px',
  fontFamily: 'var(--font-special-elite)',
  fontSize: '13px',
}

const botonStyle = (color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '11px', letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color, background: 'transparent',
  border: `1px solid ${color}66`,
  padding: '6px 14px',
  cursor: 'pointer',
})

function FormularioNuevo({ onCreado }: { onCreado: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [pinned, setPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function crear() {
    if (!titulo.trim() || !cuerpo.trim()) {
      setError('Rellena título y cuerpo.')
      return
    }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/admin/anuncios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, cuerpo, pinned }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al crear el anuncio.')
      return
    }
    setTitulo('')
    setCuerpo('')
    setPinned(false)
    onCreado()
  }

  return (
    <div style={{
      border: '1px solid rgba(74,124,63,0.25)',
      background: 'rgba(74,124,63,0.03)',
      padding: '24px', marginBottom: '32px',
    }}>
      <div style={{
        fontFamily: 'var(--font-bebas)', fontSize: '20px',
        color: 'var(--green-bright)', letterSpacing: '0.06em', marginBottom: '16px'
      }}>
        Nuevo anuncio
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Título ({titulo.length}/128)</label>
        <input
          style={inputStyle}
          value={titulo}
          maxLength={128}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Ej: Nuevo evento este fin de semana"
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Cuerpo</label>
        <textarea
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          value={cuerpo}
          onChange={e => setCuerpo(e.target.value)}
          placeholder="Contenido del anuncio..."
        />
      </div>

      <label style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px',
        letterSpacing: '0.08em', color: 'var(--text-mid)', cursor: 'pointer',
      }}>
        <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
        Fijar este anuncio (desfija automáticamente el anterior)
      </label>

      {error && (
        <div style={{ color: 'var(--blood-bright)', fontSize: '12px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <button
        onClick={crear}
        disabled={loading}
        style={{ ...botonStyle('var(--green-bright)'), opacity: loading ? 0.5 : 1 }}
      >
        {loading ? 'Publicando…' : 'Publicar anuncio'}
      </button>
    </div>
  )
}

function TarjetaAnuncio({ a, onRefresh }: { a: Anuncio, onRefresh: () => void }) {
  const [editando, setEditando] = useState(false)
  const [titulo, setTitulo] = useState(a.titulo)
  const [cuerpo, setCuerpo] = useState(a.cuerpo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/anuncios/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, cuerpo }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al guardar.')
      return
    }
    setEditando(false)
    onRefresh()
  }

  async function togglePin() {
    setLoading(true)
    await fetch(`/api/admin/anuncios/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !a.pinned }),
    })
    setLoading(false)
    onRefresh()
  }

  async function borrar() {
    if (!confirm(`¿Borrar el anuncio "${a.titulo}"? Esta acción no se puede deshacer.`)) return
    setLoading(true)
    await fetch(`/api/admin/anuncios/${a.id}`, { method: 'DELETE' })
    setLoading(false)
    onRefresh()
  }

  return (
    <div style={{
      border: `1px solid ${a.pinned ? 'rgba(74,124,63,0.3)' : 'rgba(255,255,255,0.055)'}`,
      background: a.pinned ? 'rgba(74,124,63,0.03)' : 'var(--bg2)',
      padding: '20px 24px', marginBottom: '12px',
    }}>
      {editando ? (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Título ({titulo.length}/128)</label>
            <input style={inputStyle} value={titulo} maxLength={128} onChange={e => setTitulo(e.target.value)} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Cuerpo</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={cuerpo}
              onChange={e => setCuerpo(e.target.value)}
            />
          </div>
          {error && <div style={{ color: 'var(--blood-bright)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={guardar} disabled={loading} style={botonStyle('var(--green-bright)')}>
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
            <button onClick={() => { setEditando(false); setTitulo(a.titulo); setCuerpo(a.cuerpo) }} style={botonStyle('var(--text-dim)')}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              {a.pinned && (
                <div style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-barlow-condensed)',
                  fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--green-bright)', border: '1px solid rgba(74,124,63,0.4)',
                  padding: '2px 8px', marginBottom: '8px',
                }}>
                  📌 Fijado
                </div>
              )}
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: '22px',
                color: 'var(--bone-dim)', letterSpacing: '0.06em',
              }}>
                {a.titulo}
              </div>
            </div>
          </div>

          <p style={{
            fontFamily: 'var(--font-special-elite)', fontSize: '13px',
            color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '12px',
            whiteSpace: 'pre-wrap',
          }}>
            {a.cuerpo}
          </p>

          <div style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
            color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '14px',
          }}>
            {a.users?.username && `Por ${a.users.username} · `}
            {new Date(a.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditando(true)} disabled={loading} style={botonStyle('var(--text-mid)')}>
              Editar
            </button>
            <button onClick={togglePin} disabled={loading} style={botonStyle('var(--green-bright)')}>
              {a.pinned ? 'Desfijar' : 'Fijar'}
            </button>
            <button onClick={borrar} disabled={loading} style={botonStyle('var(--blood-bright)')}>
              Borrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ListaAnuncios({ anuncios }: Props) {
  const router = useRouter()
  const refresh = () => router.refresh()

  return (
    <div>
      <FormularioNuevo onCreado={refresh} />

      {anuncios.length === 0 ? (
        <p style={{
          fontFamily: 'var(--font-special-elite)', fontSize: '14px',
          color: 'var(--text-dim)',
        }}>
          No hay anuncios todavía.
        </p>
      ) : (
        anuncios.map(a => <TarjetaAnuncio key={a.id} a={a} onRefresh={refresh} />)
      )}
    </div>
  )
}