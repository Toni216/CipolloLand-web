'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Sugerencia {
  id: string
  titulo: string
  descripcion: string
  categoria: string
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
  categoriaActiva?: string
}

const CATEGORIAS = [
  { value: 'web',      label: 'Página web' },
  { value: 'servidor', label: 'Servidor' },
  { value: 'rol_lore', label: 'Rol/Lore' },
  { value: 'eventos',  label: 'Eventos' },
  { value: 'otro',     label: 'Otro' },
]

// Colores en hex literal (NO usar var() aquí: `${var(--x)}66` genera un color CSS inválido)
const ESTADO_INFO: Record<string, { label: string, color: string }> = {
  pendiente:    { label: 'Pendiente',    color: '#706858' },
  en_progreso:  { label: 'En progreso',  color: '#c9962a' },
  hecho:        { label: 'Hecho',        color: '#6db560' },
  descartado:   { label: 'Descartado',   color: '#c0302f' },
}

const VERDE = '#6db560'
const ROJO_OSCURO = '#9b1c1c'
const BONE = '#cfc5a0'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg2)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--bone)',
  padding: '10px 12px',
  fontFamily: 'var(--font-special-elite)',
  fontSize: '13px',
  boxSizing: 'border-box',
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
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

// Pastilla de filtro (orden / categoría) — grande y visible, con relleno sólido cuando está activa
const pastillaStyle = (activa: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '12px', letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: activa ? 'var(--bg)' : BONE,
  background: activa ? BONE : 'rgba(207,197,160,0.06)',
  border: `1px solid ${activa ? BONE : 'rgba(207,197,160,0.3)'}`,
  padding: '7px 16px',
  fontWeight: activa ? 700 : 500,
  textDecoration: 'none',
  display: 'inline-block',
  transition: 'background 0.15s, color 0.15s, border-color 0.15s',
})

function BotonVotar({ s, haySesion, onRefresh, tamano = 'normal' }: {
  s: Sugerencia, haySesion: boolean, onRefresh: () => void, tamano?: 'normal' | 'grande'
}) {
  const [loading, setLoading] = useState(false)

  async function votar(e: React.MouseEvent) {
    e.stopPropagation()
    if (!haySesion) return
    setLoading(true)
    await fetch(`/api/t3/sugerencias/${s.id}/votar`, { method: 'POST' })
    setLoading(false)
    onRefresh()
  }

  const grande = tamano === 'grande'

  return (
    <button
      onClick={votar}
      disabled={loading || !haySesion}
      title={haySesion ? (s.yaVote ? 'Quitar voto' : 'Votar') : 'Inicia sesión para votar'}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
        background: s.yaVote ? ROJO_OSCURO : 'transparent',
        border: `1px solid ${s.yaVote ? ROJO_OSCURO : 'rgba(255,255,255,0.18)'}`,
        color: s.yaVote ? BONE : 'var(--text-mid)',
        padding: grande ? '8px 16px' : '5px 12px',
        cursor: haySesion ? 'pointer' : 'default',
        lineHeight: 1,
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
      }}
    >
      <span style={{ fontFamily: 'var(--font-bebas)', fontSize: grande ? '18px' : '15px' }}>{s.votos}</span>
      <span style={{ fontFamily: 'var(--font-bebas)', fontSize: grande ? '15px' : '13px' }}>&lt;3</span>
    </button>
  )
}

