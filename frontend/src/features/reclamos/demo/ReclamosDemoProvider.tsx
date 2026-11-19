import { useReducer, useRef, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/context'
import type { AdjuntoCliente, EventoCliente } from '@/features/cliente/model'
import { fechaISO, hoy } from '@/lib/fechas'
import type { EventoHistorial } from '../detalle/detalle'
import type { NuevoReclamoDatos } from '../listado/model'
import { ReclamosDemoContext, type CambioGestion } from './context'
import {
  crearReclamoDemo,
  estadoInicialDemo,
  modeloDemo,
  reducirDemo,
  folioInicialDemo,
} from './model'

export function ReclamosDemoProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const [estado, dispatch] = useReducer(
    reducirDemo,
    undefined,
    estadoInicialDemo,
  )
  const modelo = modeloDemo(estado, usuario)
  const siguienteFolio = useRef(folioInicialDemo())

  function registrar(datos: NuevoReclamoDatos) {
    if (!usuario || usuario.rol === 'funcionario')
      throw new Error('No se puede registrar desde esta sesión')
    const reclamo = crearReclamoDemo(datos, usuario, siguienteFolio.current)
    siguienteFolio.current += 1
    dispatch({ tipo: 'registrar', usuario, reclamo })
    return reclamo
  }

  function registrarGestion(
    id: string,
    evento: EventoHistorial,
    cambio: CambioGestion = {},
  ) {
    const accion = {
      tipo: 'gestionar' as const,
      usuario,
      id,
      evento: { ...evento, registradoEn: Date.now() },
      cambio,
    }
    if (reducirDemo(estado, accion) === estado) return false
    dispatch(accion)
    return true
  }

  function aportarAntecedentes(
    id: string,
    texto: string,
    adjuntos: AdjuntoCliente[],
  ) {
    const evento: EventoCliente = {
      id: crypto.randomUUID(),
      registradoEn: Date.now(),
      fecha: fechaISO(hoy()),
      titulo: 'Antecedentes enviados',
      descripcion: texto.trim(),
      tipo: 'antecedentes',
      adjuntos,
    }
    const accion = { tipo: 'aportar' as const, usuario, id, evento }
    if (reducirDemo(estado, accion) === estado) return false
    dispatch(accion)
    return true
  }

  return (
    <ReclamosDemoContext.Provider
      value={{ ...modelo, registrar, registrarGestion, aportarAntecedentes }}
    >
      {children}
    </ReclamosDemoContext.Provider>
  )
}
