import NavController from './components/NavController'
import Footer from './components/Footer'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export default async function T3Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  let jugadores = 0
  try {
    const result = await prisma.$queryRawUnsafe<[{ count: string }]>(
      `SELECT COUNT(*)::text as count
       FROM perfil_jugador pj
       JOIN temporadas t ON t.id = pj.temporada_id
       WHERE pj.status = 'aprobado'
         AND pj.deleted_at IS NULL
         AND t.slug = 't3'`
    )
    jugadores = parseInt(result[0].count)
  } catch (e) {
    console.error('Error contando jugadores:', e)
  }

  return (
    <div>
      <NavController jugadores={jugadores} session={session} />
      {children}
      <Footer />
    </div>
  )
}