import { useAuth } from '@/features/auth/context'
import type { Perfil } from './perfiles'

export type PerfilContext = { perfil: Perfil }

export function usePerfil() {
  const { usuario } = useAuth()
  return usuario?.rol === 'funcionario' ? 'funcionario' : 'supervisor'
}
