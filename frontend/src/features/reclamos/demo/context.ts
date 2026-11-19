import { createContext, useContext } from 'react'
import type { reclamosActivos } from '@/features/dashboard/mockData'
import type { NuevoReclamoDatos, ReclamoListado } from '../listado/model'
import type { AdjuntoCliente, EventoCliente } from '@/features/cliente/model'
import type { DetalleReclamo, EventoHistorial } from '../detalle/detalle'

export type CambioGestion = Partial<
  Pick<DetalleReclamo, 'estado' | 'respuestaEmpresa' | 'responsableId'>
> & { resultado?: string }

type ReclamosDemo = {
  reclamos: ReclamoListado[]
  activos: typeof reclamosActivos
  resumenCarga: string
  registrar: (datos: NuevoReclamoDatos) => ReclamoListado
  historicoCliente: ReclamoListado[]
  seguimiento: (reclamo: ReclamoListado) => EventoCliente[]
  detalle: (id: string) => DetalleReclamo | null
  registrarGestion: (
    id: string,
    evento: EventoHistorial,
    cambio?: CambioGestion,
  ) => boolean
  aportarAntecedentes: (
    id: string,
    texto: string,
    adjuntos: AdjuntoCliente[],
  ) => boolean
}

export const ReclamosDemoContext = createContext<ReclamosDemo | null>(null)

export function useReclamosDemo() {
  const context = useContext(ReclamosDemoContext)
  if (!context) throw new Error('La demo de reclamos requiere su proveedor')
  return context
}
