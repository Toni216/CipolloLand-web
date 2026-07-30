import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AjustesLayout from './components/AjustesLayout'

async function getDatos(userId: string) {
  const usuarios = await prisma.$queryRawUnsafe<Array<{
    id: string
    username: string
    email: string
    rol: string
    minecraft_username: string | null
    bio: string | null
    discord_username: string | null
    created_at: Date
  }>>(
    `SELECT id, username, email, rol, minecraft_username, bio, discord_username, created_at
     FROM users WHERE id = $1 LIMIT 1`,
    userId
  )

  const badges = await prisma.$queryRawUnsafe<Array<{
    id: string
    nombre: string
    descripcion: string | null
    icono: string | null
    color: string | null
    granted_at: Date
  }>>(
    `SELECT b.id, b.nombre, b.descripcion, b.icono, b.color, ub.granted_at
     FROM user_badges ub
     JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id = $1`,
    userId
  )

  return { usuario: usuarios[0] ?? null, badges }
}

export default async function AjustesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const datos = await getDatos(session.user.id)
  if (!datos.usuario) redirect('/login')

  return <AjustesLayout usuario={datos.usuario} badges={datos.badges} esAdmin={['admin', 'owner'].includes(datos.usuario.rol)} />
}