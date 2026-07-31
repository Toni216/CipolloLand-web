'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ModalCrearPersonaje from '@/app/perfil/[username]/components/ModalCrearPersonaje'

interface Solicitud {
  id: string
  user_id: string | null
  username: string | null
  email: string | null
  status: string
  tipo_solicitud: string
  motivacion: string | null
  how_found: string | null
  recomendado_por: string | null
  is_adult: boolean | null
  motivo_rechazo: string | null
  slots_permitidos: number
  created_at: Date
  revisado_en: Date | null
}

interface Props {
  solicitudes: Solicitud[]
}

function BadgeStatus({ status }: { status: string }) {
  const config = {
    pendiente: { color: '#c9962a', border: 'rgba(201,150,42,0.3)', bg: 'rgba(201,150,42,0.06)' },
    aprobado:  { color: 'var(--green-bright)', border: 'rgba(74,124,63,0.3)', bg: 'rgba(74,124,63,0.06)' },
    rechazado: { color: 'var(--blood-bright)', border: 'rgba(155,28,28,0.3)', bg: 'rgba(155,28,28,0.06)' },
  }[status] ?? { color: 'var(--text-dim)', border: 'rgba(255,255,255,0.1)', bg: 'transparent' }

  return (
    <span style={{
      fontFamily: 'var(--font-barlow-condensed)',
      fontSize: '10px', letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      padding: '3px 8px',
      color: config.color,
      border: `1px solid ${config.border}`,
      background: config.bg
    }}>
      {status}
    </span>
  )
}

