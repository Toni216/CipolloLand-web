'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  titulo: string
  descripcion: string
  estado: string
  sugerencia_id: string | null
  sugerenciaTitulo: string | null
  created_at: Date
}

interface SugerenciaOpcion {
  id: string
  titulo: string
}

const ESTADOS = [
  { value: 'planeado',      label: 'Planeado',      color: 'var(--text-mid)' },
  { value: 'en_desarrollo', label: 'En desarrollo', color: '#c9962a' },
  { value: 'lanzado',       label: 'Lanzado',        color: 'var(--green-bright)' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--bone)',
  padding: '10px 12px',
  fontFamily: 'var(--font-special-elite)',
  fontSize: '13px',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--bone)',
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '12px',
  padding: '6px 8px',
}

const botonStyle = (color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '11px', letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color, background: 'transparent',
  border: `1px solid ${color}66`,
  padding: '6px 14px',
  cursor: 'pointer',
})

function FormularioNuevo({ sugerencias, onCreado }: { sugerencias: SugerenciaOpcion[], onCreado: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('planeado')
  const [sugerenciaId, setSugerenciaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function crear() {
    if (!titulo.trim() || !descripcion.trim()) {
      setError('Rellena título y descripción.')
      return
    }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/admin/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, estado, sugerencia_id: sugerenciaId || null }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al crear.')
      return
    }
    setTitulo(''); setDescripcion(''); setEstado('planeado'); setSugerenciaId('')
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
        Nuevo elemento
      </div>

      <div style={{ marginBottom: '12px' }}>
        <input
          style={inputStyle} value={titulo} maxLength={128}
          onChange={e => setTitulo(e.target.value)}
          placeholder={`Título (${titulo.length}/128)`}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <textarea
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Descripción..."
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <select style={selectStyle} value={estado} onChange={e => setEstado(e.target.value)}>
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>

        <select style={{ ...selectStyle, flex: 1, minWidth: '200px' }} value={sugerenciaId} onChange={e => setSugerenciaId(e.target.value)}>
          <option value="">Sin vincular a ninguna sugerencia</option>
          {sugerencias.map(s => (
            <option key={s.id} value={s.id}>{s.titulo}</option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: 'var(--blood-bright)', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}

      <button onClick={crear} disabled={loading} style={botonStyle('var(--green-bright)')}>
        {loading ? 'Creando…' : 'Crear elemento'}
      </button>
    </div>
  )
}

function TarjetaItem({ item, sugerencias, onRefresh }: { item: Item, sugerencias: SugerenciaOpcion[], onRefresh: () => void }) {
  const [editando, setEditando] = useState(false)
  const [titulo, setTitulo] = useState(item.titulo)
  const [descripcion, setDescripcion] = useState(item.descripcion)
  const [sugerenciaId, setSugerenciaId] = useState(item.sugerencia_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estadoInfo = ESTADOS.find(e => e.value === item.estado) ?? ESTADOS[0]

  async function cambiarEstado(nuevoEstado: string) {
    setLoading(true)
    await fetch(`/api/admin/roadmap/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    setLoading(false)
    onRefresh()
  }

  async function guardar() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/roadmap/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, sugerencia_id: sugerenciaId || null }),
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

  async function borrar() {
    if (!confirm(`¿Borrar "${item.titulo}" del roadmap?`)) return
    setLoading(true)
    await fetch(`/api/admin/roadmap/${item.id}`, { method: 'DELETE' })
    setLoading(false)
    onRefresh()
  }

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.055)', background: 'var(--bg2)',
      padding: '20px 24px', marginBottom: '12px',
    }}>
      {editando ? (
        <div>
          <input style={{ ...inputStyle, marginBottom: '8px' }} value={titulo} maxLength={128} onChange={e => setTitulo(e.target.value)} />
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', marginBottom: '8px' }} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <select style={{ ...selectStyle, width: '100%', marginBottom: '8px' }} value={sugerenciaId} onChange={e => setSugerenciaId(e.target.value)}>
            <option value="">Sin vincular a ninguna sugerencia</option>
            {sugerencias.map(s => <option key={s.id} value={s.id}>{s.titulo}</option>)}
          </select>
          {error && <div style={{ color: 'var(--blood-bright)', fontSize: '11px', marginBottom: '8px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={guardar} disabled={loading} style={botonStyle('var(--green-bright)')}>Guardar</button>
            <button onClick={() => setEditando(false)} style={botonStyle('var(--text-dim)')}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '9.5px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: estadoInfo.color, border: `1px solid ${estadoInfo.color}66`,
                padding: '3px 8px',
              }}>
                {estadoInfo.label}
              </span>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', color: 'var(--bone-dim)', letterSpacing: '0.05em' }}>
                {item.titulo}
              </div>
            </div>
            <select
              style={selectStyle}
              value={item.estado}
              disabled={loading}
              onChange={e => cambiarEstado(e.target.value)}
            >
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
            {item.descripcion}
          </p>

          {item.sugerenciaTitulo && (
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '10.5px',
              color: 'var(--green-bright)', marginBottom: '10px',
            }}>
              💡 Basado en la sugerencia: {item.sugerenciaTitulo}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditando(true)} style={botonStyle('var(--text-mid)')}>Editar</button>
            <button onClick={borrar} style={botonStyle('var(--blood-bright)')}>Borrar</button>
          </div>
        </>
      )}
    </div>
  )
}

export default function GestionRoadmap({ items, sugerencias }: { items: Item[], sugerencias: SugerenciaOpcion[] }) {
  const router = useRouter()
  const refresh = () => router.refresh()

  return (
    <div>
      <FormularioNuevo sugerencias={sugerencias} onCreado={refresh} />

      {items.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '14px', color: 'var(--text-dim)' }}>
          No hay elementos en el roadmap todavía.
        </p>
      ) : (
        items.map(item => (
          <TarjetaItem key={item.id} item={item} sugerencias={sugerencias} onRefresh={refresh} />
        ))
      )}
    </div>
  )
}