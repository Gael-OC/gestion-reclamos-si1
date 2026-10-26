import { useRef, useState, type ReactNode } from 'react'
import { asignados, reclamosActivos } from '@/features/dashboard/mockData'
import { FECHA_REFERENCIA, RECLAMOS_DEMO } from '../listado/mockData'
import type { NuevoReclamoDatos, ReclamoListado } from '../listado/model'
import { ReclamosDemoContext } from './context'

export function ReclamosDemoProvider({ children }: { children: ReactNode }) {
  const [creados, setCreados] = useState<ReclamoListado[]>([])
  const siguienteFolio = useRef(
    Math.max(...RECLAMOS_DEMO.map((row) => Number(row.id.split('-').at(-1)))) +
      1,
  )
  const cantidad = creados.length
  const activos = {
    ...reclamosActivos,
    total: reclamosActivos.total + cantidad,
    sinAsignar: reclamosActivos.sinAsignar + cantidad,
    etapas: reclamosActivos.etapas.map((etapa, index) => ({
      ...etapa,
      value: etapa.value + (index === 0 ? cantidad : 0),
    })),
    estados: reclamosActivos.estados.map((estado, index) => ({
      ...estado,
      value: estado.value + (index === 0 ? cantidad : 0),
    })),
  }

  function registrar(datos: NuevoReclamoDatos) {
    const reclamo: ReclamoListado = {
      ...datos,
      id: `R-2026-${String(siguienteFolio.current).padStart(6, '0')}`,
      estado: 'ingresado',
      responsableId: null,
      fechaIngreso: FECHA_REFERENCIA,
      fechaLimite: '2026-11-15',
      diasRestantes: 20,
      atencion: 'en_plazo',
    }
    siguienteFolio.current += 1
    setCreados((prev) => [reclamo, ...prev])
    return reclamo
  }

  return (
    <ReclamosDemoContext.Provider
      value={{
        reclamos: [...creados, ...RECLAMOS_DEMO],
        activos,
        resumenCarga: `${asignados} asignados · ${activos.sinAsignar} sin asignar`,
        registrar,
      }}
    >
      {children}
    </ReclamosDemoContext.Provider>
  )
}
