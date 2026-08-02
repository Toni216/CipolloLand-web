'use client'

import { useState } from 'react'

const RAZAS = ['Humano', 'Alien', 'Enano', 'Orco', 'Elfo']
const CLASES = ['Superviviente', 'Quimera', 'Titán', 'Cerebrito', 'Cypollorg', 'Corrompido']

function BuscadorJugador({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [resultados, setResultados] = useState<string[]>([])
  const [abierto, setAbierto] = useState(false)

  async function buscar(texto: string) {
    onChange(texto)
    if (texto.trim().length < 2) {
      setResultados([])
      return
    }
    const res = await fetch(`/api/admin/usuarios/buscar?q=${encodeURIComponent(texto)}`)
    const data = await res.json()
    setResultados(data.usuarios ?? [])
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(9,10,7,0.8)',
    border: '1px solid rgba(255,255,255,0.055)',
    color: 'var(--bone)',
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '14px', padding: '10px 14px',
    outline: 'none', letterSpacing: '0.04em',
  }

  return (
    <div style={{ position: 'relative' as const }}>
      <input
        style={inputStyle}
        value={value}
        onChange={e => buscar(e.target.value)}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        placeholder="Escribe el nombre de usuario..."
        autoComplete="off"
      />
      {abierto && resultados.length > 0 && (
        <div style={{
          position: 'absolute' as const, top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg2)', border: '1px solid rgba(74,124,63,0.3)',
          zIndex: 10, maxHeight: '180px', overflowY: 'auto' as const,
        }}>
          {resultados.map(u => (
            <button
              key={u}
              type="button"
              onClick={() => { onChange(u); setResultados([]); setAbierto(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left' as const,
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px',
                padding: '9px 14px', cursor: 'pointer',
                background: 'transparent', border: 'none', color: 'var(--text-mid)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,124,63,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {u}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface FormularioPjProps {
  onClose: () => void
  onSuccess: () => void
  esAdmin: boolean
  duenoFijo?: string // si viene, el dueño ya está decidido (ej. desde aprobar solicitud)
}

function FormularioPj({ onClose, onSuccess, esAdmin, duenoFijo }: FormularioPjProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_pj: '', edad_pj: '', pj_who: '',
    historia_pj: '', faccion_pj: '', raza_pj: '',
    clase_pj: '', objetivos: '', reaccion_peligro: '',
    comida_favorita: '', apodo_odiado: '',
  })
  const [tipoDueno, setTipoDueno] = useState<'yo_mismo' | 'jugador' | 'sin_dueno' | 'npc'>(
    duenoFijo ? 'jugador' : 'yo_mismo'
  )
  const [duenoUsername, setDuenoUsername] = useState(duenoFijo ?? '')

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre_pj.trim()) {
      setError('El nombre del personaje es obligatorio.')
      return
    }
    if (esAdmin && tipoDueno === 'jugador' && !duenoUsername.trim()) {
      setError('Escribe el nombre de usuario del jugador.')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/t3/personaje', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        ...(esAdmin ? { tipo_dueno: tipoDueno, dueno_username: duenoUsername.trim() } : {}),
      })
    })
    setLoading(false)
    if (res.ok) {
      onSuccess()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al crear el personaje.')
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(9,10,7,0.8)',
    border: '1px solid rgba(255,255,255,0.055)',
    color: 'var(--bone)',
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '14px', padding: '10px 14px',
    outline: 'none', letterSpacing: '0.04em',
  }

  const labelStyle = {
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '10px', letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-dim)', marginBottom: '6px',
    display: 'block'
  }

  const campo = (key: string, label: string, placeholder: string, required = false, tipo: 'input' | 'textarea' = 'input', maxLength?: number) => (
    <div key={key}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: 'var(--blood-bright)' }}>*</span>}
        {maxLength && (
          <span style={{ color: 'var(--text-dim)', textTransform: 'none' as const, letterSpacing: 0 }}>
            {' '}({(form as any)[key].length}/{maxLength})
          </span>
        )}
      </label>
      {tipo === 'textarea' ? (
        <textarea
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
          value={(form as any)[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
        />
      ) : (
        <input
          style={inputStyle}
          value={(form as any)[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>

        {esAdmin && (
          <div style={{
            border: '1px solid rgba(74,124,63,0.25)',
            background: 'rgba(74,124,63,0.04)',
            padding: '14px 16px',
          }}>
            <label style={labelStyle}>¿Para quién es este personaje?</label>

            {duenoFijo ? (
              <div style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px',
                color: 'var(--green-bright)', letterSpacing: '0.04em',
                padding: '8px 0',
              }}>
                🎯 {duenoFijo}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: tipoDueno === 'jugador' ? '10px' : 0 }}>
                  {[
                    { id: 'yo_mismo', label: 'Para mí' },
                    { id: 'jugador', label: 'Un jugador' },
                    { id: 'sin_dueno', label: 'Sin dueño (temporal)' },
                    { id: 'npc', label: 'NPC' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTipoDueno(opt.id as typeof tipoDueno)}
                      style={{
                        fontFamily: 'var(--font-barlow-condensed)',
                        fontSize: '11px', letterSpacing: '0.08em',
                        padding: '7px 12px', cursor: 'pointer',
                        background: tipoDueno === opt.id ? 'rgba(74,124,63,0.15)' : 'transparent',
                        border: tipoDueno === opt.id ? '1px solid var(--green-bright)' : '1px solid rgba(255,255,255,0.1)',
                        color: tipoDueno === opt.id ? 'var(--green-bright)' : 'var(--text-dim)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {tipoDueno === 'jugador' && (
                  <BuscadorJugador value={duenoUsername} onChange={setDuenoUsername} />
                )}
              </>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
          {campo('nombre_pj', 'Nombre del personaje', 'Ej: Zarael_X', true, 'input', 64)}
          {campo('edad_pj', 'Edad', '25')}
        </div>

        <div>
          <label style={labelStyle}>Facción</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={form.faccion_pj}
            onChange={e => set('faccion_pj', e.target.value)}
          >
            <option value="">Sin asignar</option>
            <option value="Protocolo Lázaro">Protocolo Lázaro</option>
            <option value="Las Cucarachas">Las Cucarachas</option>
            <option value="Los Vestigios">Los Vestigios</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Raza</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.raza_pj} onChange={e => set('raza_pj', e.target.value)}>
              <option value="">Sin asignar</option>
              {RAZAS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Clase</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.clase_pj} onChange={e => set('clase_pj', e.target.value)}>
              <option value="">Sin asignar</option>
              {CLASES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {campo('pj_who', '¿Quién es tu personaje?', 'Describe brevemente quién es...', false, 'textarea')}
        {campo('historia_pj', 'Historia / Backstory', 'Cuéntanos la historia de tu personaje...', false, 'textarea')}
        {campo('objetivos', 'Objetivos y motivaciones', '¿Qué busca tu personaje?', false, 'textarea')}
        {campo('reaccion_peligro', '¿Cómo reacciona ante el peligro?', 'Huye, lucha, negocia...', false, 'textarea')}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.055)', paddingTop: '16px' }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', letterSpacing: '0.25em',
            textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: '12px'
          }}>
            Preguntas adicionales
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
            {campo('comida_favorita', '¿Tiene alguna comida favorita en este apocalipsis?', 'Latas de atún, carne de zombie...', false, 'input', 128)}
            {campo('apodo_odiado', '¿Tiene algún apodo que odia que le llamen?', 'Ej: "El Pequeño"', false, 'input', 128)}
          </div>
        </div>

        {error && (
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', color: 'var(--blood-bright)',
            letterSpacing: '0.06em', padding: '10px 14px',
            border: '1px solid rgba(155,28,28,0.3)', background: 'rgba(155,28,28,0.05)'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" disabled={loading} style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const, fontWeight: 600,
            padding: '11px 24px', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(74,124,63,0.3)' : 'var(--green)',
            color: 'var(--bone)', border: 'none', flex: 1, transition: 'background 0.2s'
          }}>
            {loading ? 'Creando...' : 'Crear personaje →'}
          </button>
          <button type="button" onClick={onClose} style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const, padding: '11px 20px', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.055)'
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}

interface ModalProps {
  onClose: () => void
  onSuccess: () => void
  esAdmin: boolean
  duenoFijo?: string
}

export default function ModalCrearPersonaje({ onClose, onSuccess, esAdmin, duenoFijo }: ModalProps) {
  return (
    <div style={{
      position: 'fixed' as const, inset: 0, zIndex: 800,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid rgba(74,124,63,0.28)', borderTop: '2px solid var(--green)',
        width: '100%', maxWidth: '580px', maxHeight: '85vh', overflowY: 'auto' as const,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.055)',
          position: 'sticky' as const, top: 0, background: 'var(--bg2)', zIndex: 1
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', color: 'var(--bone)', letterSpacing: '0.06em' }}>Nuevo personaje</div>
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Temporada 3 · Apocalipsis</div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.055)',
            color: 'var(--text-mid)', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', flexShrink: 0
          }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>
          <FormularioPj onClose={onClose} onSuccess={onSuccess} esAdmin={esAdmin} duenoFijo={duenoFijo} />
        </div>
      </div>
    </div>
  )
}