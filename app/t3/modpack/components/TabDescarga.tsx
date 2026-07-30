'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  estaAutorizado: boolean
  tieneSesion: boolean
  esAdmin: boolean
  tieneModpack: boolean
  modpackVersion: string | null
}

const contenidos = [
  { color: 'var(--blood)', texto: <><strong>Más tipos de zombie</strong> — Variedad de infectados con comportamientos y habilidades distintas.</> },
  { color: 'var(--green)', texto: <><strong>Experimentación con zombies</strong> — Sistema de drogas para alterar y estudiar a los infectados.</> },
  { color: 'var(--green)', texto: <><strong>Exploración y estructuras</strong> — Nuevas estructuras post-apocalípticas para descubrir y saquear.</> },
  { color: 'var(--green)', texto: <><strong>Mod de casino</strong> — Suerte, apuestas y entretenimiento en el fin del mundo.</> },
  { color: 'var(--green)', texto: <><strong>Sistema de tiers de rol y PvP</strong> — Niveles de experiencia que adaptan la experiencia de combate y rol.</> },
  { color: 'var(--blood)', texto: <><strong>Dificultad por distancia</strong> — El mundo se vuelve más peligroso cuanto más te alejas del centro.</> },
]

const requisitos = [
  { label: 'RAM recomendada', val: '6–8 GB' },
  { label: 'Launcher',        val: 'Modrinth' },
  { label: 'Versión',         val: 'Forge 1.20.1' },
  { label: 'Almacenamiento',  val: 'A confirmar' },
]

function BotonDescarga({ estaAutorizado, tieneSesion, esAdmin, tieneModpack, modpackVersion }: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [resultadoSync, setResultadoSync] = useState<{ sincronizados: number, noReconocidos: number } | null>(null)

// 1. Admin sin modpack
if (esAdmin && !tieneModpack) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '12px 24px',
          background: 'rgba(74,124,63,0.05)',
          color: 'var(--text-dim)',
          border: '1px solid rgba(74,124,63,0.2)',
          cursor: 'not-allowed'
        }}>
          <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
            <rect x="4" y="9" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Modpack no disponible
        </div>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', color: 'var(--text-dim)',
          letterSpacing: '0.06em', padding: '12px 16px',
          border: '1px solid rgba(255,255,255,0.055)',
          background: 'var(--bg2)'
        }}>
          Próximamente
        </div>
      </div>
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '11px', letterSpacing: '0.15em',
        textTransform: 'uppercase' as const, fontWeight: 600,
        padding: '12px 16px', cursor: 'pointer', width: 'fit-content',
        border: '1px solid rgba(74,124,63,0.4)',
        color: 'var(--green-bright)'
      }}>
        <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
          <path d="M10 17V7M6 11l4-4 4 4M4 17h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Subir modpack
        <input
  type="file"
  accept=".mrpack"
  style={{ display: 'none' }}
  onChange={async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const version = 'CipolloLand 2: Apocalypse Edition'

    const res = await fetch('/api/t3/modpack/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name }),
    })
    const { uploadUrl, key } = await res.json()

    await fetch(uploadUrl, { method: 'PUT', body: file })

    await fetch('/api/t3/modpack/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, version }),
    })

    alert('¡Modpack subido correctamente!')
    window.location.reload()
  }}
/>
      </label>
    </div>
  )
}

