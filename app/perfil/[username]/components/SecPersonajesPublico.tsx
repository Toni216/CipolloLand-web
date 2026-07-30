'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Personaje {
  id: string
  nombre_pj: string | null
  faccion_pj: string | null
  raza_pj: string | null
  clase_pj: string | null
  status: string
  es_npc: boolean
  created_at: Date
  edad_pj: number | null
  pj_who: string | null
  historia_pj: string | null
  objetivos: string | null
  reaccion_peligro: string | null
  comida_favorita: string | null
  apodo_odiado: string | null
  detalles_publicos: boolean
}

interface Props {
  personajes: Personaje[]
  esPropio: boolean
  esAdminVisitante: boolean
  rol: string
  solicitud: { status: string; motivo_rechazo: string | null; created_at: Date; slots_permitidos: number } | null
  slotsPermitidos: number
  minecraftUsername: string | null
}

const faccionColorGlobal: Record<string, string> = {
  'Protocolo Lázaro': '#20B2AA',
  'Las Cucarachas':   '#c9962a',
  'Los Vestigios':    '#8a8070',
}
const faccionIconoGlobal: Record<string, string> = {
  'Protocolo Lázaro': '/lazaro.png',
  'Las Cucarachas':   '/cucarachas.png',
  'Los Vestigios':    '/vestigios.png',
}

