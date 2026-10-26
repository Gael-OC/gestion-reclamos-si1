import {
  alertasPlazo,
  cargaFuncionarios,
  reclamosActivos,
  requierenAtencion,
} from '@/features/dashboard/mockData'
import { crearDemoListado } from './crearDemo'

export const FECHA_REFERENCIA = '2026-10-26'
const demo = crearDemoListado({
  fechaReferencia: FECHA_REFERENCIA,
  estados: reclamosActivos.estados,
  funcionarios: cargaFuncionarios,
  alertas: alertasPlazo,
  muestras: requierenAtencion,
})
export const RECLAMOS_DEMO = demo.reclamos
export const RESPONSABLES = demo.responsables
export const USUARIO_DEMO = 'camila-rojas'
export const MERCADOS = [
  ...new Set(RECLAMOS_DEMO.map((row) => row.mercado)),
].sort((a, b) => a.localeCompare(b, 'es-CL'))
