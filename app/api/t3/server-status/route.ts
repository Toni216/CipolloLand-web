import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const config = await prisma.season_server_configs.findFirst({
    where: { temporadas: { slug: 't3' } },
    select: { server_ip: true }
  })

  if (!config?.server_ip) {
    return NextResponse.json({ online: false })
  }

  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${config.server_ip}`)
    const data = await res.json()
    return NextResponse.json({
      online: data.online ?? false,
      players: data.players ?? null
    })
  } catch {
    return NextResponse.json({ online: false })
  }
}