function DetallePjModal({ pj, onClose }: { pj: Personaje, onClose: () => void }) {
  const color = faccionColorGlobal[pj.faccion_pj ?? ''] ?? 'var(--green-bright)'

  const fila = (label: string, valor: string | number | null) => {
    if (!valor && valor !== 0) return null
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px',
          letterSpacing: '0.2em', textTransform: 'uppercase' as const,
          color: 'var(--green-bright)', opacity: 0.75, marginBottom: '4px'
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-special-elite)', fontSize: '13px',
          color: 'var(--text-mid)', lineHeight: 1.7
        }}>
          {valor}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed' as const, inset: 0, zIndex: 800,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.08)',
          borderTop: `2px solid ${color}`,
          width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' as const,
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.055)',
          position: 'sticky' as const, top: 0, background: 'var(--bg2)', zIndex: 1
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '26px', color: 'var(--bone)', letterSpacing: '0.06em' }}>
              {pj.nombre_pj}
            </div>
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color, letterSpacing: '0.08em' }}>
              {[pj.faccion_pj, pj.raza_pj, pj.clase_pj].filter(Boolean).join(' · ')}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.055)',
            color: 'var(--text-mid)', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', flexShrink: 0
          }}>×</button>
        </div>

        <div style={{ padding: '24px' }}>
          {fila('Edad', pj.edad_pj)}
          {fila('¿Quién es tu personaje?', pj.pj_who)}
          {fila('Historia / Backstory', pj.historia_pj)}
          {fila('Objetivos y motivaciones', pj.objetivos)}
          {fila('¿Cómo reacciona ante el peligro?', pj.reaccion_peligro)}
          {fila('Comida favorita', pj.comida_favorita)}
          {fila('Apodo que odia', pj.apodo_odiado)}
          {!pj.pj_who && !pj.historia_pj && !pj.objetivos && !pj.reaccion_peligro && (
            <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--text-dim)' }}>
              Este personaje todavía no tiene más detalles rellenados.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function TarjetaPersonaje({ pj, puedeEliminar, onEliminado, minecraftUsername, puedeVerDetalles, esDueno }: {
  pj: Personaje
  puedeEliminar: boolean
  onEliminado: () => void
  minecraftUsername: string | null
  puedeVerDetalles: boolean
  esDueno: boolean
}) {
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [publico, setPublico] = useState(pj.detalles_publicos)
  const [cambiandoVisibilidad, setCambiandoVisibilidad] = useState(false)
  const router = useRouter()

  const color = faccionColorGlobal[pj.faccion_pj ?? ''] ?? 'var(--green-bright)'
  const icono = faccionIconoGlobal[pj.faccion_pj ?? '']
  const avatarUrl = minecraftUsername ? `https://minotar.net/avatar/${minecraftUsername}/56` : null

  async function eliminar() {
    setEliminando(true)
    const res = await fetch(`/api/t3/personaje/${pj.id}`, { method: 'DELETE' })
    setEliminando(false)
    if (res.ok) {
      onEliminado()
    } else {
      setConfirmando(false)
      alert('No se pudo eliminar el personaje.')
    }
  }

  async function toggleVisibilidad(e: React.MouseEvent) {
    e.stopPropagation()
    setCambiandoVisibilidad(true)
    const nuevo = !publico
    const res = await fetch(`/api/t3/personaje/${pj.id}/visibilidad`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detalles_publicos: nuevo }),
    })
    setCambiandoVisibilidad(false)
    if (res.ok) {
      setPublico(nuevo)
      router.refresh()
    }
  }

  function handleClickTarjeta() {
    if (puedeVerDetalles) setMostrarDetalle(true)
  }

  return (
    <>
      <div
        onClick={handleClickTarjeta}
        style={{
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'var(--bg2)',
          borderTop: `3px solid ${color}`,
          padding: '20px', minHeight: '230px',
          position: 'relative' as const,
          display: 'flex', flexDirection: 'column' as const,
          cursor: puedeVerDetalles ? 'pointer' : 'default',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22` }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <div style={{
          position: 'absolute' as const, top: '12px', right: '12px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {!puedeVerDetalles && (
            <span title="Detalles privados" style={{ display: 'flex' }}>
              <svg viewBox="0 0 16 16" fill="none" style={{ width: '13px', height: '13px', opacity: 0.4 }}>
                <rect x="3" y="7" width="10" height="7" rx="1" stroke="var(--bone)" strokeWidth="1.2"/>
                <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="var(--bone)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          <span style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '9px', letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-dim)',
            border: '1px solid rgba(255,255,255,0.055)',
            padding: '2px 6px'
          }}>T3</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '48px', height: '48px', flexShrink: 0,
            border: `1px solid ${color}44`,
            background: `${color}11`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={pj.nombre_pj ?? ''} width={48} height={48} style={{ objectFit: 'cover' }} unoptimized />
            ) : (
              <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', color }}>
                {pj.nombre_pj?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '21px', color: 'var(--bone)',
            letterSpacing: '0.05em', lineHeight: 1.1
          }}>
            {pj.nombre_pj ?? 'Sin nombre'}
          </div>
        </div>

        {pj.faccion_pj && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px', marginBottom: '10px', width: 'fit-content',
            background: `${color}15`, border: `1px solid ${color}44`,
          }}>
            {icono && <Image src={icono} alt={pj.faccion_pj} width={18} height={18} style={{ objectFit: 'contain' }} />}
            <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '15px', color, letterSpacing: '0.06em' }}>
              {pj.faccion_pj}
            </span>
          </div>
        )}

        {(pj.raza_pj || pj.clase_pj) && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '8px' }}>
            {pj.raza_pj && (
              <span style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: 'var(--bone-dim)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px',
              }}>
                {pj.raza_pj}
              </span>
            )}
            {pj.clase_pj && (
              <span style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                color: 'var(--bone-dim)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px',
              }}>
                {pj.clase_pj}
              </span>
            )}
          </div>
        )}

        {pj.status !== 'aprobado' && (
          <div style={{
            marginTop: '4px',
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

        {/* Interruptor de visibilidad — solo el dueño lo ve */}
        {esDueno && (
          <button
            onClick={toggleVisibilidad}
            disabled={cambiandoVisibilidad}
            title={publico ? 'Detalles visibles para cualquiera' : 'Detalles solo para ti y admins'}
            style={{
              marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: publico ? 'var(--green-bright)' : 'var(--text-dim)', width: 'fit-content', padding: 0,
            }}
          >
            <div style={{
              width: '28px', height: '15px', borderRadius: '8px', position: 'relative' as const,
              background: publico ? 'rgba(74,124,63,0.4)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.2s',
            }}>
              <div style={{
                width: '11px', height: '11px', borderRadius: '50%', background: publico ? 'var(--green-bright)' : 'var(--text-dim)',
                position: 'absolute' as const, top: '2px', left: publico ? '15px' : '2px',
                transition: 'left 0.2s',
              }} />
            </div>
            {publico ? 'Público' : 'Privado'}
          </button>
        )}

        {puedeEliminar && (
          <div style={{ position: 'absolute' as const, bottom: '14px', right: '14px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            {confirmando && (
              <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)' }}>
                ¿Seguro?
              </span>
            )}
            {confirmando ? (
              <>
                <button onClick={e => { e.stopPropagation(); setConfirmando(false) }} title="Cancelar" style={{
                  width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', cursor: 'pointer'
                }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: '11px', height: '11px' }}>
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
                <button onClick={e => { e.stopPropagation(); eliminar() }} disabled={eliminando} title="Confirmar" style={{
                  width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--blood)', border: 'none', color: 'var(--bone)', cursor: 'pointer'
                }}>
                  {eliminando ? (
                    <span style={{ fontSize: '10px' }}>...</span>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" style={{ width: '11px', height: '11px' }}>
                      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <button onClick={e => { e.stopPropagation(); setConfirmando(true) }} title="Eliminar personaje" style={{
                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid rgba(155,28,28,0.25)', color: 'var(--blood-bright)',
                cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(155,28,28,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg viewBox="0 0 16 16" fill="none" style={{ width: '13px', height: '13px' }}>
                  <path d="M3 5h10M6.5 5V3.5a1 1 0 011-1h1a1 1 0 011 1V5M4.5 5l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {mostrarDetalle && <DetallePjModal pj={pj} onClose={() => setMostrarDetalle(false)} />}
    </>
  )
}

function TarjetaNuevoPj({ onCreate }: { onCreate: () => void }) {
  return (
    <button onClick={onCreate} style={{
      border: '1px dashed rgba(74,124,63,0.3)', background: 'transparent',
      padding: '20px', minHeight: '220px',
      display: 'flex', flexDirection: 'column' as const,
      alignItems: 'center', justifyContent: 'center',
      gap: '10px', cursor: 'pointer', width: '100%',
      transition: 'border-color 0.2s, background 0.2s'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(74,124,63,0.6)'; e.currentTarget.style.background = 'rgba(74,124,63,0.04)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(74,124,63,0.3)'; e.currentTarget.style.background = 'transparent' }}>
      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '48px', color: 'var(--green-bright)', lineHeight: 1 }}>+</div>
      <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
        Nuevo personaje
      </div>
    </button>
  )
}

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

function FormularioPj({ onClose, onSuccess, esAdmin }: { onClose: () => void, onSuccess: () => void, esAdmin: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_pj: '', edad_pj: '', pj_who: '',
    historia_pj: '', faccion_pj: '', raza_pj: '',
    clase_pj: '', objetivos: '', reaccion_peligro: '',
    comida_favorita: '', apodo_odiado: '',
  })
  const [tipoDueno, setTipoDueno] = useState<'yo_mismo' | 'jugador' | 'sin_dueno' | 'npc'>('yo_mismo')
  const [duenoUsername, setDuenoUsername] = useState('')

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

        {esAdmin && (
          <div style={{
            border: '1px solid rgba(74,124,63,0.25)',
            background: 'rgba(74,124,63,0.04)',
            padding: '14px 16px',
          }}>
            <label style={labelStyle}>¿Para quién es este personaje?</label>
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
          </div>
        )}

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
            {campo('comida_favorita', '¿Tiene alguna comida favorita en este apocalipsis?', 'Latas de atún, carne de zombie...')}
            {campo('apodo_odiado', '¿Tiene algún apodo que odia que le llamen?', 'Ej: "El Pequeño"')}
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

function Modal({ onClose, onSuccess, esAdmin }: { onClose: () => void, onSuccess: () => void, esAdmin: boolean }) {
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
            <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>3ª Edición · Apocalipsis</div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.055)',
            color: 'var(--text-mid)', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', flexShrink: 0
          }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>
          <FormularioPj onClose={onClose} onSuccess={onSuccess} esAdmin={esAdmin} />
        </div>
      </div>
    </div>
  )
}

export default function SecPersonajesPublico({ personajes, esPropio, esAdminVisitante, rol, solicitud, slotsPermitidos, minecraftUsername }: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const router = useRouter()
  const esAdmin = ['admin', 'owner'].includes(rol)
  const aprobado = solicitud?.status === 'aprobado'
  const slotsUsados = personajes.length
  const slotsLibres = Math.max(0, slotsPermitidos - slotsUsados)

  // Quién puede ver los detalles completos de un pj concreto:
  // el dueño del perfil (esPropio), un admin visitante, o si el propio pj está marcado como público
  function calcularAcceso(pj: Personaje) {
    return esPropio || esAdminVisitante || pj.detalles_publicos
  }

  if (!esPropio) {
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: 'var(--bone)', letterSpacing: '0.04em', marginBottom: '16px' }}>
          Personajes
        </h2>
        {personajes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {personajes.map(pj => (
              <TarjetaPersonaje
                key={pj.id} pj={pj}
                puedeEliminar={esAdminVisitante}
                onEliminado={() => router.refresh()}
                minecraftUsername={minecraftUsername}
                puedeVerDetalles={calcularAcceso(pj)}
                esDueno={false}
              />
            ))}
          </div>
        ) : (
          <div style={{ border: '1px solid rgba(255,255,255,0.055)', background: 'var(--bg2)', padding: '32px', textAlign: 'center' as const }}>
            <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--text-dim)' }}>
              Este jugador aún no tiene personajes en la 3ª Edición.
            </p>
          </div>
        )}
      </div>
    )
  }

  if (esAdmin) {
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: 'var(--bone)', letterSpacing: '0.04em', marginBottom: '16px' }}>
          Mis Personajes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {personajes.map(pj => (
            <TarjetaPersonaje
              key={pj.id} pj={pj}
              puedeEliminar={true}
              onEliminado={() => router.refresh()}
              minecraftUsername={minecraftUsername}
              puedeVerDetalles={true}
              esDueno={true}
            />
          ))}
          <TarjetaNuevoPj onCreate={() => setMostrarFormulario(true)} />
        </div>
        {mostrarFormulario && <Modal onClose={() => setMostrarFormulario(false)} onSuccess={() => { setMostrarFormulario(false); router.refresh() }} esAdmin={esAdmin} />}
      </div>
    )
  }

  if (!aprobado) {
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: 'var(--bone)', letterSpacing: '0.04em', marginBottom: '16px' }}>
          Mis Personajes
        </h2>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: 'var(--bone)', letterSpacing: '0.04em' }}>Mis Personajes</h2>
        <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
          <span style={{ color: slotsLibres > 0 ? 'var(--green-bright)' : 'var(--blood-bright)' }}>{slotsUsados}/{slotsPermitidos} slots</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {personajes.map(pj => (
          <TarjetaPersonaje
            key={pj.id} pj={pj}
            puedeEliminar={true}
            onEliminado={() => router.refresh()}
            minecraftUsername={minecraftUsername}
            puedeVerDetalles={true}
            esDueno={true}
          />
        ))}
        {slotsLibres > 0 && <TarjetaNuevoPj onCreate={() => setMostrarFormulario(true)} />}
      </div>
      {mostrarFormulario && <Modal onClose={() => setMostrarFormulario(false)} onSuccess={() => { setMostrarFormulario(false); router.refresh() }} esAdmin={esAdmin} />}
    </div>
  )
}