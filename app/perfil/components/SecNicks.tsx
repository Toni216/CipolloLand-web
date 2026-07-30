import Placeholder from '../ajustes/components/Placeholder'
export default function SecNicks({ usuario }: { usuario: { minecraft_username: string | null } }) {
  return <Placeholder titulo="Historial de Nicks" sub={`Nick actual: ${usuario.minecraft_username ?? 'Sin configurar'}`} />
}