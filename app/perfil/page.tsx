import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.name) redirect('/login')
  redirect(`/perfil/${encodeURIComponent(session.user.name)}`)
}