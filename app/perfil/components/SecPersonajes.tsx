'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Personaje {
  id: string
  nombre_pj: string | null
  faccion_pj: string | null
  raza_pj: string | null
  clase_pj: string | null
  status: string
  es_npc: boolean
  created_at: Date
}

interface Props {
  personajes: Personaje[]
  solicitud: {
    status: string
    motivo_rechazo: string | null
    created_at: Date
    slots_permitidos: number
  } | null
  slotsPermitidos: number
  rol: string
}

export function SectionHeader({ title, sub }: { title: string, sub: string }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: '28px', color: 'var(--bone)',
        letterSpacing: '0.04em', lineHeight: 1
      }}>{title}</h2>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '12px', color: 'var(--text-dim)',
        letterSpacing: '0.08em', marginTop: '4px'
      }}>{sub}</div>
    </div>
  )
}

function TarjetaPersonaje({ pj }: { pj: Personaje }) {
  const faccionColor: Record<string, string> = {
    'Protocolo Lázaro': '#20B2AA',
    'Las Cucarachas':   '#c9962a',
    'Los Vestigios':    '#8a8070',
  }
  const color = faccionColor[pj.faccion_pj ?? ''] ?? 'var(--green-bright)'

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.055)',
      background: 'var(--bg2)',
      borderTop: `2px solid ${color}`,
      padding: '20px', minHeight: '220px',
      position: 'relative' as const,
    }}>
      <div style={{
        position: 'absolute' as const, top: '12px', right: '12px',
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '9px', letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        color: 'var(--text-dim)',
        border: '1px solid rgba(255,255,255,0.055)',
        padding: '2px 6px'
      }}>T3</div>

      <div style={{
        width: '52px', height: '52px',
        border: `1px solid ${color}44`,
        background: `${color}11`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '12px',
        fontFamily: 'var(--font-bebas)',
        fontSize: '24px', color
      }}>
        {pj.nombre_pj?.[0]?.toUpperCase() ?? '?'}
      </div>

      <div style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: '20px', color: 'var(--bone)',
        letterSpacing: '0.06em', marginBottom: '4px'
      }}>
        {pj.nombre_pj ?? 'Sin nombre'}
      </div>

      {pj.faccion_pj && (
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', color,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          marginBottom: '4px'
        }}>
          {pj.faccion_pj}
        </div>
      )}

      {(pj.raza_pj || pj.clase_pj) && (
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', color: 'var(--text-dim)',
          letterSpacing: '0.06em'
        }}>
          {[pj.raza_pj, pj.clase_pj].filter(Boolean).join(' · ')}
        </div>
      )}

      {pj.status !== 'aprobado' && (
        <div style={{
          marginTop: '10px',
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '10px', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: pj.status === 'pendiente' ? '#c9962a' : 'var(--blood-bright)',
          border: `1px solid ${pj.status === 'pendiente' ? 'rgba(201,150,42,0.3)' : 'rgba(155,28,28,0.3)'}`,
          padding: '3px 8px', display: 'inline-block'
        }}>
          {pj.status}
        </div>
      )}
    </div>
  )
}

function TarjetaNuevoPj({ onCreate }: { onCreate: () => void }) {
  return (
    <button onClick={onCreate} style={{
      border: '1px dashed rgba(74,124,63,0.3)',
      background: 'transparent',
      padding: '20px', minHeight: '220px',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center',
      gap: '10px', cursor: 'pointer', width: '100%',
      transition: 'border-color 0.2s, background 0.2s'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(74,124,63,0.6)'
      e.currentTarget.style.background = 'rgba(74,124,63,0.04)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(74,124,63,0.3)'
      e.currentTarget.style.background = 'transparent'
    }}>
      <div style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: '48px', color: 'var(--green-bright)',
        lineHeight: 1
      }}>+</div>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '12px', color: 'var(--text-dim)',
        letterSpacing: '0.1em', textTransform: 'uppercase' as const
      }}>
        Nuevo personaje
      </div>
    </button>
  )
}