// 2. Admin con modpack
if (esAdmin && tieneModpack) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {/* Caja verde con nombre */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '12px 24px',
          background: 'rgba(74,124,63,0.1)',
          color: 'var(--green-bright)',
          border: '1px solid rgba(74,124,63,0.4)',
        }}>
          <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
            <path d="M18 10 L14 17 L6 17 L2 10 L6 3 L14 3 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          {modpackVersion ?? 'CipolloLand T3'}
        </div>
        {/* Botón descargar */}
        <a href="/api/t3/modpack/download" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '12px 20px',
          background: 'var(--green)', color: 'var(--bone)',
          textDecoration: 'none', border: '1px solid var(--green-bright)',
        }}>
          <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
            <path d="M10 3v10M6 9l4 4 4-4M4 15h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Descargar
        </a>
      </div>

      {/* Botón quitar */}
        {!confirmando ? (
        <button onClick={() => setConfirmando(true)} style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          padding: '8px 16px', cursor: 'pointer', width: 'fit-content',
          background: 'transparent', color: 'var(--blood-bright)',
          border: '1px solid rgba(155,28,28,0.3)'
        }}>Quitar modpack</button>
  ) : (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '12px', color: 'var(--text-mid)' }}>¿Confirmar?</span>
      <button onClick={async () => {
        await fetch('/api/t3/modpack/remove', { method: 'POST' })
        window.location.reload()
      }} style={{
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
        padding: '6px 14px', cursor: 'pointer',
        background: 'var(--blood)', color: 'var(--bone)', border: 'none'
      }}>Sí, quitar</button>
      <button onClick={() => setConfirmando(false)} style={{
        fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
        padding: '6px 14px', cursor: 'pointer',
        background: 'transparent', color: 'var(--text-dim)',
        border: '1px solid rgba(255,255,255,0.055)'
      }}>Cancelar</button>
    </div>
)}
{/* Sincronizar mods */}
<div>
  <button
    disabled={sincronizando}
    onClick={async () => {
      setSincronizando(true)
      setResultadoSync(null)
      try {
        const res = await fetch('/api/t3/modpack/sync-mods', { method: 'POST' })
        const data = await res.json()
        if (res.ok) {
          setResultadoSync({ sincronizados: data.sincronizados, noReconocidos: data.noReconocidos })
        } else {
          alert(`Error: ${data.error}`)
        }
      } catch (err) {
        alert('Error de red al sincronizar')
      }
      setSincronizando(false)
    }}
    style={{
      fontFamily: 'var(--font-barlow-condensed)',
      fontSize: '11px', letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      padding: '8px 16px', cursor: sincronizando ? 'not-allowed' : 'pointer', width: 'fit-content',
      background: 'transparent', color: 'var(--green-bright)',
      border: '1px solid rgba(74,124,63,0.4)',
      opacity: sincronizando ? 0.5 : 1
    }}
  >
    {sincronizando ? 'Sincronizando...' : 'Sincronizar lista de mods'}
  </button>

  {resultadoSync && (
    <p style={{
      marginTop: '8px',
      fontFamily: 'var(--font-barlow-condensed)',
      fontSize: '12px', color: 'var(--text-mid)',
      letterSpacing: '0.04em'
    }}>
      ✅ {resultadoSync.sincronizados} mods sincronizados desde Modrinth.
      {resultadoSync.noReconocidos > 0 && (
        <> ⚠️ {resultadoSync.noReconocidos} sin reconocer (probablemente CurseForge o custom) — añádelos a mano.</>
      )}
    </p>
  )}
</div>
    </div>
  )
}

// 3. Usuario aprobado sin modpack
if (estaAutorizado && !tieneModpack) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '12px 24px',
          background: 'rgba(74,124,63,0.05)',
          color: 'var(--text-dim)',
          border: '1px solid rgba(74,124,63,0.2)',
          cursor: 'not-allowed'
        }}>
          <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
            <rect x="4" y="9" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Modpack no disponible
        </div>
        <div style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '11px', color: 'var(--text-dim)',
          letterSpacing: '0.06em', padding: '12px 16px',
          border: '1px solid rgba(255,255,255,0.055)',
          background: 'var(--bg2)'
        }}>
          Próximamente
        </div>
      </div>
    </div>
  )
}

