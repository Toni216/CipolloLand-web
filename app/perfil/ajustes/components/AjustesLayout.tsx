'use client'

import { useState } from 'react'
import Link from 'next/link'
import AjustesSidebar from './AjustesSidebar'
import SecAjustes from './SecAjustes'
import SecPrivacidad from './SecPrivacidad'
import SecNotificaciones from './SecNotificaciones'
import SecPapelera from './SecPapelera'
import SecAdmin from './SecAdmin'

interface Usuario {
  id: string
  username: string
  email: string
  rol: string
  minecraft_username: string | null
  bio: string | null
  discord_username: string | null
  created_at: Date
}

interface Badge {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color: string | null
  granted_at: Date
}

interface Props {
  usuario: Usuario
  badges: Badge[]
  esAdmin: boolean
}

export default function AjustesLayout({ usuario, badges, esAdmin }: Props) {
  const [seccion, setSeccion] = useState('cuenta')

  const renderSeccion = () => {
    switch (seccion) {
      case 'cuenta':         return <SecAjustes usuario={usuario} />
      case 'privacidad':     return <SecPrivacidad />
      case 'notificaciones': return <SecNotificaciones />
      case 'papelera':       return <SecPapelera />
      case 'admin':          return esAdmin ? <SecAdmin /> : null
      default:               return <SecAjustes usuario={usuario} />
    }
  }

  return (
    <div style={{ paddingTop: '32px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ padding: '0 40px 100px' }}>
        <Link href={`/perfil/${usuario.username}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-barlow-condensed)', fontSize: '11px',
          letterSpacing: '0.12em', textTransform: 'uppercase' as const,
          color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '24px'
        }}>
          ← Volver a mi perfil
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
          <AjustesSidebar seccionActiva={seccion} onSeccion={setSeccion} esAdmin={esAdmin} />
          <main>{renderSeccion()}</main>
        </div>
      </div>
    </div>
  )
}