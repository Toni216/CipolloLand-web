'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Badge {
  user_badge_id: string
  badge_id: string
  nombre: string
  color: string | null
}

interface Usuario {
  id: string
  username: string
  email: string | null
  rol: string
  minecraft_username: string | null
  deleted_at: Date | null
  created_at: Date
  slots_permitidos: number | null
  badges: Badge[]
}

interface BadgeDisponible {
  id: string
  nombre: string
  color: string | null
}

interface Props {
  usuarios: Usuario[]
  badgesDisponibles: BadgeDisponible[]
  miId: string
  miRol: string
}

const ROLES = ['user', 'moderador', 'admin', 'owner']

const botonStyle = (color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '11px', letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color, background: 'transparent',
  border: `1px solid ${color}66`,
  padding: '5px 12px',
  cursor: 'pointer',
})

const selectStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--bone)',
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '12px',
  padding: '6px 8px',
}

const colorRol = (rol: string) => {
  if (rol === 'owner') return 'var(--blood-bright)'
  if (rol === 'admin') return 'var(--green-bright)'
  if (rol === 'moderador') return '#c9962a'
  return 'var(--text-mid)'
}

function TarjetaUsuario({
  u, badgesDisponibles, miId, miRol, onRefresh,
}: {
  u: Usuario
  badgesDisponibles: BadgeDisponible[]
  miId: string
  miRol: string
  onRefresh: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slots, setSlots] = useState(u.slots_permitidos ?? 1)
  const [badgeSeleccionada, setBadgeSeleccionada] = useState('')
  const [passwordGenerada, setPasswordGenerada] = useState<string | null>(null)
  const [confirmandoBaneo, setConfirmandoBaneo] = useState(false)

  const esYoMismo = u.id === miId
  const soyOwner = miRol === 'owner'

  async function patch(body: Record<string, unknown>) {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/usuarios/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al actualizar.')
      return false
    }
    onRefresh()
    return true
  }

  async function cambiarRol(nuevoRol: string) {
    await patch({ rol: nuevoRol })
  }

  async function guardarSlots() {
    await patch({ slots_permitidos: slots })
  }

  async function toggleBaneo() {
    if (!u.deleted_at) {
      setConfirmandoBaneo(true)
      return
    }
    await patch({ baneado: false })
  }

  async function confirmarBaneo() {
    setConfirmandoBaneo(false)
    await patch({ baneado: true })
  }

  async function agregarBadge() {
    if (!badgeSeleccionada) return
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/usuarios/${u.id}/badges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge_id: badgeSeleccionada }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Error al conceder la insignia.')
      return
    }
    setBadgeSeleccionada('')
    onRefresh()
  }

  async function quitarBadge(userBadgeId: string) {
    setLoading(true)
    await fetch(`/api/admin/usuarios/${u.id}/badges`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_badge_id: userBadgeId }),
    })
    setLoading(false)
    onRefresh()
  }

  async function resetearPassword() {
    if (!confirm(`¿Generar una contraseña nueva para "${u.username}"? La actual dejará de funcionar.`)) return
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/admin/usuarios/${u.id}/reset-password`, { method: 'POST' })
    const data = await res.json().catch(() => null)
    setLoading(false)
    if (!res.ok) {
      setError(data?.error ?? 'Error al resetear la contraseña.')
      return
    }
    setPasswordGenerada(data.password)
  }

  const badgesLibres = badgesDisponibles.filter(
    b => !u.badges.some(ub => ub.badge_id === b.id)
  )

  return (
    <div style={{
      border: `1px solid ${u.deleted_at ? 'rgba(155,28,28,0.3)' : 'rgba(255,255,255,0.055)'}`,
      background: u.deleted_at ? 'rgba(155,28,28,0.03)' : 'var(--bg2)',
      padding: '20px 24px', marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Link href={`/perfil/${u.username}`} target="_blank" style={{
              fontFamily: 'var(--font-bebas)', fontSize: '22px',
              color: 'var(--bone-dim)', letterSpacing: '0.05em',
              textDecoration: 'none', borderBottom: '1px dashed rgba(255,255,255,0.25)',
            }}>
              {u.username} ↗
            </Link>
            <span style={{
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: colorRol(u.rol), border: `1px solid ${colorRol(u.rol)}66`,
              padding: '2px 8px',
            }}>
              {u.rol}
            </span>
            {u.deleted_at && (
              <span style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--blood-bright)', border: '1px solid rgba(155,28,28,0.4)',
                padding: '2px 8px',
              }}>
                Baneado
              </span>
            )}
          </div>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
            color: 'var(--text-dim)', letterSpacing: '0.05em',
          }}>
            {u.email ?? 'sin email'} {u.minecraft_username && `· MC: ${u.minecraft_username}`}
          </div>
        </div>

        {/* Cambio de rol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Rol
          </label>
          <select
            style={selectStyle}
            value={u.rol}
            disabled={loading || esYoMismo || (u.rol === 'owner' && !soyOwner)}
            onChange={e => cambiarRol(e.target.value)}
          >
            {ROLES.map(r => (
              <option key={r} value={r} disabled={r === 'owner' && !soyOwner}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Slots de personajes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <label style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Personajes permitidos
        </label>
        {u.slots_permitidos === null ? (
          <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12px', color: 'var(--text-dim)' }}>
            (sin solicitud aprobada en T3)
          </span>
        ) : (
          <>
            <input
              type="number" min={1} max={20}
              value={slots}
              onChange={e => setSlots(parseInt(e.target.value) || 1)}
              style={{ ...selectStyle, width: '60px' }}
            />
            <button onClick={guardarSlots} disabled={loading || slots === u.slots_permitidos} style={botonStyle('var(--green-bright)')}>
              Guardar
            </button>
          </>
        )}
      </div>

      {/* Badges */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
          Insignias
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {u.badges.length === 0 && (
            <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '12px', color: 'var(--text-dim)' }}>
              Ninguna todavía.
            </span>
          )}
          {u.badges.map(b => (
            <span key={b.user_badge_id} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
              color: b.color ?? 'var(--bone)',
              border: `1px solid ${b.color ?? 'rgba(255,255,255,0.2)'}66`,
              padding: '3px 8px 3px 10px',
            }}>
              {b.nombre}
              <button
                onClick={() => quitarBadge(b.user_badge_id)}
                disabled={loading}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0 }}
                title="Quitar insignia"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {badgesLibres.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <select style={selectStyle} value={badgeSeleccionada} onChange={e => setBadgeSeleccionada(e.target.value)}>
              <option value="">Añadir insignia…</option>
              {badgesLibres.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
            <button onClick={agregarBadge} disabled={loading || !badgeSeleccionada} style={botonStyle('var(--green-bright)')}>
              Conceder
            </button>
          </div>
        )}
      </div>

      {passwordGenerada && (
        <div style={{
          border: '1px solid rgba(74,124,63,0.4)', background: 'rgba(74,124,63,0.06)',
          padding: '10px 14px', marginBottom: '12px',
          fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--bone)',
        }}>
          Nueva contraseña (cópiala ahora, no se volverá a mostrar): <strong>{passwordGenerada}</strong>
        </div>
      )}

      {confirmandoBaneo && (
        <div style={{
          border: '1px solid rgba(155,28,28,0.4)', background: 'rgba(155,28,28,0.06)',
          padding: '12px 14px', marginBottom: '12px',
        }}>
          <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '13px', color: 'var(--bone)', marginBottom: '10px' }}>
            ¿Seguro que quieres banear a "{u.username}"? No podrá iniciar sesión hasta que lo desbanees.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={confirmarBaneo} style={botonStyle('var(--blood-bright)')}>Sí, banear</button>
            <button onClick={() => setConfirmandoBaneo(false)} style={botonStyle('var(--text-dim)')}>Cancelar</button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--blood-bright)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={resetearPassword} disabled={loading} style={botonStyle('var(--text-mid)')}>
          Resetear contraseña
        </button>
        <button onClick={toggleBaneo} disabled={loading || esYoMismo} style={botonStyle(u.deleted_at ? 'var(--green-bright)' : 'var(--blood-bright)')}>
          {u.deleted_at ? 'Desbanear' : 'Banear'}
        </button>
      </div>
    </div>
  )
}

export default function ListaUsuarios({ usuarios, badgesDisponibles, miId, miRol }: Props) {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const refresh = () => router.refresh()

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      const coincideTexto = busqueda.trim() === '' ||
        u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(busqueda.toLowerCase())
      const coincideRol = filtroRol === '' || u.rol === filtroRol
      return coincideTexto && coincideRol
    })
  }, [usuarios, busqueda, filtroRol])

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          placeholder="Buscar por username o email…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            flex: '1 1 260px',
            background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--bone)', padding: '10px 14px',
            fontFamily: 'var(--font-special-elite)', fontSize: '13px',
          }}
        />
        <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} style={selectStyle}>
          <option value="">Todos los roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '14px', color: 'var(--text-dim)' }}>
          No hay usuarios que coincidan con la búsqueda.
        </p>
      ) : (
        filtrados.map(u => (
          <TarjetaUsuario
            key={u.id}
            u={u}
            badgesDisponibles={badgesDisponibles}
            miId={miId}
            miRol={miRol}
            onRefresh={refresh}
          />
        ))
      )}
    </div>
  )
}