function FormularioNuevaSugerencia({ onCreada }: { onCreada: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('otro')
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
      body: JSON.stringify({ titulo, descripcion, categoria }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al publicar.')
      return
    }
    setTitulo(''); setDescripcion(''); setCategoria('otro'); setAbierto(false)
    onCreada()
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} style={{ ...botonStyle(VERDE), marginBottom: '28px', padding: '10px 20px' }}>
        + Proponer una idea
      </button>
    )
  }

  return (
    <div style={{
      border: '1px solid rgba(74,124,63,0.25)',
      background: 'rgba(74,124,63,0.03)',
      padding: '24px', marginBottom: '28px',
      maxWidth: '560px',
    }}>
      <div style={{ marginBottom: '12px' }}>
        <input
          style={inputStyle} value={titulo} maxLength={128}
          onChange={e => setTitulo(e.target.value)}
          placeholder={`Título (${titulo.length}/128)`}
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={categoria} onChange={e => setCategoria(e.target.value)}>
          {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
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
        <button onClick={enviar} disabled={loading} style={botonStyle(VERDE)}>
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
    if (versiones) { setVersiones(null); return }
    setCargando(true)
    const res = await fetch(`/api/t3/sugerencias/${id}/versiones`)
    const data = await res.json().catch(() => null)
    setCargando(false)
    setVersiones(data?.versiones ?? [])
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={cargar} style={{ ...botonStyle('var(--text-dim)'), fontSize: '10px', padding: '3px 10px' }}>
        {cargando ? 'Cargando…' : versiones ? 'Ocultar versiones' : 'Ver versiones anteriores'}
      </button>
      {versiones && versiones.length > 0 && (
        <div style={{ marginTop: '8px', paddingLeft: '10px', borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
          {versiones.map((v, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', color: 'var(--text-dim)', marginBottom: '2px' }}>
                {new Date(v.guardado_en).toLocaleString('es-ES')}
              </div>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '14px', color: 'var(--text-dim)' }}>{v.titulo}</div>
              <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                {v.descripcion}
              </p>
            </div>
          ))}
        </div>
      )}
      {versiones && versiones.length === 0 && (
        <div style={{ fontFamily: 'var(--font-special-elite)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
          Sin versiones anteriores.
        </div>
      )}
    </div>
  )
}

// Formulario de edición, compartido entre la tarjeta compacta (no se usa ahí) y el modal
function FormularioEdicion({ s, onGuardado, onCancelar }: { s: Sugerencia, onGuardado: () => void, onCancelar: () => void }) {
  const [titulo, setTitulo] = useState(s.titulo)
  const [descripcion, setDescripcion] = useState(s.descripcion)
  const [categoria, setCategoria] = useState(s.categoria)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar() {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/t3/sugerencias/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, categoria }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al guardar.')
      return
    }
    onGuardado()
  }

  return (
    <div>
      <input style={{ ...inputStyle, marginBottom: '8px' }} value={titulo} maxLength={128} onChange={e => setTitulo(e.target.value)} />
      <select style={{ ...inputStyle, marginBottom: '8px', cursor: 'pointer' }} value={categoria} onChange={e => setCategoria(e.target.value)}>
        {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', marginBottom: '8px' }} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      {error && <div style={{ color: 'var(--blood-bright)', fontSize: '11px', marginBottom: '8px' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={guardar} disabled={loading} style={botonStyle(VERDE)}>Guardar</button>
        <button onClick={onCancelar} style={botonStyle('var(--text-dim)')}>Cancelar</button>
      </div>
    </div>
  )
}

// Cabecera de badges (categoría + estado), reutilizada en compacta y modal
function Badges({ s }: { s: Sugerencia }) {
  const estadoInfo = ESTADO_INFO[s.estado] ?? ESTADO_INFO.pendiente
  const categoriaLabel = CATEGORIAS.find(c => c.value === s.categoria)?.label ?? 'Otro'
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      <span style={{
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '10.5px', fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: BONE, border: `1px solid rgba(207,197,160,0.5)`,
        background: 'rgba(207,197,160,0.08)',
        padding: '4px 10px', lineHeight: 1,
      }}>
        {categoriaLabel}
      </span>
      <span style={{
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '10.5px', fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: estadoInfo.color, border: `1px solid ${estadoInfo.color}88`,
        background: `${estadoInfo.color}1a`,
        padding: '4px 10px', lineHeight: 1,
      }}>
        {estadoInfo.label}
      </span>
    </div>
  )
}

const ALTURA_TARJETA = 260

