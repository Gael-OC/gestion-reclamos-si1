import { useOutletContext } from 'react-router'
import type { Perfil } from './perfiles'

export type PerfilContext = { perfil: Perfil }

/** Perfil activo de la demo, entregado por AppLayout a sus vistas. */
export function usePerfil() {
  return useOutletContext<PerfilContext | undefined>()?.perfil ?? 'supervisor'
}
