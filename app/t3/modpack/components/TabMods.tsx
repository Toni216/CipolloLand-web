'use client'

import { useState, useMemo } from 'react'
import { siModrinth, siCurseforge, siGithub } from 'simple-icons'

interface Mod {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string[] | null
  icono_url: string | null
  modrinth_url: string | null
  curseforge_url: string | null
  github_url: string | null
}

interface Props {
  estaAutorizado: boolean
  esAdmin: boolean
  mods: Mod[]
}

const CATEGORIAS = [
  'Todos', 'Almacenamiento', 'Aventura', 'Comida', 'Criaturas',
  'Curiosidades', 'Decoración', 'Economía', 'Equipamiento',
  'Generación de mundo', 'Gestión', 'Librería', 'Magia',
  'Mecánicas de juego', 'Minijuego', 'Optimización', 'Social',
  'Tecnología', 'Transporte', 'Utilidad'
]

const inputStyle = {
  width: '100%', background: 'var(--bg)',
  border: '1px solid rgba(255,255,255,0.055)', color: 'var(--bone)',
  fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px',
  padding: '10px 12px', outline: 'none',
}

function EnlaceIcono({ href, tipo }: { href: string, tipo: 'modrinth' | 'curseforge' | 'github' }) {
  const iconos = {
    modrinth: siModrinth,
    curseforge: siCurseforge,
    github: siGithub,
  }
  const icon = iconos[tipo]
  const color = `#${icon.hex}`

  return (
    
      <a href={href} target="_blank" rel="noopener noreferrer"
      title={icon.title}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '26px', height: '26px', flexShrink: 0,
        background: `${color}15`, border: `1px solid ${color}33`,
        transition: 'transform 0.15s'
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <svg viewBox="0 0 24 24" fill={color} style={{ width: '14px', height: '14px' }}>
        <path d={icon.path} />
      </svg>
    </a>
  )
}

