'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/t3'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Email o contraseña incorrectos.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid rgba(255,255,255,0.055)',
    color: 'var(--bone)',
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '14px',
    padding: '10px 14px',
    outline: 'none',
    letterSpacing: '0.04em',
  }

  const labelStyle = {
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '10px', letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-dim)', marginBottom: '6px',
    display: 'block'
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label style={labelStyle}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '12px', color: 'var(--blood-bright)',
            letterSpacing: '0.06em', padding: '8px 12px',
            border: '1px solid rgba(155,28,28,0.3)',
            background: 'rgba(155,28,28,0.05)'
          }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '12px 24px', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? 'rgba(74,124,63,0.3)' : 'var(--green)',
          color: 'var(--bone)', border: 'none',
          transition: 'background 0.2s', width: '100%'
        }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '12px', color: 'var(--text-dim)',
          letterSpacing: '0.06em', textAlign: 'center' as const
        }}>
          ¿No tienes cuenta?{' '}
          <Link href="/registro" style={{ color: 'var(--green-bright)', textDecoration: 'none' }}>
            Regístrate →
          </Link>
        </p>

      </div>
    </form>
  )
}