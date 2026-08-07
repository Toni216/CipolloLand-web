'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Sugerencia {
  id: string
  titulo: string
  descripcion: string
  categoria: string
  estado: string
  editado: boolean
  created_at: Date
  username: string
  votos: number
}

const CATEGORIAS_LABEL: Record<string, string> = {
  web: 'Página web', servidor: 'Servidor', rol_lore: 'Rol/Lore', eventos: 'Eventos', otro: 'Otro',
}

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: 'var(--text-dim)' },
  { value: 'en_progreso', label: 'En progreso', color: '#c9962a' },
  { value: 'hecho', label: 'Hecho', color: 'var(--green-bright)' },
  { value: 'descartado', label: 'Descartado', color: 'var(--blood-bright)' },
]

const selectStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--bone)',
  fontFamily: 'var(--font-barlow-condensed)',
  fontSize: '12px',
  padding: '6px 8px',
}

export default function ListaSugerenciasAdmin({ sugerencias }: { sugerencias: Sugerencia[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function cambiarEstado(id: string, estado: string) {
    setLoadingId(id)
    await fetch(`/api/admin/sugerencias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    setLoadingId(null)
    router.refresh()
  }

  if (sugerencias.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-special-elite)', fontSize: '14px', color: 'var(--text-dim)' }}>
        No hay sugerencias todavía.
      </p>
    )
  }

  return (
    <div>
      {sugerencias.map(s => {
        const estadoInfo = ESTADOS.find(e => e.value === s.estado) ?? ESTADOS[0]
        return (
          <div key={s.id} style={{
            border: '1px solid rgba(255,255,255,0.055)', background: 'var(--bg2)',
            padding: '20px 24px', marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: estadoInfo.color, border: `1px solid ${estadoInfo.color}66`,
                    padding: '2px 8px',
                  }}>
                    {estadoInfo.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '20px', color: 'var(--bone-dim)', letterSpacing: '0.05em' }}>
                    {s.titulo}
                  </span>
                  <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--green-bright)' }}>
                    ▲ {s.votos}
                  </span>
                  {s.editado && (
                    <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      (editado)
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  {CATEGORIAS_LABEL[s.categoria] ?? 'Otro'} · Por {s.username} · {new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <select
                style={selectStyle}
                value={s.estado}
                disabled={loadingId === s.id}
                onChange={e => cambiarEstado(s.id, e.target.value)}
              >
                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>

            <p style={{
              fontFamily: 'var(--font-special-elite)', fontSize: '13px',
              color: 'var(--text-mid)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
            }}>
              {s.descripcion}
            </p>
          </div>
        )
      })}
    </div>
  )
}