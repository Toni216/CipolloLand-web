import Navbar from '@/app/t3/components/Navbar'
import Footer from '@/app/t3/components/Footer'
import PaginaProximamente from '@/app/components/PaginaProximamente'
import { auth } from '@/auth'

export default async function EquipoPage() {
  const session = await auth()
  return (
    <>
      <Navbar session={session} />
      <PaginaProximamente titulo="Equipo" sub="Muy pronto conocerás a quién está detrás de CipolloLand." />
      <Footer />
    </>
  )
}