function FormularioPj({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_pj: '', edad_pj: '', pj_who: '',
    historia_pj: '', faccion_pj: '', raza_pj: '',
    clase_pj: '', objetivos: '', reaccion_peligro: '',
    comida_favorita: '', apodo_odiado: '',
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre_pj.trim()) {
      setError('El nombre del personaje es obligatorio.')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/t3/personaje', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
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

  const campo = (key: string, label: string, placeholder: string, required = false, tipo: 'input' | 'textarea' = 'input') => (
    <div key={key}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: 'var(--blood-bright)' }}>*</span>}
      </label>
      {tipo === 'textarea' ? (
        <textarea
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
          value={(form as any)[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          style={inputStyle}
          value={(form as any)[key]}
          onChange={e => set(key, e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
          {campo('nombre_pj', 'Nombre del personaje', 'Ej: Zarael_X', true)}
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
            <option value="Protocolo Lázaro">🧬 Protocolo Lázaro</option>
            <option value="Las Cucarachas">🪲 Las Cucarachas</option>
            <option value="Los Vestigios">💀 Los Vestigios</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {campo('raza_pj', 'Raza', 'Ej: Humano')}
          {campo('clase_pj', 'Clase', 'Ej: Explorador')}
        </div>

        {campo('pj_who', '¿Quién es tu personaje?', 'Describe brevemente quién es...', false, 'textarea')}
        {campo('historia_pj', 'Historia / Backstory', 'Cuéntanos la historia de tu personaje...', false, 'textarea')}
        {campo('objetivos', 'Objetivos y motivaciones', '¿Qué busca tu personaje?', false, 'textarea')}
        {campo('reaccion_peligro', '¿Cómo reacciona ante el peligro?', 'Huye, lucha, negocia...', false, 'textarea')}

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.055)',
          paddingTop: '16px'
        }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '9px', letterSpacing: '0.25em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-dim)', marginBottom: '12px'
          }}>
            Preguntas adicionales
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
            {campo('comida_favorita', '¿Tiene alguna comida favorita en este apocalipsis?', 'Latas de atún, carne de zombie...')}
            {campo('apodo_odiado', '¿Tiene algún apodo que odia que le llamen?', 'Ej: "El Pequeño"')}
          </div>
        </div>

        {error && (
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '12px', color: 'var(--blood-bright)',
            letterSpacing: '0.06em', padding: '10px 14px',
            border: '1px solid rgba(155,28,28,0.3)',
            background: 'rgba(155,28,28,0.05)'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" disabled={loading} style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '12px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const, fontWeight: 600,
            padding: '11px 24px', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(74,124,63,0.3)' : 'var(--green)',
            color: 'var(--bone)', border: 'none', flex: 1,
            transition: 'background 0.2s'
          }}>
            {loading ? 'Creando...' : 'Crear personaje →'}
          </button>
          <button type="button" onClick={onClose} style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '12px', letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            padding: '11px 20px', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-dim)',
            border: '1px solid rgba(255,255,255,0.055)'
          }}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}

