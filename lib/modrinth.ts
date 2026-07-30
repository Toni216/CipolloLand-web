const MODRINTH_API = 'https://api.modrinth.com/v2'

interface ModrinthVersionFile {
  project_id: string
  version_id: string
}

interface ModrinthProject {
  id: string
  slug: string
  title: string
  description: string
  icon_url: string | null
  categories: string[]
}

// Dado un mapa hash -> nombre de archivo, devuelve hash -> project_id
export async function resolveProjectIds(hashes: string[]): Promise<Record<string, ModrinthVersionFile>> {
  if (hashes.length === 0) return {}

  const res = await fetch(`${MODRINTH_API}/version_files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hashes, algorithm: 'sha1' }),
  })

  if (!res.ok) {
    throw new Error(`Modrinth version_files falló: ${res.status}`)
  }

  return res.json()
}

// Dado un array de project_ids, devuelve los datos completos de cada proyecto
export async function fetchProjects(ids: string[]): Promise<ModrinthProject[]> {
  if (ids.length === 0) return []

  const idsParam = encodeURIComponent(JSON.stringify(ids))
  const res = await fetch(`${MODRINTH_API}/projects?ids=${idsParam}`)

  if (!res.ok) {
    throw new Error(`Modrinth projects falló: ${res.status}`)
  }

  return res.json()
}

// Traduce las categorías de Modrinth (en inglés, muchas por proyecto)
// a una única categoría en español para mostrar en la web.
const CATEGORIA_MAP: Record<string, string> = {
  adventure: 'Aventura',
  cursed: 'Curiosidades',
  decoration: 'Decoración',
  economy: 'Economía',
  equipment: 'Equipamiento',
  food: 'Comida',
  'game-mechanics': 'Mecánicas de juego',
  library: 'Librería',
  magic: 'Magia',
  management: 'Gestión',
  minigame: 'Minijuego',
  mobs: 'Criaturas',
  optimization: 'Optimización',
  social: 'Social',
  storage: 'Almacenamiento',
  technology: 'Tecnología',
  transportation: 'Transporte',
  utility: 'Utilidad',
  worldgen: 'Generación de mundo',
}

export function mapCategorias(categories: string[]): string[] {
  const resultado = new Set<string>()
  for (const cat of categories) {
    if (CATEGORIA_MAP[cat]) resultado.add(CATEGORIA_MAP[cat])
  }
  return resultado.size > 0 ? [...resultado] : ['Sin categoría']
}

export function toPgTextArray(arr: string[] | null): string | null {
  if (!arr || arr.length === 0) return null
  return `{${arr.map(v => `"${v.replace(/"/g, '\\"')}"`).join(',')}}`
}