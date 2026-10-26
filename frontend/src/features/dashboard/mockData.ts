import type { Estado } from '@/features/reclamos/estados'

/*
 * Escenario fijo para las capturas académicas. Todas las cifras y personas son
 * ficticias. Son respuestas de ejemplo, no cálculos de negocio del frontend.
 * Los contratos y cálculos reales se acordarán con backend y analítica.
 */
export const corte = '26 oct 2026'
export const periodo = 'Septiembre 2026'

export const reclamosActivos = {
  total: 342,
  sinAsignar: 48,
  etapas: [
    { label: 'Revisión inicial', value: 48 },
    { label: 'Gestión interna', value: 214 },
    { label: 'Esperando empresa', value: 80 },
  ],
  estados: [
    { label: 'Ingresado', value: 30 },
    { label: 'Pendiente de antecedentes', value: 18 },
    { label: 'Asignado', value: 54 },
    { label: 'En gestión', value: 160 },
    { label: 'Esperando respuesta de empresa', value: 80 },
  ],
}

export const cargaFuncionarios = [
  { nombre: 'Diego Muñoz', value: 72 },
  { nombre: 'Camila Rojas', value: 64 },
  { nombre: 'Valentina Soto', value: 58 },
  { nombre: 'Martín Vega', value: 50 },
  { nombre: 'Sofía Torres', value: 50 },
]

export const asignados = cargaFuncionarios.reduce(
  (total, funcionario) => total + funcionario.value,
  0,
)
export const resumenCarga = `${asignados} asignados · ${reclamosActivos.sinAsignar} sin asignar`

export const historialMensual = [
  { mes: 'May', resolucion: 21.2, cumplimiento: 76, cierres: 166 },
  { mes: 'Jun', resolucion: 20.1, cumplimiento: 79, cierres: 174 },
  { mes: 'Jul', resolucion: 18.9, cumplimiento: 81, cierres: 183 },
  { mes: 'Ago', resolucion: 18.1, cumplimiento: 83, cierres: 191 },
  { mes: 'Sep', resolucion: 16.4, cumplimiento: 87, cierres: 200 },
]

export const cierresPeriodo = {
  total: 200,
  enPlazo: 174,
  fueraDePlazo: 26,
  diasAcumulados: 3280,
}

export const meses = historialMensual.map((mes) => mes.mes)
export const mesAnterior =
  historialMensual[historialMensual.length - 2].mes.toLowerCase()

export const cumplimientoPlazos = {
  value: 87,
  delta: 4,
  serie: historialMensual.map((mes) => mes.cumplimiento),
}

export const tiempoResolucion = {
  value: 16.4,
  mejora: 1.7,
  serie: historialMensual.map((mes) => mes.resolucion),
}

export const alertasPlazo = { proximos: 28, vencidos: 19 }

export type ReclamoAtencion = {
  id: string
  mercado: string
  responsable: string
  estado: Estado
  dias: number
}

// Extracto de los 47 casos con alerta; no representa el conjunto completo.
const casos: ReclamoAtencion[] = [
  {
    id: 'R-2026-004790',
    mercado: 'Telecomunicaciones',
    responsable: 'Diego Muñoz',
    estado: 'esperando_empresa',
    dias: -5,
  },
  {
    id: 'R-2026-004812',
    mercado: 'Retail',
    responsable: 'Camila Rojas',
    estado: 'en_gestion',
    dias: 0,
  },
  {
    id: 'R-2026-004806',
    mercado: 'Educación',
    responsable: 'Martín Vega',
    estado: 'en_gestion',
    dias: 1,
  },
  {
    id: 'R-2026-004798',
    mercado: 'Mercado financiero',
    responsable: 'Valentina Soto',
    estado: 'asignado',
    dias: 2,
  },
  {
    id: 'R-2026-004775',
    mercado: 'Servicios básicos',
    responsable: 'Sin asignar',
    estado: 'pendiente_antecedentes',
    dias: 3,
  },
  {
    id: 'R-2026-004783',
    mercado: 'Transporte',
    responsable: 'Sofía Torres',
    estado: 'en_gestion',
    dias: -3,
  },
  {
    id: 'R-2026-004788',
    mercado: 'Salud',
    responsable: 'Valentina Soto',
    estado: 'esperando_empresa',
    dias: -2,
  },
  {
    id: 'R-2026-004801',
    mercado: 'Retail',
    responsable: 'Camila Rojas',
    estado: 'asignado',
    dias: -1,
  },
  {
    id: 'R-2026-004826',
    mercado: 'Turismo',
    responsable: 'Diego Muñoz',
    estado: 'en_gestion',
    dias: 3,
  },
  {
    id: 'R-2026-004821',
    mercado: 'Seguros',
    responsable: 'Camila Rojas',
    estado: 'asignado',
    dias: 1,
  },
  {
    id: 'R-2026-004779',
    mercado: 'Retail',
    responsable: 'Sofía Torres',
    estado: 'esperando_empresa',
    dias: -4,
  },
  {
    id: 'R-2026-004771',
    mercado: 'Telecomunicaciones',
    responsable: 'Martín Vega',
    estado: 'en_gestion',
    dias: -7,
  },
]

/** Más urgentes primero: fecha límite más cercana o más atrasada. */
export const requierenAtencion = [...casos].sort((a, b) => a.dias - b.dias)
