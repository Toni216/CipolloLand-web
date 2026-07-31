import { Suspense } from 'react'
import RegistroForm from './components/RegistroForm'

export default function RegistroPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.055)',
        background: 'var(--bg2)',
      }}>

        <div style={{
          padding: '32px 32px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', letterSpacing: '0.28em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)', opacity: 0.75,
            marginBottom: '8px', fontWeight: 600
          }}>
            CipolloLand · Registro
          </div>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '36px', color: 'var(--bone)',
            letterSpacing: '0.04em', lineHeight: 1
          }}>
            Crear cuenta
          </h1>
        </div>

        <Suspense>
          <RegistroForm />
        </Suspense>

      </div>
    </main>
  )
}