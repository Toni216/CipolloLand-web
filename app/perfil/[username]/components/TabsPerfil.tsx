'use client'

import { useState, useEffect } from 'react'
import SecPersonajesPublico from './SecPersonajesPublico'

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

interface Badge {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color: string | null
  granted_at: Date
  destacada: boolean
}

interface Props {
  username: string
  personajes: Personaje[]
  badges: Badge[]
  esPropio: boolean
  esAdminVisitante: boolean
  rol: string
  solicitud: { status: string; motivo_rechazo: string | null; created_at: Date; slots_permitidos: number } | null
  slotsPermitidos: number
  minecraftUsername: string | null
}

const TABS = [
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'personajes', label: 'Personajes' },
  { id: 'logros', label: 'Logros' },
  { id: 'actividad', label: 'Actividad' },
]

function TabPlaceholder({ titulo }: { titulo: string }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.055)', background: 'var(--bg2)', padding: '48px', textAlign: 'center' as const }}>
      <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' }}>
        {titulo} · Próximamente
      </div>
    </div>
  )
}

interface StatsData {
  horas_jugadas: string
  kills: string
  muertes: string
  bloques_colocados: string
  bloques_rotos: string
  distancia_recorrida_km: string
}

interface StatsPorTemporada extends StatsData {
  slug: string
}

const STATS_VACIAS: StatsData = {
  horas_jugadas: '0', kills: '0', muertes: '0',
  bloques_colocados: '0', bloques_rotos: '0', distancia_recorrida_km: '0',
}

const CAMPOS: Array<{ key: keyof StatsData, label: string, decimales?: number, sufijo?: string }> = [
  { key: 'horas_jugadas', label: 'Horas jugadas', decimales: 1 },
  { key: 'kills', label: 'Kills' },
  { key: 'muertes', label: 'Muertes' },
  { key: 'bloques_colocados', label: 'Bloques colocados' },
  { key: 'bloques_rotos', label: 'Bloques rotos' },
  { key: 'distancia_recorrida_km', label: 'Distancia recorrida', decimales: 1, sufijo: ' km' },
]

const FILTROS = [
  { id: 'global', label: 'Todo' },
  { id: 't1', label: 'E1' },
  { id: 't2', label: 'E2' },
  { id: 't3', label: 'E3' },
  { id: 'record', label: 'Récord' },
]

function formatear(v: string | undefined, decimales = 0) {
  if (!v) return '0'
  const n = parseFloat(v)
  return decimales > 0 ? n.toFixed(decimales) : Math.round(n).toLocaleString('es-ES')
}

// Para el filtro "Récord": de todas las ediciones, cuál tiene el valor más alto
// en esta categoría concreta, y cuánto es ese valor.
function calcularRecord(porTemporada: StatsPorTemporada[], campo: keyof StatsData): { valor: number, slug: string } | null {
  let mejor: { valor: number, slug: string } | null = null
  for (const fila of porTemporada) {
    const valor = parseFloat(fila[campo] ?? '0')
    if (valor > 0 && (!mejor || valor > mejor.valor)) {
      mejor = { valor, slug: fila.slug }
    }
  }
  return mejor
}

function StatCard({ valor, label, sufijo, subtitulo }: { valor: string, label: string, sufijo?: string, subtitulo?: string }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)',
      padding: '20px', textAlign: 'center' as const,
    }}>
      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '32px', color: 'var(--bone)', letterSpacing: '0.04em' }}>
        {valor}{sufijo ?? ''}
      </div>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
        letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginTop: '4px'
      }}>
        {label}
      </div>
      {subtitulo && (
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '10px',
          color: 'var(--green-bright)', letterSpacing: '0.08em', marginTop: '8px'
        }}>
          {subtitulo}
        </div>
      )}
    </div>
  )
}

function TabEstadisticas({ username }: { username: string }) {
  const [filtro, setFiltro] = useState('global')
  const [stats, setStats] = useState<StatsData>(STATS_VACIAS)
  const [porTemporada, setPorTemporada] = useState<StatsPorTemporada[]>([])
  const [actualizadoEn, setActualizadoEn] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // "Récord" necesita el desglose por edición, así que reutiliza la
    // llamada 'global' (que ya lo trae), pero se muestra distinto.
    const temporadaParaApi = filtro === 'record' ? 'global' : filtro

    setCargando(true)
    fetch(`/api/perfil/${encodeURIComponent(username)}/estadisticas?temporada=${temporadaParaApi}`)
      .then(res => res.json())
      .then(data => {
        setStats(data.stats ?? STATS_VACIAS)
        setPorTemporada(data.porTemporada ?? [])
        setActualizadoEn(data.actualizado_en ?? null)
        setCargando(false)
      })
      .catch(() => {
        setStats(STATS_VACIAS)
        setCargando(false)
      })
  }, [username, filtro])

  const esRecord = filtro === 'record'

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {FILTROS.map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)} style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '11px', letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            padding: '6px 14px', cursor: 'pointer',
            background: filtro === f.id ? 'rgba(74,124,63,0.1)' : 'transparent',
            border: filtro === f.id ? '1px solid var(--green-bright)' : '1px solid rgba(255,255,255,0.055)',
            color: filtro === f.id ? 'var(--green-bright)' : 'var(--text-mid)',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <div style={{ padding: '48px', textAlign: 'center' as const, color: 'var(--text-dim)', fontFamily: 'var(--font-special-elite)', fontSize: '13px' }}>
          Cargando...
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.055)' }}>
            {CAMPOS.map(c => {
              if (esRecord) {
                const record = calcularRecord(porTemporada, c.key)
                return (
                  <StatCard
                    key={c.key}
                    valor={record ? formatear(String(record.valor), c.decimales) : '0'}
                    label={c.label}
                    sufijo={c.sufijo}
                    subtitulo={record ? `Récord en ${record.slug.toUpperCase()}` : undefined}
                  />
                )
              }
              return (
                <StatCard
                  key={c.key}
                  valor={formatear(stats[c.key], c.decimales)}
                  label={c.label}
                  sufijo={c.sufijo}
                />
              )
            })}
          </div>
          {actualizadoEn && !esRecord && (
            <div style={{
              marginTop: '12px', fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.06em', textAlign: 'right' as const
            }}>
              Última actualización: {new Date(actualizadoEn).toLocaleString('es-ES')}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function TabsPerfil({ username, personajes, badges, esPropio, esAdminVisitante, rol, solicitud, slotsPermitidos, minecraftUsername }: Props) {
  const [activo, setActivo] = useState('estadisticas')

  return (
    <div>
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid rgba(255,255,255,0.055)', marginBottom: '24px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActivo(t.id)} style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '13px', letterSpacing: '0.1em',
            textTransform: 'uppercase' as const, fontWeight: 600,
            padding: '12px 20px',
            background: 'transparent', border: 'none',
            borderBottom: activo === t.id ? '2px solid var(--green-bright)' : '2px solid transparent',
            color: activo === t.id ? 'var(--green-bright)' : 'var(--text-mid)',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {activo === 'estadisticas' && <TabEstadisticas username={username} />}
      {activo === 'personajes' && (
        <SecPersonajesPublico
          personajes={personajes}
          esPropio={esPropio}
          esAdminVisitante={esAdminVisitante}
          rol={rol}
          solicitud={solicitud}
          slotsPermitidos={slotsPermitidos}
          minecraftUsername={minecraftUsername}
        />
      )}
      {activo === 'logros' && <TabPlaceholder titulo="Logros" />}
      {activo === 'actividad' && <TabPlaceholder titulo="Actividad" />}
    </div>
  )
}