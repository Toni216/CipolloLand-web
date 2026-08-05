import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import ListaSugerencias from './components/ListaSugerencias'

export default async function SugerenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string }>
}) {
  const session = await auth()
  const { orden } = await searchParams
  const ordenActivo = orden === 'recientes' ? 'recientes' : 'votos'

  const temporada = await prisma.temporadas.findFirst({ where: { slug: 't3' } })

  const sugerenciasRaw = temporada
    ? await prisma.sugerencias.findMany({
        where: { temporada_id: temporada.id },
        include: {
          users: { select: { username: true } },
          sugerencia_votos: { select: { user_id: true } },
        },
        orderBy: ordenActivo === 'votos'
          ? [{ sugerencia_votos: { _count: 'desc' } }, { created_at: 'desc' }]
          : { created_at: 'desc' },
      })
    : []

  const sugerencias = sugerenciasRaw.map(s => ({
    id: s.id,
    titulo: s.titulo,
    descripcion: s.descripcion,
    estado: s.estado,
    editado: s.editado,
    created_at: s.created_at,
    username: s.users?.username ?? null,
    esPropia: s.user_id === session?.user?.id,
    votos: s.sugerencia_votos.length,
    yaVote: session?.user?.id ? s.sugerencia_votos.some(v => v.user_id === session.user!.id) : false,
    puedeEditar: s.user_id === session?.user?.id &&
      (Date.now() - s.created_at.getTime()) < 1000 * 60 * 60 * 24,
    puedeBorrar: s.user_id === session?.user?.id &&
      ['pendiente', 'descartado'].includes(s.estado),
  }))

  return (
    <div style={{ paddingTop: '114px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 32px 100px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontSize: '10px', letterSpacing: '0.28em',
            textTransform: 'uppercase' as const,
            color: 'var(--green-bright)', opacity: 0.75,
            marginBottom: '8px', fontWeight: 600
          }}>
            3ª edición · Apocalipsis
          </div>
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '48px', color: 'var(--bone)',
            letterSpacing: '0.04em', lineHeight: 1,
            marginBottom: '8px'
          }}>
            Sugerencias
          </h1>
          <p style={{
            fontFamily: 'var(--font-special-elite)',
            fontSize: '13px', color: 'var(--text-mid)',
            lineHeight: 1.8
          }}>
            Propón ideas para el servidor y vota las de los demás.
          </p>
        </div>

        <ListaSugerencias
          sugerencias={sugerencias}
          haySesion={!!session?.user?.id}
          ordenActivo={ordenActivo}
        />
      </div>
    </div>
  )
}