// 4. Usuario aprobado con modpack
if (estaAutorizado) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {/* Caja verde con nombre */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '12px 24px',
          background: 'rgba(74,124,63,0.1)',
          color: 'var(--green-bright)',
          border: '1px solid rgba(74,124,63,0.4)',
        }}>
          <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
            <path d="M18 10 L14 17 L6 17 L2 10 L6 3 L14 3 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          {modpackVersion ?? 'CipolloLand T3'}
        </div>
        {/* Botón descargar */}
        <a href="/api/t3/modpack/download" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '12px 20px',
          background: 'var(--green)', color: 'var(--bone)',
          textDecoration: 'none', border: '1px solid var(--green-bright)',
        }}>
          <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
            <path d="M10 3v10M6 9l4 4 4-4M4 15h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Descargar
        </a>
      </div>
    </div>
  )
}

  // 5. No autorizado
  return (
    <div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '13px', letterSpacing: '0.18em',
        textTransform: 'uppercase' as const, fontWeight: 600,
        padding: '12px 24px',
        background: 'rgba(74,124,63,0.05)',
        color: 'var(--text-dim)',
        border: '1px solid rgba(74,124,63,0.2)',
        cursor: 'not-allowed'
      }}>
        <svg viewBox="0 0 20 20" fill="none" style={{ width: '14px', height: '14px' }}>
          <rect x="4" y="9" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Descarga bloqueada
      </div>
      <p style={{
        marginTop: '12px',
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '12px', color: 'var(--text-dim)',
        letterSpacing: '0.08em'
      }}>
        {tieneSesion ? 'Necesitas ser un jugador aprobado. ' : 'Necesitas iniciar sesión. '}
        <Link
          href={tieneSesion ? '/t3/solicitud' : '/login'}
          style={{ color: 'var(--green-bright)', textDecoration: 'none' }}
        >
          {tieneSesion ? 'Solicita acceso →' : 'Inicia sesión →'}
        </Link>
      </p>
    </div>
  )
}

export default function TabDescarga({ estaAutorizado, tieneSesion, esAdmin, tieneModpack, modpackVersion }: Props) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '1px', background: 'rgba(255,255,255,0.055)',
    }}>
      {/* Izquierda */}
      <div style={{ background: 'var(--bg)', padding: '48px 40px', display: 'flex', flexDirection: 'column' as const, gap: '24px', minWidth: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Image src="/modpack-icon.png" alt="Apocalypse Edition" width={56} height={56} style={{ objectFit: 'contain' }} />
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '32px', color: 'var(--bone)', letterSpacing: '0.04em' }}>
            Apocalypse Edition
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--font-special-elite)',
          fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.8
        }}>
          El modpack de CipolloLand 2: Apocalypse Edition, vamos a pasarlo bien eono.
        </p>

        <BotonDescarga
          estaAutorizado={estaAutorizado}
          tieneSesion={tieneSesion}
          esAdmin={esAdmin}
          tieneModpack={tieneModpack}
          modpackVersion={modpackVersion}
        />

        {/* Requisitos */}
        <div>
          <div style={{
            
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', letterSpacing: '0.28em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)', opacity: 0.75,
            marginBottom: '12px', fontWeight: 600
          }}>Requisitos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.055)', maxWidth: '320px' }}>
            {requisitos.map(r => (
              <div key={r.label} style={{ background: 'var(--bg2)', padding: '10px 14px', textAlign: 'center' as const }}>
                <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>{r.label}</div>
                <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', color: 'var(--bone)', letterSpacing: '0.06em' }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Derecha */}
    <div style={{ background: 'var(--bg)', padding: '48px 40px', minWidth: 0 }}>
      <div style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: '24px', letterSpacing: '0.04em',
        color: 'var(--bone)',
        marginBottom: '20px'
      }}>Contenidos del modpack</div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: '18px' }}>
        {contenidos.map((c, i) => (
          <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0, marginTop: '7px' }} />
            <span style={{ fontFamily: 'var(--font-special-elite)', fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.75 }}>
              {c.texto}
            </span>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}