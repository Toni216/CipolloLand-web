'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import SecPersonajes from './SecPersonajes'
import SecAjustes from './SecAjustes'
import SecPrivacidad from '../ajustes/components/SecPrivacidad'
import SecNotificaciones from '../ajustes/components/SecNotificaciones'
import SecHistorial from './SecHistorial'
import SecInsignias from './SecInsignias'
import SecEstadisticas from './SecEstadisticas'
import SecNicks from './SecNicks'
import SecPapelera from '../ajustes/components/SecPapelera'
import SecAdmin from '../ajustes/components/SecAdmin'

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

interface Datos {
  usuario: {
    id: string
    username: string
    email: string
    rol: string
    minecraft_username: string | null
    created_at: Date
  }
  personajes: Personaje[]
  solicitud: {
    status: string
    motivo_rechazo: string | null
    created_at: Date
    slots_permitidos: number
  } | null
  slotsPermitidos: number
  badges: Array<{
    nombre: string
    descripcion: string | null
    icono: string | null
    color: string | null
    granted_at: Date
  }>
}

interface Props {
  datos: Datos
}

export default function PerfilLayout({ datos }: Props) {
  const [seccion, setSeccion] = useState('personajes')
  const { usuario, personajes, solicitud, slotsPermitidos, badges } = datos
  const esAdmin = ['admin', 'owner'].includes(usuario.rol)

  const renderSeccion = () => {
    switch (seccion) {
      case 'personajes':     return <SecPersonajes personajes={personajes} solicitud={solicitud} slotsPermitidos={slotsPermitidos} rol={usuario.rol} />
      case 'ajustes':        return <SecAjustes usuario={usuario} />
      case 'privacidad':     return <SecPrivacidad />
      case 'notificaciones': return <SecNotificaciones />
      case 'historial':      return <SecHistorial />
      case 'insignias':      return <SecInsignias badges={badges} />
      case 'estadisticas':   return <SecEstadisticas />
      case 'nicks':          return <SecNicks usuario={usuario} />
      case 'papelera':       return <SecPapelera />
      case 'admin':          return esAdmin ? <SecAdmin /> : null
      default:               return <SecPersonajes personajes={personajes} solicitud={solicitud} slotsPermitidos={slotsPermitidos} rol={usuario.rol} />
    }
  }

  return (
    <div style={{ paddingTop: '114px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        maxWidth: '1260px', margin: '0 auto',
        padding: '40px 32px 100px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '24px',
      }}>
        <Sidebar
          usuario={usuario}
          seccionActiva={seccion}
          onSeccion={setSeccion}
          badges={badges}
          esAdmin={esAdmin}
        />
        <main>
          {renderSeccion()}
        </main>
      </div>
    </div>
  )
}