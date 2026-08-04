'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Badge {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color: string | null
  grant_access: boolean
  _count: { user_badges: number }
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--bone)',
  padding: '8px 10px',
  fontFamily: 'var(--font-special-elite)',
  fontSize: '12px',
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

function FormularioNuevaInsignia({ onCreada }: { onCreada: () => void }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [icono, setIcono] = useState('')
  const [color, setColor] = useState('#4a7c3f')
  const [grantAccess, setGrantAccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function crear() {
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/admin/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, icono, color, grant_access: grantAccess }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al crear la insignia.')
      return
    }
    setNombre(''); setDescripcion(''); setIcono(''); setColor('#4a7c3f'); setGrantAccess(false)
    onCreada()
  }

  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          placeholder="Emoji" value={icono} maxLength={8}
          onChange={e => setIcono(e.target.value)}
          style={{ ...inputStyle, width: '56px', textAlign: 'center', fontSize: '16px' }}
        />
        <input
          placeholder="Nombre" value={nombre} maxLength={64}
          onChange={e => setNombre(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 140px' }}
        />
        <input
          placeholder="Descripción (opcional)" value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          style={{ ...inputStyle, flex: '2 1 200px' }}
        />
        <input
          type="color" value={color}
          onChange={e => setColor(e.target.value)}
          style={{ ...inputStyle, width: '44px', padding: '2px', cursor: 'pointer' }}
        />
        <label style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
          color: 'var(--text-mid)', whiteSpace: 'nowrap',
        }}>
          <input type="checkbox" checked={grantAccess} onChange={e => setGrantAccess(e.target.checked)} />
          Da acceso
        </label>
        <button onClick={crear} disabled={loading} style={botonStyle('var(--green-bright)')}>
          Crear
        </button>
      </div>
      {error && <div style={{ color: 'var(--blood-bright)', fontSize: '12px', marginTop: '8px' }}>{error}</div>}
    </div>
  )
}

function TarjetaInsignia({ b, onRefresh }: { b: Badge, onRefresh: () => void }) {
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(b.nombre)
  const [descripcion, setDescripcion] = useState(b.descripcion ?? '')
  const [icono, setIcono] = useState(b.icono ?? '')
  const [color, setColor] = useState(b.color ?? '#4a7c3f')
  const [grantAccess, setGrantAccess] = useState(b.grant_access)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/badges/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, icono, color, grant_access: grantAccess }),
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
    const aviso = b._count.user_badges > 0
      ? `"${b.nombre}" está concedida a ${b._count.user_badges} usuario${b._count.user_badges !== 1 ? 's' : ''}. Al borrarla también se la quitas a todos ellos. ¿Continuar?`
      : `¿Borrar la insignia "${b.nombre}"?`
    if (!confirm(aviso)) return
    setLoading(true)
    await fetch(`/api/admin/badges/${b.id}`, { method: 'DELETE' })
    setLoading(false)
    onRefresh()
  }

  if (editando) {
    return (
      <div style={{
        border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg)',
        padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
        width: '100%', marginBottom: '4px',
      }}>
        <input value={icono} maxLength={8} onChange={e => setIcono(e.target.value)} style={{ ...inputStyle, width: '48px', textAlign: 'center' }} />
        <input value={nombre} maxLength={64} onChange={e => setNombre(e.target.value)} style={{ ...inputStyle, flex: '1 1 120px' }} />
        <input value={descripcion} onChange={e => setDescripcion(e.target.value)} style={{ ...inputStyle, flex: '2 1 160px' }} />
        <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ ...inputStyle, width: '40px', padding: '2px', cursor: 'pointer' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-mid)' }}>
          <input type="checkbox" checked={grantAccess} onChange={e => setGrantAccess(e.target.checked)} />
          Acceso
        </label>
        <button onClick={guardar} disabled={loading} style={botonStyle('var(--green-bright)')}>Guardar</button>
        <button onClick={() => setEditando(false)} style={botonStyle('var(--text-dim)')}>Cancelar</button>
        {error && <div style={{ color: 'var(--blood-bright)', fontSize: '11px', width: '100%' }}>{error}</div>}
      </div>
    )
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
      color: b.color ?? 'var(--bone)',
      border: `1px solid ${b.color ?? 'rgba(255,255,255,0.2)'}66`,
      padding: '4px 8px 4px 10px',
    }}>
      {b.icono && <span style={{ fontSize: '13px' }}>{b.icono}</span>}
      {b.nombre}
      <span style={{ opacity: 0.6 }}>· {b._count.user_badges}</span>
      {b.grant_access && <span title="Otorga acceso">🔑</span>}
      <button onClick={() => setEditando(true)} disabled={loading} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '11px', padding: 0, textDecoration: 'underline' }}>
        editar
      </button>
      <button onClick={borrar} disabled={loading} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }} title="Borrar insignia">
        ×
      </button>
    </span>
  )
}

export default function GestionInsignias({ badges }: { badges: Badge[] }) {
  const router = useRouter()
  const refresh = () => router.refresh()

  return (
    <div>
      <FormularioNuevaInsignia onCreada={refresh} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {badges.length === 0 && (
          <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12px', color: 'var(--text-dim)' }}>
            No hay insignias creadas todavía.
          </span>
        )}
        {badges.map(b => <TarjetaInsignia key={b.id} b={b} onRefresh={refresh} />)}
      </div>
    </div>
  )
}