export default function TabMods({ estaAutorizado, esAdmin, mods }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [editando, setEditando] = useState<Mod | null>(null)
  const [guardando, setGuardando] = useState(false)

  const categoriasConMods = useMemo(() => {
    const presentes = new Set<string>()
    mods.forEach(m => m.categoria?.forEach(c => presentes.add(c)))
    return CATEGORIAS.filter(cat => cat === 'Todos' || presentes.has(cat))
  }, [mods])

  const modsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return mods.filter(m => {
      const matchCategoria = categoria === 'Todos' || (m.categoria?.includes(categoria) ?? false)
      const matchBusqueda =
        q === '' ||
        m.nombre.toLowerCase().includes(q) ||
        (m.descripcion?.toLowerCase().includes(q) ?? false)
      return matchCategoria && matchBusqueda
    })
  }, [mods, busqueda, categoria])

  async function guardarEdicion() {
    if (!editando) return
    setGuardando(true)
    await fetch(`/api/t3/modpack/mods/${editando.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: editando.nombre,
        descripcion: editando.descripcion,
        categoria: editando.categoria,
        modrinth_url: editando.modrinth_url,
        curseforge_url: editando.curseforge_url,
        github_url: editando.github_url,
      }),
    })
    setGuardando(false)
    setEditando(null)
    window.location.reload()
  }

  function toggleCategoriaEdit(cat: string) {
    if (!editando) return
    const actuales = editando.categoria ?? []
    const nuevas = actuales.includes(cat)
      ? actuales.filter(c => c !== cat)
      : [...actuales, cat]
    setEditando({ ...editando, categoria: nuevas })
  }

  if (!estaAutorizado) {
    return (
      <div style={{
        padding: '80px 48px',
        display: 'flex', flexDirection: 'column' as const,
        alignItems: 'center', justifyContent: 'center',
        gap: '16px', textAlign: 'center'
      }}>
        <svg viewBox="0 0 20 20" fill="none" style={{ width: '32px', height: '32px', opacity: 0.3 }}>
          <rect x="4" y="9" width="12" height="9" rx="1" stroke="var(--bone)" strokeWidth="1.3"/>
          <path d="M7 9V6a3 3 0 016 0v3" stroke="var(--bone)" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <div style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: '28px', color: 'var(--bone-dim)',
          letterSpacing: '0.06em'
        }}>
          Contenido bloqueado
        </div>
        <p style={{
          fontFamily: 'var(--font-special-elite)',
          fontSize: '13px', color: 'var(--text-dim)',
          maxWidth: '360px', lineHeight: 1.8
        }}>
          La lista de mods solo está disponible para jugadores aprobados de la edición.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 40px' }}>

      {/* Toolbar: búsqueda + filtros + contador */}
      <div style={{
        display: 'flex', gap: '16px', flexWrap: 'wrap' as const,
        alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '28px'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar mod..."
            style={{
              width: '100%', background: 'var(--bg2)',
              border: '1px solid rgba(255,255,255,0.055)', color: 'var(--bone)',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px', letterSpacing: '0.04em',
              padding: '10px 36px 10px 14px', outline: 'none',
            }}
          />
          <svg viewBox="0 0 16 16" fill="none" style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            width: '14px', height: '14px', color: 'var(--text-dim)', pointerEvents: 'none'
          }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
          {categoriasConMods.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '11px', letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                padding: '7px 14px',
                background: categoria === cat ? 'rgba(74,124,63,0.1)' : 'transparent',
                border: categoria === cat ? '1px solid var(--green-bright)' : '1px solid rgba(255,255,255,0.055)',
                color: categoria === cat ? 'var(--green-bright)' : 'var(--text-mid)',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <span style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', color: 'var(--text-dim)',
          letterSpacing: '0.1em', whiteSpace: 'nowrap' as const
        }}>
          {modsFiltrados.length} {modsFiltrados.length === 1 ? 'mod' : 'mods'}
        </span>
      </div>

      {/* Grid de mods */}
      {modsFiltrados.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center' as const,
          fontFamily: 'var(--font-special-elite)',
          fontSize: '13px', color: 'var(--text-dim)'
        }}>
          No se encontraron mods con ese criterio.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '14px'
        }}>
          {modsFiltrados.map(mod => (
            <div
              key={mod.id}
              style={{
                background: 'var(--bg2)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '3px solid rgba(74,124,63,0.4)',
                padding: '20px',
                display: 'flex', flexDirection: 'column' as const, gap: '12px',
                transition: 'border-color 0.2s, background 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderLeftColor = 'var(--green-bright)'
                e.currentTarget.style.background = 'rgba(74,124,63,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderLeftColor = 'rgba(74,124,63,0.4)'
                e.currentTarget.style.background = 'var(--bg2)'
              }}
            >
              {/* Cabecera: icono + nombre */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {mod.icono_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mod.icono_url} alt={mod.nombre} width={44} height={44} style={{ objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '20px', opacity: 0.4 }}>📦</span>
                  )}
                </div>
                <div style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '18px', color: 'var(--bone)',
                  letterSpacing: '0.03em', lineHeight: 1.1
                }}>
                  {mod.nombre}
                </div>
              </div>

              {/* Descripción */}
              {mod.descripcion && (
                <p style={{
                  fontFamily: 'var(--font-special-elite)',
                  fontSize: '11.5px', color: 'var(--text-mid)',
                  lineHeight: 1.6, margin: 0
                }}>
                  {mod.descripcion}
                </p>
              )}

              {/* Etiquetas de categoría (varias) */}
              {mod.categoria && mod.categoria.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                  {mod.categoria.map(cat => (
                    <span key={cat} style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '9px', letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--green-bright)', opacity: 0.8,
                      border: '1px solid rgba(74,124,63,0.3)',
                      background: 'rgba(74,124,63,0.06)',
                      padding: '2px 8px'
                    }}>
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer: enlaces + editar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '4px', marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {mod.modrinth_url && <EnlaceIcono href={mod.modrinth_url} tipo="modrinth" />}
                  {mod.curseforge_url && <EnlaceIcono href={mod.curseforge_url} tipo="curseforge" />}
                  {mod.github_url && <EnlaceIcono href={mod.github_url} tipo="github" />}
                </div>

                {esAdmin && (
                  <button
                    onClick={() => setEditando(mod)}
                    style={{
                      fontFamily: 'var(--font-barlow-condensed)',
                      fontSize: '10px', letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      padding: '4px 10px', cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-dim)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editando && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', overflowY: 'auto' as const
        }}>
          <div style={{
            background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px', width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column' as const, gap: '14px'
          }}>
            <div style={{
              fontFamily: 'var(--font-bebas)', fontSize: '22px',
              color: 'var(--bone)', letterSpacing: '0.04em'
            }}>
              Editar mod
            </div>

            <input
              value={editando.nombre}
              onChange={e => setEditando({ ...editando, nombre: e.target.value })}
              placeholder="Nombre"
              style={inputStyle}
            />
            <textarea
              value={editando.descripcion ?? ''}
              onChange={e => setEditando({ ...editando, descripcion: e.target.value })}
              placeholder="Descripción"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />

            {/* Selector múltiple de categorías */}
            <div>
              <div style={{
                fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
                letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                color: 'var(--text-dim)', marginBottom: '6px'
              }}>
                Categorías (puedes elegir varias)
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                {CATEGORIAS.filter(c => c !== 'Todos').map(cat => {
                  const activa = editando.categoria?.includes(cat) ?? false
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoriaEdit(cat)}
                      style={{
                        fontFamily: 'var(--font-barlow-condensed)',
                        fontSize: '10px', letterSpacing: '0.08em',
                        padding: '5px 10px', cursor: 'pointer',
                        background: activa ? 'rgba(74,124,63,0.15)' : 'transparent',
                        border: activa ? '1px solid var(--green-bright)' : '1px solid rgba(255,255,255,0.1)',
                        color: activa ? 'var(--green-bright)' : 'var(--text-dim)',
                      }}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            <input
              value={editando.modrinth_url ?? ''}
              onChange={e => setEditando({ ...editando, modrinth_url: e.target.value })}
              placeholder="URL de Modrinth"
              style={inputStyle}
            />
            <input
              value={editando.curseforge_url ?? ''}
              onChange={e => setEditando({ ...editando, curseforge_url: e.target.value })}
              placeholder="URL de CurseForge"
              style={inputStyle}
            />
            <input
              value={editando.github_url ?? ''}
              onChange={e => setEditando({ ...editando, github_url: e.target.value })}
              placeholder="URL de GitHub"
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                disabled={guardando}
                onClick={guardarEdicion}
                style={{
                  flex: 1, padding: '10px', cursor: 'pointer',
                  background: 'var(--green)', color: 'var(--bone)', border: 'none',
                  fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px', letterSpacing: '0.08em'
                }}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditando(null)}
                style={{
                  padding: '10px 16px', cursor: 'pointer',
                  background: 'transparent', color: 'var(--text-dim)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'var(--font-barlow-condensed)', fontSize: '13px'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}