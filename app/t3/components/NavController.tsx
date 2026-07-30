'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import InfoStrip from './InfoStrip'
import type { Session } from 'next-auth'

interface Props {
  jugadores: number
  session: Session | null
}

export default function NavController({ jugadores, session }: Props) {
  const pathname = usePathname()
  const esLanding = pathname === '/t3'
  const [showNav, setShowNav] = useState(!esLanding)

  useEffect(() => {
    if (!esLanding) {
      setShowNav(true)
      return
    }
    const handleScroll = () => {
      setShowNav(window.scrollY > window.innerHeight * 0.8)
    }
    setShowNav(false)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [esLanding])

  if (!showNav) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 500,
      animation: 'navFadeIn 0.3s ease'
    }}>
      <Navbar session={session} />
      <InfoStrip jugadores={jugadores} />
    </div>
  )
}