'use client'

import { useState } from 'react'
import TabDescarga from './TabDescarga'
import TabInstalacion from './TabInstalacion'
import TabMods from './TabMods'

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
  tieneSesion: boolean
  esAdmin: boolean
  tieneModpack: boolean
  modpackVersion: string | null
  mods: Mod[]
}

const tabs = [
  { id: 'descarga',    label: 'Descarga' },
  { id: 'instalacion', label: 'Instalación' },
  { id: 'mods',        label: 'Lista de mods' },
]

export default function ModpackTabs({ estaAutorizado, tieneSesion, esAdmin, tieneModpack, modpackVersion, mods }: Props) {
  const [activo, setActivo] = useState('descarga')

  return (
    <div>
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        background: 'var(--bg2)',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActivo(t.id)} style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '13px', letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, fontWeight: 600,
            padding: '14px 24px',
            background: 'transparent', border: 'none',
            borderBottom: activo === t.id ? '2px solid var(--green-bright)' : '2px solid transparent',
            color: activo === t.id ? 'var(--green-bright)' : 'var(--text-mid)',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg)' }}>
        {activo === 'descarga'    && <TabDescarga estaAutorizado={estaAutorizado} tieneSesion={tieneSesion} esAdmin={esAdmin} tieneModpack={tieneModpack} modpackVersion={modpackVersion} />}
        {activo === 'instalacion' && <TabInstalacion />}
        {activo === 'mods' && <TabMods estaAutorizado={estaAutorizado} esAdmin={esAdmin} mods={mods} />}
      </div>
    </div>
  )
}