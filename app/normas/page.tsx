import Navbar from '@/app/t3/components/Navbar'
import Footer from '@/app/t3/components/Footer'
import PaginaProximamente from '@/app/components/PaginaProximamente'
import { auth } from '@/auth'

export default async function NormasPage() {
  const session = await auth()
  return (
    <>
      <Navbar session={session} />
      <PaginaProximamente titulo="Normas" sub="Las reglas de la Temporada 3 estarán aquí muy pronto." />
      <Footer />
    </>
  )
}