export default function SecPersonajes({ personajes, solicitud, slotsPermitidos, rol }: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const router = useRouter()
  const esAdmin = ['admin', 'owner'].includes(rol)
  const aprobado = solicitud?.status === 'aprobado'
  const slotsUsados = personajes.length
  const slotsLibres = Math.max(0, slotsPermitidos - slotsUsados)

  if (esAdmin) {
    return (
      <div>
        <SectionHeader title="Mis Personajes" sub="Edición activa: E3" />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {personajes.map(pj => <TarjetaPersonaje key={pj.id} pj={pj} />)}
          <TarjetaNuevoPj onCreate={() => setMostrarFormulario(true)} />
        </div>

        {mostrarFormulario && <Modal onClose={() => setMostrarFormulario(false)} onSuccess={() => { setMostrarFormulario(false); router.refresh() }} />}
      </div>
    )
  }

  if (!aprobado) {
    return (
      <div>
        <SectionHeader title="Mis Personajes" sub="Edición activa: E3" />
        {solicitud?.status === 'pendiente' ? (
          <div style={{ border: '1px solid rgba(201,150,42,0.3)', background: 'rgba(201,150,42,0.04)', padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', color: '#c9962a', letterSpacing: '0.06em', marginBottom: '6px' }}>⏳ Solicitud pendiente</div>
            <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px', color: 'var(--text-mid)', letterSpacing: '0.06em' }}>
              Tu solicitud está siendo revisada. Podrás crear tu personaje cuando sea aprobada.
            </p>
          </div>
        ) : solicitud?.status === 'rechazado' ? (
          <div style={{ border: '1px solid rgba(155,28,28,0.3)', background: 'rgba(155,28,28,0.04)', padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', color: 'var(--blood-bright)', letterSpacing: '0.06em', marginBottom: '6px' }}>✗ Solicitud rechazada</div>
            {solicitud.motivo_rechazo && (
              <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px', color: 'var(--text-mid)', letterSpacing: '0.06em', marginBottom: '12px' }}>
                Motivo: {solicitud.motivo_rechazo}
              </p>
            )}
            <Link href="/t3/solicitud" style={{ display: 'inline-flex', fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, padding: '8px 16px', border: '1px solid rgba(74,124,63,0.4)', color: 'var(--green-bright)', textDecoration: 'none' }}>
              Volver a solicitar →
            </Link>
          </div>
        ) : (
          <div style={{ border: '1px solid rgba(255,255,255,0.055)', background: 'var(--bg2)', padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', color: 'var(--bone-dim)', letterSpacing: '0.06em', marginBottom: '6px' }}>Sin acceso a la 3ª Edición</div>
            <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px', color: 'var(--text-mid)', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Solicita el acceso para poder jugar y crear tu personaje.
            </p>
            <Link href="/t3/solicitud" style={{ display: 'inline-flex', fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' as const, padding: '8px 16px', background: 'var(--green)', color: 'var(--bone)', textDecoration: 'none', border: '1px solid var(--green-bright)' }}>
              Solicitar acceso →
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '28px', color: 'var(--bone)', letterSpacing: '0.04em', lineHeight: 1 }}>Mis Personajes</h2>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.08em', marginTop: '4px' }}>
            3ª Edición · <span style={{ color: slotsLibres > 0 ? 'var(--green-bright)' : 'var(--blood-bright)' }}>
              {slotsUsados}/{slotsPermitidos} slots
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {personajes.map(pj => <TarjetaPersonaje key={pj.id} pj={pj} />)}
        {slotsLibres > 0 && <TarjetaNuevoPj onCreate={() => setMostrarFormulario(true)} />}
      </div>

      {mostrarFormulario && <Modal onClose={() => setMostrarFormulario(false)} onSuccess={() => { setMostrarFormulario(false); router.refresh() }} />}
    </div>
  )
}

function Modal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  return (
    <div style={{
      position: 'fixed' as const, inset: 0, zIndex: 800,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid rgba(74,124,63,0.28)',
        borderTop: '2px solid var(--green)',
        width: '100%', maxWidth: '580px',
        maxHeight: '85vh', overflowY: 'auto' as const,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          position: 'sticky' as const, top: 0, background: 'var(--bg2)', zIndex: 1
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', color: 'var(--bone)', letterSpacing: '0.06em' }}>Nuevo personaje</div>
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>3ª Edición · Apocalipsis</div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.055)',
            color: 'var(--text-mid)', width: '30px', height: '30px',
            cursor: 'pointer', fontSize: '16px', flexShrink: 0
          }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>
          <FormularioPj onClose={onClose} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  )
}