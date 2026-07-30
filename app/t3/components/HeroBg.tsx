'use client'

import { useEffect, useRef } from 'react'

export default function HeroBg() {
  const sporesRef = useRef<HTMLDivElement>(null)
  const dropsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Esporas verdes
    if (sporesRef.current) {
      for (let i = 0; i < 28; i++) {
        const s = document.createElement('span')
        const size = 1 + Math.random() * 2.5
        s.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: var(--green-bright);
          opacity: 0;
          left: ${Math.random() * 100}%;
          bottom: ${Math.random() * 40}%;
          width: ${size}px;
          height: ${size}px;
          animation: sporeFloat ${8 + Math.random() * 14}s ${Math.random() * 12}s infinite ease-in-out;
          --vy: ${-(80 + Math.random() * 200)}px;
          --vx: ${(Math.random() - 0.5) * 100}px;
        `
        sporesRef.current.appendChild(s)
      }
    }

    // Gotas de sangre
    if (dropsRef.current) {
      const positions = [8, 17, 29, 38, 52, 63, 74, 81, 91]
      positions.forEach(xPct => {
        const d = document.createElement('div')
        const w = 2 + Math.random() * 3
        const h = 6 + Math.random() * 10
        d.style.cssText = `
          position: absolute;
          background: var(--blood);
          border-radius: 0 0 50% 50%;
          opacity: 0;
          left: ${xPct}%;
          top: 0;
          width: ${w}px;
          height: ${h}px;
          animation: drip ${4 + Math.random() * 4}s ${Math.random() * 8}s ease-in infinite;
          --travel: ${60 + Math.random() * 80}px;
        `
        dropsRef.current!.appendChild(d)
      })
    }
  }, [])

  return (
    <>
      {/* Keyframes globales */}
      <style>{`
        @keyframes sporeFloat {
          0%   { opacity: 0; transform: translateY(0) translateX(0) scale(1); }
          15%  { opacity: 0.5; }
          85%  { opacity: 0.15; }
          100% { opacity: 0; transform: translateY(var(--vy, -120px)) translateX(var(--vx, 20px)) scale(0.4); }
        }
        @keyframes drip {
          0%   { opacity: 0; transform: translateY(0) scaleY(0.3); }
          8%   { opacity: 0.7; transform: translateY(0) scaleY(1); }
          85%  { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(var(--travel, 80px)) scaleY(1.4); }
        }
      `}</style>

      {/* Fondo base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 70% 55% at 50% 35%, #0f1a09 0%, transparent 65%),
          radial-gradient(ellipse 45% 35% at 10% 85%, #1a0808 0%, transparent 50%),
          radial-gradient(ellipse 35% 30% at 90% 75%, #0b1508 0%, transparent 50%),
          var(--bg)
        `
      }} />

 

      {/* Manchas de ambiente */}
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', opacity:0.07, width:'700px', height:'450px', background:'#2d5a22', top:'-80px', left:'-200px' }} />
      <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', opacity:0.07, width:'500px', height:'350px', background:'#7a1010', bottom:'50px', right:'-100px' }} />

      {/* Grietas SVG */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', opacity:0.15 }}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ width:'100%', height:'100%', position:'absolute' }}>
          <path d="M180 0 L200 90 L170 180 L215 320 L195 460" stroke="#4a7c3f" strokeWidth="1.5" fill="none"/>
          <path d="M200 90 L245 135 L228 195" stroke="#4a7c3f" strokeWidth="0.8" fill="none"/>
          <path d="M1250 80 L1230 190 L1260 360 L1240 520" stroke="#9b1c1c" strokeWidth="1.2" fill="none"/>
          <path d="M1260 360 L1295 400 L1278 465" stroke="#9b1c1c" strokeWidth="0.7" fill="none"/>
        </svg>
      </div>

      {/* Viñeta */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 25%, rgba(9,10,7,0.92) 100%)'
      }} />

      {/* Niebla inferior */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '260px',
        background: 'linear-gradient(to top, var(--bg), transparent)',
        zIndex: 2
      }} />

      {/* Esporas y gotas */}
      <div ref={sporesRef} style={{ position:'absolute', inset:0, zIndex:1 }} />
      <div ref={dropsRef} style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }} />
    </>
  )
}