function TarjetaSolicitud({ s, onRefresh }: { s: Solicitud, onRefresh: () => void }) {
  const [expandida, setExpandida] = useState(false)
  const [loading, setLoading] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [slots, setSlots] = useState(1)
  const [mostrarRechazo, setMostrarRechazo] = useState(false)
  const [mostrarAprobacion, setMostrarAprobacion] = useState(false)
  const [mostrarCrearPj, setMostrarCrearPj] = useState(false)
  const [mostrarAsignarPj, setMostrarAsignarPj] = useState(false)
  const [personajesSinDueno, setPersonajesSinDueno] = useState<Array<{ id: string, nombre_pj: string | null, faccion_pj: string | null }>>([])
  const [asignando, setAsignando] = useState(false)

  async function aprobar() {
    setLoading(true)
    await fetch('/api/admin/solicitudes/aprobar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solicitudId: s.id,
        userId: s.user_id,
        slots,
      })
    })
    setLoading(false)
    onRefresh()
  }

  async function rechazar() {
    setLoading(true)
    await fetch('/api/admin/solicitudes/rechazar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        solicitudId: s.id,
        motivoRechazo
      })
    })
    setLoading(false)
    onRefresh()
  }

  async function abrirAsignar() {
    const res = await fetch('/api/t3/personaje/sin-dueno')
    const data = await res.json()
    setPersonajesSinDueno(data.personajes ?? [])
    setMostrarAsignarPj(true)
  }

  async function asignarPersonaje(personajeId: string) {
    setAsignando(true)
    await fetch(`/api/t3/personaje/${personajeId}/asignar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: s.username }),
    })
    setAsignando(false)
    setMostrarAsignarPj(false)
    onRefresh()
  }

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid rgba(255,255,255,0.055)',
    color: 'var(--bone)',
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '13px', padding: '8px 12px',
    outline: 'none', width: '100%'
  }

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.055)',
      background: 'var(--bg2)',
      borderLeft: s.status === 'pendiente' ? '3px solid #c9962a' : 
                  s.status === 'aprobado'  ? '3px solid var(--green)' : 
                  '3px solid var(--blood)',
    }}>
      {/* Cabecera de la tarjeta */}
      <div
        onClick={() => setExpandida(!expandida)}
        style={{
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '16px',
          cursor: 'pointer'
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '36px', height: '36px', flexShrink: 0,
          border: '1px solid rgba(74,124,63,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(74,124,63,0.06)',
          fontFamily: 'var(--font-bebas)', fontSize: '18px',
          color: 'var(--green-bright)'
        }}>
          {s.username?.[0]?.toUpperCase() ?? '?'}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <span style={{
              fontFamily: 'var(--font-bebas)', fontSize: '18px',
              color: 'var(--bone)', letterSpacing: '0.06em'
            }}>
              {s.username ?? 'Usuario desconocido'}
            </span>
            <BadgeStatus status={s.status} />
            {s.is_adult && (
              <span style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                color: 'var(--green-bright)', opacity: 0.6,
                border: '1px solid rgba(74,124,63,0.2)',
                padding: '2px 6px'
              }}>+18</span>
            )}
          </div>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', color: 'var(--text-dim)',
            letterSpacing: '0.06em'
          }}>
            {s.email} · {new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Flecha */}
        <svg viewBox="0 0 12 12" fill="none" style={{
          width: '10px', height: '10px', flexShrink: 0,
          transition: 'transform 0.2s',
          transform: expandida ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          <path d="M2 4l4 4 4-4" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Contenido expandido */}
      {expandida && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.055)',
          padding: '20px'
        }}>
          {/* Datos de la solicitud */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '16px', marginBottom: '20px'
          }}>
            {[
              { label: 'Motivación',     val: s.motivacion },
              { label: 'Cómo nos encontró', val: s.how_found },
              { label: 'Recomendado por', val: s.recomendado_por },
              { label: 'Tipo',            val: s.tipo_solicitud },
            ].map(item => item.val && (
              <div key={item.label}>
                <div style={{
                  fontFamily: 'var(--font-barlow-condensed)',
                  fontSize: '9px', color: 'var(--text-dim)',
                  letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                  marginBottom: '4px'
                }}>{item.label}</div>
                <div style={{
                  fontFamily: 'var(--font-barlow-condensed)',
                  fontSize: '13px', color: 'var(--bone-dim)',
                  letterSpacing: '0.04em', lineHeight: 1.5
                }}>{item.val}</div>
              </div>
            ))}
          </div>

          {/* Motivo de rechazo si existe */}
          {s.motivo_rechazo && (
            <div style={{
              border: '1px solid rgba(155,28,28,0.2)',
              background: 'rgba(155,28,28,0.04)',
              padding: '12px 16px', marginBottom: '16px'
            }}>
              <div style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '11px', color: 'var(--blood-bright)',
                letterSpacing: '0.06em'
              }}>
                Motivo de rechazo: {s.motivo_rechazo}
              </div>
            </div>
          )}

          {s.status === 'aprobado' && (
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <button onClick={() => setMostrarCrearPj(true)} style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '11px', letterSpacing: '0.15em',
                textTransform: 'uppercase' as const, fontWeight: 600,
                padding: '8px 20px', cursor: 'pointer',
                background: 'transparent', color: 'var(--green-bright)',
                border: '1px solid rgba(74,124,63,0.4)'
              }}>
                + Crear personaje para {s.username}
              </button>
              <button onClick={abrirAsignar} style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '11px', letterSpacing: '0.15em',
                textTransform: 'uppercase' as const, fontWeight: 600,
                padding: '8px 20px', cursor: 'pointer',
                background: 'transparent', color: '#c9962a',
                border: '1px solid rgba(201,150,42,0.4)'
              }}>
                Asignar personaje existente
              </button>
            </div>
          )}

          {mostrarAsignarPj && (
            <div style={{
              border: '1px solid rgba(201,150,42,0.2)',
              background: 'rgba(201,150,42,0.04)',
              padding: '16px', marginBottom: '16px'
            }}>
              <div style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
                letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                color: '#c9962a', marginBottom: '12px', fontWeight: 600
              }}>
                Elige un personaje sin dueño para {s.username}
              </div>

              {personajesSinDueno.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px', color: 'var(--text-dim)' }}>
                  No hay personajes sin dueño ahora mismo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', marginBottom: '10px' }}>
                  {personajesSinDueno.map(pj => (
                    <button
                      key={pj.id}
                      onClick={() => asignarPersonaje(pj.id)}
                      disabled={asignando}
                      style={{
                        textAlign: 'left' as const,
                        fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px',
                        padding: '10px 14px', cursor: 'pointer',
                        background: 'var(--bg)', color: 'var(--bone-dim)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {pj.nombre_pj ?? 'Sin nombre'} {pj.faccion_pj && `· ${pj.faccion_pj}`}
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => setMostrarAsignarPj(false)} style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
                padding: '6px 14px', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-dim)',
                border: '1px solid rgba(255,255,255,0.055)'
              }}>
                Cancelar
              </button>
            </div>
          )}

          {mostrarCrearPj && s.username && (
            <ModalCrearPersonaje
              onClose={() => setMostrarCrearPj(false)}
              onSuccess={() => { setMostrarCrearPj(false); onRefresh() }}
              esAdmin={true}
              duenoFijo={s.username}
            />
          )}

          {/* Acciones (solo si está pendiente) */}
          {s.status === 'pendiente' && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>

              {/* Panel de aprobación */}
              {mostrarAprobacion && (
                <div style={{
                  border: '1px solid rgba(74,124,63,0.2)',
                  background: 'rgba(74,124,63,0.04)',
                  padding: '16px'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontSize: '10px', letterSpacing: '0.2em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--green-bright)', marginBottom: '12px', fontWeight: 600
                  }}>
                    Aprobar solicitud
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '160px', gap: '8px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>
                        Slots
                      </div>
                      <input
                        type="number"
                        min={1} max={10}
                        style={inputStyle}
                        value={slots}
                        onChange={e => setSlots(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={aprobar} disabled={loading} style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '11px', letterSpacing: '0.15em',
                      textTransform: 'uppercase' as const, fontWeight: 600,
                      padding: '8px 20px', cursor: 'pointer',
                      background: 'var(--green)', color: 'var(--bone)',
                      border: 'none'
                    }}>
                      {loading ? '...' : '✓ Confirmar aprobación'}
                    </button>
                    <button onClick={() => setMostrarAprobacion(false)} style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '11px', letterSpacing: '0.15em',
                      textTransform: 'uppercase' as const,
                      padding: '8px 16px', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-dim)',
                      border: '1px solid rgba(255,255,255,0.055)'
                    }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Panel de rechazo */}
              {mostrarRechazo && (
                <div style={{
                  border: '1px solid rgba(155,28,28,0.2)',
                  background: 'rgba(155,28,28,0.04)',
                  padding: '16px'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontSize: '10px', letterSpacing: '0.2em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--blood-bright)', marginBottom: '12px', fontWeight: 600
                  }}>
                    Rechazar solicitud
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: '4px' }}>
                      Motivo (opcional)
                    </div>
                    <input
                      style={inputStyle}
                      value={motivoRechazo}
                      onChange={e => setMotivoRechazo(e.target.value)}
                      placeholder="Explica el motivo al usuario..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={rechazar} disabled={loading} style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '11px', letterSpacing: '0.15em',
                      textTransform: 'uppercase' as const, fontWeight: 600,
                      padding: '8px 20px', cursor: 'pointer',
                      background: 'var(--blood)', color: 'var(--bone)',
                      border: 'none'
                    }}>
                      {loading ? '...' : '✗ Confirmar rechazo'}
                    </button>
                    <button onClick={() => setMostrarRechazo(false)} style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '11px', letterSpacing: '0.15em',
                      textTransform: 'uppercase' as const,
                      padding: '8px 16px', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-dim)',
                      border: '1px solid rgba(255,255,255,0.055)'
                    }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Botones principales */}
              {!mostrarAprobacion && !mostrarRechazo && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setMostrarAprobacion(true)} style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontSize: '11px', letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const, fontWeight: 600,
                    padding: '8px 20px', cursor: 'pointer',
                    background: 'transparent', color: 'var(--green-bright)',
                    border: '1px solid rgba(74,124,63,0.4)'
                  }}>
                    ✓ Aprobar
                  </button>
                  <button onClick={() => setMostrarRechazo(true)} style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontSize: '11px', letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const, fontWeight: 600,
                    padding: '8px 20px', cursor: 'pointer',
                    background: 'transparent', color: 'var(--blood-bright)',
                    border: '1px solid rgba(155,28,28,0.4)'
                  }}>
                    ✗ Rechazar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ListaSolicitudes({ solicitudes }: Props) {
  const router = useRouter()

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px' }}>
      {solicitudes.length === 0 ? (
        <div style={{
          border: '1px solid rgba(255,255,255,0.055)',
          background: 'var(--bg2)', padding: '48px',
          textAlign: 'center' as const
        }}>
          <div style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '13px', color: 'var(--text-dim)'
          }}>
            No hay solicitudes todavía.
          </div>
        </div>
      ) : (
        solicitudes.map(s => (
          <TarjetaSolicitud
            key={s.id}
            s={s}
            onRefresh={() => router.refresh()}
          />
        ))
      )}
    </div>
  )
}