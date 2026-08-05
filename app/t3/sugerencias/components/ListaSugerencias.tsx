'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Sugerencia {
  id: string
  titulo: string
  descripcion: string
  estado: string
  editado: boolean
  created_at: Date
  username: string | null
  esPropia: boolean
  votos: number
  yaVote: boolean
  puedeEditar: boolean
  puedeBorrar: boolean
}

interface Props {
  sugerencias: Sugerencia[]
  haySesion: boolean
  ordenActivo: 'votos' | 'recientes'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg2)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--bone)',
  padding: '10px 12px',
  fontFamily: 'var(--font-special-elite)',
  fontSize: '13px',
  boxSizing: 'border-box',
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

const ESTADO_INFO: Record<string, { label: string, color: string }> = {
  pendiente:    { label: 'Pendiente',    color: 'var(--text-dim)' },
  en_progreso:  { label: 'En progreso',  color: '#c9962a' },
  hecho:        { label: 'Hecho',        color: 'var(--green-bright)' },
  descartado:   { label: 'Descartado',   color: 'var(--blood-bright)' },
}

function FormularioNuevaSugerencia({ onCreada }: { onCreada: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)

  async function enviar() {
    if (!titulo.trim() || !descripcion.trim()) {
      setError('Rellena título y descripción.')
      return
    }
    setLoading(true)
    setError(null)
    const res = await fetch('/api/t3/sugerencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al publicar.')
      return
    }
    setTitulo(''); setDescripcion(''); setAbierto(false)
    onCreada()
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} style={{ ...botonStyle('var(--green-bright)'), marginBottom: '24px', padding: '10px 20px' }}>
        + Proponer una idea
      </button>
    )
  }

  return (
    <div style={{
      border: '1px solid rgba(74,124,63,0.25)',
      background: 'rgba(74,124,63,0.03)',
      padding: '24px', marginBottom: '24px',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <input
          style={inputStyle} value={titulo} maxLength={128}
          onChange={e => setTitulo(e.target.value)}
          placeholder={`Título (${titulo.length}/128)`}
        />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <textarea
          style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Explica tu idea..."
        />
      </div>
      {error && <div style={{ color: 'var(--blood-bright)', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={enviar} disabled={loading} style={botonStyle('var(--green-bright)')}>
          {loading ? 'Publicando…' : 'Publicar'}
        </button>
        <button onClick={() => setAbierto(false)} style={botonStyle('var(--text-dim)')}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

function VersionesHistorial({ id }: { id: string }) {
  const [versiones, setVersiones] = useState<{ titulo: string, descripcion: string, guardado_en: string }[] | null>(null)
  const [cargando, setCargando] = useState(false)

  async function cargar() {
    if (versiones) { setVersiones(null); return } // toggle cerrar
    setCargando(true)
    const res = await fetch(`/api/t3/sugerencias/${id}/versiones`)
    const data = await res.json().catch(() => null)
    setCargando(false)
    setVersiones(data?.versiones ?? [])
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <button onClick={cargar} style={{ ...botonStyle('var(--text-dim)'), fontSize: '10px', padding: '3px 10px' }}>
        {cargando ? 'Cargando…' : versiones ? 'Ocultar versiones anteriores' : 'Ver versiones anteriores'}
      </button>
      {versiones && versiones.length > 0 && (
        <div style={{ marginTop: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
          {versiones.map((v, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', marginBottom: '2px' }}>
                {new Date(v.guardado_en).toLocaleString('es-ES')}
              </div>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '15px', color: 'var(--text-dim)' }}>{v.titulo}</div>
              <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                {v.descripcion}
              </p>
            </div>
          ))}
        </div>
      )}
      {versiones && versiones.length === 0 && (
        <div style={{ fontFamily: 'var(--font-special-elite)', fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
          Sin versiones anteriores.
        </div>
      )}
    </div>
  )
}

function TarjetaSugerencia({ s, haySesion, onRefresh }: { s: Sugerencia, haySesion: boolean, onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(false)
  const [titulo, setTitulo] = useState(s.titulo)
  const [descripcion, setDescripcion] = useState(s.descripcion)
  const [error, setError] = useState<string | null>(null)

  async function votar() {
    if (!haySesion) return
    setLoading(true)
    await fetch(`/api/t3/sugerencias/${s.id}/votar`, { method: 'POST' })
    setLoading(false)
    onRefresh()
  }

  async function guardarEdicion() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/t3/sugerencias/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion }),
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
    if (!confirm(`¿Borrar la sugerencia "${s.titulo}"?`)) return
    setLoading(true)
    await fetch(`/api/t3/sugerencias/${s.id}`, { method: 'DELETE' })
    setLoading(false)
    onRefresh()
  }

  const estadoInfo = ESTADO_INFO[s.estado] ?? ESTADO_INFO.pendiente

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.055)',
      background: 'var(--bg2)',
      padding: '22px 24px', marginBottom: '14px',
      display: 'flex', gap: '16px',
    }}>
      {/* Botón de voto */}
      <button
        onClick={votar}
        disabled={loading || !haySesion}
        title={haySesion ? (s.yaVote ? 'Quitar voto' : 'Votar') : 'Inicia sesión para votar'}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: s.yaVote ? 'rgba(74,124,63,0.12)' : 'transparent',
          border: `1px solid ${s.yaVote ? 'var(--green-bright)' : 'rgba(255,255,255,0.15)'}`,
          color: s.yaVote ? 'var(--green-bright)' : 'var(--text-mid)',
          padding: '8px 14px', cursor: haySesion ? 'pointer' : 'default',
          minWidth: '48px', height: 'fit-content',
        }}
      >
        <span style={{ fontSize: '16px', lineHeight: 1 }}>▲</span>
        <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px' }}>{s.votos}</span>
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: estadoInfo.color, border: `1px solid ${estadoInfo.color}66`,
            padding: '2px 8px',
          }}>
            {estadoInfo.label}
          </span>
          {s.editado && (
            <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              (editado)
            </span>
          )}
        </div>

        {editando ? (
          <div>
            <input style={{ ...inputStyle, marginBottom: '8px' }} value={titulo} maxLength={128} onChange={e => setTitulo(e.target.value)} />
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', marginBottom: '8px' }} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            {error && <div style={{ color: 'var(--blood-bright)', fontSize: '11px', marginBottom: '8px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={guardarEdicion} disabled={loading} style={botonStyle('var(--green-bright)')}>Guardar</button>
              <button onClick={() => { setEditando(false); setTitulo(s.titulo); setDescripcion(s.descripcion) }} style={botonStyle('var(--text-dim)')}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', color: 'var(--bone-dim)', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {s.titulo}
            </div>
            <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.85, marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
              {s.descripcion}
            </p>
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {s.username ? `Por ${s.username} · ` : ''}
              {new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            {s.editado && <VersionesHistorial id={s.id} />}

            {s.esPropia && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {s.puedeEditar && (
                  <button onClick={() => setEditando(true)} style={botonStyle('var(--text-mid)')}>Editar</button>
                )}
                {s.puedeBorrar && (
                  <button onClick={borrar} style={botonStyle('var(--blood-bright)')}>Borrar</button>
                )}
                {!s.puedeEditar && !s.puedeBorrar && (
                  <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)' }}>
                    Ya no se puede editar ni borrar
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ListaSugerencias({ sugerencias, haySesion, ordenActivo }: Props) {
  const router = useRouter()
  const refresh = () => router.refresh()

  return (
    <div>
      {haySesion ? (
        <FormularioNuevaSugerencia onCreada={refresh} />
      ) : (
        <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
          Inicia sesión para proponer ideas y votar.
        </p>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        <Link href="/t3/sugerencias?orden=votos" style={{
          ...botonStyle(ordenActivo === 'votos' ? 'var(--green-bright)' : 'var(--text-dim)'),
          textDecoration: 'none', display: 'inline-block',
        }}>
          Más votadas
        </Link>
        <Link href="/t3/sugerencias?orden=recientes" style={{
          ...botonStyle(ordenActivo === 'recientes' ? 'var(--green-bright)' : 'var(--text-dim)'),
          textDecoration: 'none', display: 'inline-block',
        }}>
          Más recientes
        </Link>
      </div>

      {sugerencias.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '14px', color: 'var(--text-dim)' }}>
          Nadie ha propuesto nada todavía. ¡Sé el primero!
        </p>
      ) : (
        sugerencias.map(s => <TarjetaSugerencia key={s.id} s={s} haySesion={haySesion} onRefresh={refresh} />)
      )}
    </div>
  )
}