function TarjetaCompacta({ s, haySesion, onRefresh, onAbrir }: {
  s: Sugerencia, haySesion: boolean, onRefresh: () => void, onAbrir: () => void
}) {
  const [hover, setHover] = useState(false)
  const estadoInfo = ESTADO_INFO[s.estado] ?? ESTADO_INFO.pendiente

  return (
    <div
      onClick={onAbrir}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderLeft: `1px solid ${hover ? `${estadoInfo.color}88` : 'rgba(255,255,255,0.055)'}`,
        borderRight: `1px solid ${hover ? `${estadoInfo.color}88` : 'rgba(255,255,255,0.055)'}`,
        borderBottom: `1px solid ${hover ? `${estadoInfo.color}88` : 'rgba(255,255,255,0.055)'}`,
        borderTop: `3px solid ${estadoInfo.color}`,
        background: 'var(--bg2)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        height: `${ALTURA_TARJETA}px`,
        cursor: 'pointer',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 8px 20px rgba(0,0,0,0.35)' : 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <Badges s={s} />
      </div>

      <div style={{
        fontFamily: 'var(--font-bebas)', fontSize: '20px', color: 'var(--bone)',
        letterSpacing: '0.03em', marginBottom: '8px', lineHeight: 1.15,
        overflowWrap: 'break-word', wordBreak: 'break-word',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {s.titulo}
      </div>

      <p style={{
        fontFamily: 'var(--font-special-elite)', fontSize: '12.5px',
        color: 'var(--text-mid)', lineHeight: 1.75,
        whiteSpace: 'pre-wrap', flex: 1,
        overflowWrap: 'break-word', wordBreak: 'break-word',
        display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {s.descripcion}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '9.5px',
          color: 'var(--text-dim)', letterSpacing: '0.06em',
          overflowWrap: 'break-word', wordBreak: 'break-word',
        }}>
          {s.username ? `Por ${s.username}` : ''}
          {s.editado && ' · editado'}
        </div>
        <BotonVotar s={s} haySesion={haySesion} onRefresh={onRefresh} />
      </div>
    </div>
  )
}

function ModalSugerencia({ s, haySesion, onRefresh, onCerrar }: {
  s: Sugerencia, haySesion: boolean, onRefresh: () => void, onCerrar: () => void
}) {
  const [editando, setEditando] = useState(false)

  async function borrar() {
    if (!confirm(`¿Borrar la sugerencia "${s.titulo}"?`)) return
    await fetch(`/api/t3/sugerencias/${s.id}`, { method: 'DELETE' })
    onRefresh()
    onCerrar()
  }

  return (
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '640px', width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          padding: '32px',
          position: 'relative',
        }}
      >
        <button
          onClick={onCerrar}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: 'var(--text-mid)',
            fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '4px',
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '14px' }}>
          <Badges s={s} />
        </div>

        {editando ? (
          <FormularioEdicion
            s={s}
            onGuardado={() => { setEditando(false); onRefresh() }}
            onCancelar={() => setEditando(false)}
          />
        ) : (
          <>
            <div style={{
              fontFamily: 'var(--font-bebas)', fontSize: '30px', color: 'var(--bone)',
              letterSpacing: '0.03em', marginBottom: '14px', lineHeight: 1.15,
              overflowWrap: 'break-word', wordBreak: 'break-word',
              paddingRight: '24px',
            }}>
              {s.titulo}
            </div>
            <p style={{
              fontFamily: 'var(--font-special-elite)', fontSize: '14px',
              color: 'var(--text-mid)', lineHeight: 1.9, marginBottom: '18px',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word', wordBreak: 'break-word',
            }}>
              {s.descripcion}
            </p>

            <div style={{
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '10.5px',
              color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: '16px',
            }}>
              {s.username ? `Por ${s.username} · ` : ''}
              {new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              {s.editado && ' · editado'}
            </div>

            {s.editado && <VersionesHistorial id={s.id} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {s.esPropia && s.puedeEditar && (
                  <button onClick={() => setEditando(true)} style={botonStyle('var(--text-mid)')}>Editar</button>
                )}
                {s.esPropia && s.puedeBorrar && (
                  <button onClick={borrar} style={botonStyle('var(--blood-bright)')}>Borrar</button>
                )}
              </div>
              <BotonVotar s={s} haySesion={haySesion} onRefresh={onRefresh} tamano="grande" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ListaSugerencias({ sugerencias, haySesion, ordenActivo, categoriaActiva }: Props) {
  const router = useRouter()
  const [abiertaId, setAbiertaId] = useState<string | null>(null)
  const refresh = () => router.refresh()

  function construirHref(overrides: { orden?: string, categoria?: string }) {
    const params = new URLSearchParams()
    params.set('orden', overrides.orden ?? ordenActivo)
    const cat = overrides.categoria !== undefined ? overrides.categoria : categoriaActiva
    if (cat) params.set('categoria', cat)
    return `/t3/sugerencias?${params.toString()}`
  }

  const sugerenciaAbierta = sugerencias.find(s => s.id === abiertaId) ?? null

  return (
    <div>
      {haySesion ? (
        <FormularioNuevaSugerencia onCreada={refresh} />
      ) : (
        <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
          Inicia sesión para proponer ideas y votar.
        </p>
      )}

      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
          Ordenar por
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={construirHref({ orden: 'votos' })} style={pastillaStyle(ordenActivo === 'votos')}>
            Más votadas
          </Link>
          <Link href={construirHref({ orden: 'recientes' })} style={pastillaStyle(ordenActivo === 'recientes')}>
            Más recientes
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
          Categoría
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={construirHref({ categoria: '' })} style={pastillaStyle(!categoriaActiva)}>
            Todas
          </Link>
          {CATEGORIAS.map(c => (
            <Link key={c.value} href={construirHref({ categoria: c.value })} style={pastillaStyle(categoriaActiva === c.value)}>
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {sugerencias.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '14px', color: 'var(--text-dim)' }}>
          Nadie ha propuesto nada todavía. ¡Sé el primero!
        </p>
      ) : (
        <div className="sugerencias-grid">
          {sugerencias.map(s => (
            <TarjetaCompacta
              key={s.id}
              s={s}
              haySesion={haySesion}
              onRefresh={refresh}
              onAbrir={() => setAbiertaId(s.id)}
            />
          ))}
        </div>
      )}

      {sugerenciaAbierta && (
        <ModalSugerencia
          s={sugerenciaAbierta}
          haySesion={haySesion}
          onRefresh={refresh}
          onCerrar={() => setAbiertaId(null)}
        />
      )}
    </div>
  )
}