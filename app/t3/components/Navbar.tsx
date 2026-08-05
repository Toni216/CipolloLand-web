'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import NavLinks from './NavLinks'
import NavMobile from './NavMobile'
import NavUser from './NavUser'
import type { Session } from 'next-auth'

const links = [
  { label: 'Lore',          href: '/t3/lore' },
  { label: 'Anuncios',      href: '/t3/anuncios' },
  { label: 'Personajes',    href: '/t3/personajes' },
  { label: 'Eventos',       href: '/t3/eventos' },
  { label: 'Foro',          href: '/t3/foro' },
  { label: 'Mapa',          href: '/t3/mapa' },
  { label: 'Clasificación', href: '/t3/leaderboard' },
]

interface Props {
  session: Session | null
}

export default function Navbar({ session }: Props) {
  const user = session?.user
  const pathname = usePathname()
  const callbackUrl = encodeURIComponent(pathname)

  return (
    <nav style={{
      width: '100%',
      position: 'sticky', top: 0, zIndex: 500,
      background: 'rgba(9,10,7,0.97)',
      borderBottom: '1px solid rgba(74,124,63,0.2)',
      backdropFilter: 'blur(10px)',
      height: '70px',
      display: 'flex', alignItems: 'center',
      padding: '0 36px', gap: '24px',
    }}>

      {/* Logo */}
      <Link href="/t3" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <Image
          src="/LOGOSOLOTEXTO.png"
          alt="CipolloLand"
          width={120}
          height={35}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Links desktop */}
      <NavLinks />

      {/* Derecha */}
      {user ? (
        <div className="nav-actions-desktop">
          <NavUser user={user} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }} className="nav-actions-desktop">
          <Link href={`/login?callbackUrl=${callbackUrl}`} className="nav-btn-login">Iniciar sesión</Link>
          <Link href={`/registro?callbackUrl=${callbackUrl}`} className="nav-btn-registro">Crear cuenta</Link>
        </div>
      )}

      <NavMobile links={links} />

    </nav>
  )
}