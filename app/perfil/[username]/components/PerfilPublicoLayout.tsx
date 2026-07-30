'use client'

import { useState } from 'react'
import TopBarMinimal from './TopBarMinimal'
import SidebarPublico from './SidebarPublico'
import TabsPerfil from './TabsPerfil'
import EditarPerfilDrawer from './EditarPerfilDrawer'

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
  usuario: {
    id: string
    username: string
    rol: string
    minecraft_username: string | null
    created_at: Date
    bio: string | null
    discord_username: string | null
  }
  personajes: Personaje[]
  badges: Badge[]
  esPropio: boolean
  esAdminVisitante: boolean
  solicitud: { status: string; motivo_rechazo: string | null; created_at: Date; slots_permitidos: number } | null
  slotsPermitidos: number
}

export default function PerfilPublicoLayout({ usuario, personajes, badges, esPropio, esAdminVisitante, solicitud, slotsPermitidos }: Props) {
  const [editando, setEditando] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopBarMinimal />

      <div style={{
        padding: '32px 40px 100px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '32px',
      }}>
        <SidebarPublico usuario={usuario} personajes={personajes} badges={badges} esPropio={esPropio} />

        <main>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            {esPropio && (
              <button onClick={() => setEditando(true)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'var(--font-barlow-condensed)',
                fontSize: '11px', letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                padding: '7px 14px', cursor: 'pointer',
                background: 'transparent', color: 'var(--green-bright)',
                border: '1px solid rgba(74,124,63,0.4)',
              }}>
                ✎ Editar perfil
              </button>
            )}
          </div>

          <TabsPerfil
            username={usuario.username}
            personajes={personajes}
            badges={badges}
            esPropio={esPropio}
            esAdminVisitante={esAdminVisitante}
            rol={usuario.rol}
            solicitud={solicitud}
            slotsPermitidos={slotsPermitidos}
            minecraftUsername={usuario.minecraft_username}
          />
        </main>
      </div>

      {esPropio && (
        <EditarPerfilDrawer
          minecraftUsername={usuario.minecraft_username}
          bio={usuario.bio}
          discordUsername={usuario.discord_username}
          badges={badges}
          abierto={editando}
          onClose={() => setEditando(false)}
        />
      )}
    </div>
  )
}