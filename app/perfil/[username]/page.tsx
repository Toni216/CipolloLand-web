import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PerfilPublicoLayout from './components/PerfilPublicoLayout'

async function getPerfilPublico(username: string) {
  const usuarios = await prisma.$queryRawUnsafe<Array<{
    id: string
    username: string
    rol: string
    minecraft_username: string | null
    created_at: Date
    bio: string | null
    discord_username: string | null
  }>>(
    `SELECT id, username, rol, minecraft_username, created_at, bio, discord_username
     FROM users WHERE username = $1 AND deleted_at IS NULL LIMIT 1`,
    username
  )

  const usuario = usuarios[0] ?? null
  if (!usuario) return null

  const [personajes, badges] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{
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
    }>>(
      `SELECT pp.id, pp.nombre_pj, pp.faccion_pj, pp.raza_pj, pp.clase_pj, pp.status, pp.es_npc, pp.created_at,
              pp.edad_pj, pp.pj_who, pp.historia_pj, pp.objetivos, pp.reaccion_peligro,
              pp.comida_favorita, pp.apodo_odiado, pp.detalles_publicos
       FROM perfil_jugador pp
       JOIN temporadas t ON t.id = pp.temporada_id
       WHERE pp.user_id = $1 AND t.slug = 't3'
         AND pp.deleted_at IS NULL AND pp.es_npc = FALSE
       ORDER BY pp.created_at ASC`,
      usuario.id
    ),
    prisma.$queryRawUnsafe<Array<{
      id: string
      nombre: string
      descripcion: string | null
      icono: string | null
      color: string | null
      granted_at: Date
      destacada: boolean
    }>>(
      `SELECT b.id, b.nombre, b.descripcion, b.icono, b.color, ub.granted_at, ub.destacada
       FROM user_badges ub
       JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = $1`,
      usuario.id
    ),
  ])

  return { usuario, personajes, badges }
}

async function getDatosPropios(userId: string) {
  const solicitudes = await prisma.$queryRawUnsafe<Array<{
    status: string
    motivo_rechazo: string | null
    created_at: Date
    slots_permitidos: number
  }>>(
    `SELECT ar.status, ar.motivo_rechazo, ar.created_at, ar.slots_permitidos
     FROM access_requests ar
     JOIN temporadas t ON t.id = ar.temporada_id
     WHERE ar.user_id = $1 AND t.slug = 't3'
     ORDER BY ar.created_at DESC LIMIT 1`,
    userId
  )
  const solicitud = solicitudes[0] ?? null
  return {
    solicitud,
    slotsPermitidos: solicitud?.status === 'aprobado' ? (solicitud.slots_permitidos ?? 1) : 0,
  }
}

export default async function PerfilPublicoPage({ params }: { params: Promise<{ username: string }> }) {
  const { username: usernameRaw } = await params
  const username = decodeURIComponent(usernameRaw)
  const session = await auth()

  const datos = await getPerfilPublico(username)
  if (!datos) notFound()

  const esPropio = session?.user?.id === datos.usuario.id
  const esAdminVisitante = ['admin', 'owner'].includes(session?.user?.rol ?? '')
  const propio = esPropio ? await getDatosPropios(datos.usuario.id) : null

  return (
      <PerfilPublicoLayout
        usuario={datos.usuario}
        personajes={datos.personajes}
        badges={datos.badges}
        esPropio={esPropio}
        esAdminVisitante={esAdminVisitante}
        solicitud={propio?.solicitud ?? null}
        slotsPermitidos={propio?.slotsPermitidos ?? 0}
      />
  )
}