import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const ROLES_STAFF = ['admin', 'owner', 'moderador']

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ esStaff: false, tieneAcceso: false, esAdminOOwner: false })
  }

  const esStaff = ROLES_STAFF.includes(session.user.rol)
  const esAdminOOwner = ['admin', 'owner'].includes(session.user.rol)

  const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })
  let tieneAcceso = false

  if (temporada) {
    const [accessRequest, perfilJugador] = await Promise.all([
      prisma.access_requests.findFirst({
        where: { user_id: session.user.id, temporada_id: temporada.id, status: 'aprobado' },
      }),
      prisma.perfil_jugador.findFirst({
        where: { user_id: session.user.id, temporada_id: temporada.id, status: 'aprobado', deleted_at: null },
      }),
    ])
    tieneAcceso = !!accessRequest || !!perfilJugador
  }

  return NextResponse.json({ esStaff, tieneAcceso, esAdminOOwner })
}