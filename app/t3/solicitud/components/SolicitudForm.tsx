'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  estaRechazado: boolean
}

export default function SolicitudForm({ estaRechazado }: Props) {
  const router = useRouter()
  const [motivacion, setMotivacion]       = useState('')
  const [howFound, setHowFound]           = useState('')
  const [recomendadoPor, setRecomendadoPor] = useState('')
  const [isAdult, setIsAdult]             = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAdult) {
      setError('Debes confirmar que eres mayor de 18 años para solicitar acceso.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/t3/solicitud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivacion, howFound, recomendadoPor, isAdult })
    })

    setLoading(false)

    if (res.ok) {
      router.push('/perfil')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al enviar la solicitud.')
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid rgba(255,255,255,0.055)',
    color: 'var(--bone)',
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '14px', padding: '10px 14px',
    outline: 'none', letterSpacing: '0.04em',
    resize: 'vertical' as const
  }

  const labelStyle = {
    fontFamily: 'var(--font-barlow-condensed)',
    fontSize: '10px', letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-dim)', marginBottom: '6px',
    display: 'block'
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px' }}>

        {estaRechazado && (
          <div style={{
            border: '1px solid rgba(155,28,28,0.3)',
            background: 'rgba(155,28,28,0.04)',
            padding: '16px 20px', marginBottom: '8px'
          }}>
            <div style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '12px', color: 'var(--blood-bright)',
              letterSpacing: '0.06em'
            }}>
              Tu solicitud anterior fue rechazada. Puedes volver a intentarlo.
            </div>
          </div>
        )}

        {/* Motivación */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)', padding: '20px 24px' }}>
          <label style={labelStyle}>
            ¿Por qué quieres entrar? <span style={{ color: 'var(--blood-bright)' }}>*</span>
          </label>
          <textarea
            style={{ ...inputStyle, minHeight: '100px' }}
            value={motivacion}
            onChange={e => setMotivacion(e.target.value)}
            required
            placeholder="Cuéntanos por qué te gustaría unirte a CipolloLand..."
          />
        </div>

        {/* Cómo nos encontró */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)', padding: '20px 24px' }}>
          <label style={labelStyle}>¿Cómo nos conociste?</label>
          <input
            style={inputStyle}
            value={howFound}
            onChange={e => setHowFound(e.target.value)}
            placeholder="Redes sociales, un amigo, YouTube..."
          />
        </div>

        {/* Recomendado por */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)', padding: '20px 24px' }}>
          <label style={labelStyle}>¿Quién te recomendó? (opcional)</label>
          <input
            style={inputStyle}
            value={recomendadoPor}
            onChange={e => setRecomendadoPor(e.target.value)}
            placeholder="Nick del jugador que te recomendó..."
          />
        </div>

        {/* Confirmación de edad */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,255,255,0.055)', padding: '20px 24px' }}>
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            cursor: 'pointer'
          }}>
            <div
              onClick={() => setIsAdult(!isAdult)}
              style={{
                width: '18px', height: '18px', flexShrink: 0,
                border: `1px solid ${isAdult ? 'var(--green-bright)' : 'rgba(255,255,255,0.2)'}`,
                background: isAdult ? 'rgba(74,124,63,0.2)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '1px', cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {isAdult && (
                <svg viewBox="0 0 12 12" fill="none" style={{ width: '10px', height: '10px' }}>
                  <path d="M2 6l3 3 5-5" stroke="var(--green-bright)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <span style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontSize: '13px', color: 'var(--text-mid)',
              letterSpacing: '0.04em', lineHeight: 1.5
            }}>
              Confirmo que tengo <strong style={{ color: 'var(--bone-dim)' }}>18 años o más</strong>. 
              Entiendo que CipolloLand es una comunidad para mayores de 18 años.
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '12px', color: 'var(--blood-bright)',
            letterSpacing: '0.06em', padding: '10px 16px',
            border: '1px solid rgba(155,28,28,0.3)',
            background: 'rgba(155,28,28,0.05)'
          }}>
            {error}
          </div>
        )}

        {/* Botón */}
        <button type="submit" disabled={loading} style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fontSize: '13px', letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontWeight: 600,
          padding: '14px 24px', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? 'rgba(74,124,63,0.3)' : 'var(--green)',
          color: 'var(--bone)', border: 'none',
          transition: 'background 0.2s', width: '100%'
        }}>
          {loading ? 'Enviando...' : 'Enviar solicitud →'}
        </button>

      </div>
    </form>
  )
}