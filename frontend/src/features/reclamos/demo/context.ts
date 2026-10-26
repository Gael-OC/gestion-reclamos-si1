import { createContext, useContext } from 'react'
import type { reclamosActivos } from '@/features/dashboard/mockData'
import type { NuevoReclamoDatos, ReclamoListado } from '../listado/model'

type ReclamosDemo = {
  reclamos: ReclamoListado[]
  activos: typeof reclamosActivos
  resumenCarga: string
  registrar: (datos: NuevoReclamoDatos) => ReclamoListado
}

export const ReclamosDemoContext = createContext<ReclamosDemo | null>(null)

export function useReclamosDemo() {
  const context = useContext(ReclamosDemoContext)
  if (!context) throw new Error('La demo de reclamos requiere su proveedor')
  return context
}
