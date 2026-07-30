import Navbar from '@/app/t3/components/Navbar'
import Footer from '@/app/t3/components/Footer'
import PaginaProximamente from '@/app/components/PaginaProximamente'
import { auth } from '@/auth'

export default async function ContactoPage() {
  const session = await auth()
  return (
    <>
      <Navbar session={session} />
      <PaginaProximamente titulo="Contacto" sub="Mientras tanto, puedes escribirnos a rmantoniomanuel.dev@proton.me" />
      <Footer />
    </>
  )
}