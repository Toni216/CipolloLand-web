'use client'

import { useEffect, useState } from 'react'

interface Props {
  openDate: string | null
}

interface TimeLeft {
  days: number
  hours: number
  mins: number
  secs: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 }
  const totalSec = Math.floor(diff / 1000)
  return {
    days:  Math.floor(totalSec / 86400),
    hours: Math.floor(totalSec / 3600) % 24,
    mins:  Math.floor(totalSec / 60) % 60,
    secs:  totalSec % 60,
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function Countdown({ openDate }: Props) {
  const target = openDate ? new Date(openDate) : new Date('2026-08-01T17:30:00+02:00')

  // null = todavía no montado en el cliente. Servidor y cliente
  // pintan exactamente lo mismo (el placeholder) en el primer render,
  // así que no hay discrepancia posible en la hidratación.
  const [time, setTime] = useState<TimeLeft | null>(null)

  useEffect(() => {
    // Primer cálculo real, ya en el cliente — nunca ocurre en el servidor.
    setTime(calcTimeLeft(target))

    const interval = setInterval(() => {
      setTime(calcTimeLeft(target))
    }, 1000)
    return () => clearInterval(interval)
  }, [openDate])

  const block = (value: number, label: string) => (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
      <div style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: 'clamp(36px, 8vw, 72px)',
        lineHeight: 1,
        color: 'var(--bone)',
        minWidth: '2ch',
        textAlign: 'center'
      }}>
        {pad(value)}
      </div>
      <div style={{
        fontFamily: 'var(--font-barlow-condensed)',
        fontSize: '10px',
        letterSpacing: '0.2em',
        color: 'var(--text-dim)',
        textTransform: 'uppercase'
      }}>
        {label}
      </div>
    </div>
  )

  const sep = () => (
    <div style={{
      fontFamily: 'var(--font-bebas)',
      fontSize: 'clamp(28px, 6vw, 56px)',
      color: 'var(--blood)',
      opacity: 0.6,
      marginBottom: '18px'
    }}>:</div>
  )

  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{
        fontFamily: 'var(--font-special-elite)',
        fontSize: '10px',
        color: 'var(--text-dim)',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        Apertura del servidor en
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        {block(time?.days  ?? 0, 'días')}
        {sep()}
        {block(time?.hours ?? 0, 'horas')}
        {sep()}
        {block(time?.mins  ?? 0, 'min')}
        {sep()}
        {block(time?.secs  ?? 0, 'seg')}
      </div>
    </div>
  )
}