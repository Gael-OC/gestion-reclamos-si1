import {
  alertasPlazo,
  cargaFuncionarios,
  reclamosActivos,
} from '@/features/dashboard/mockData'
import {
  MERCADOS,
  RECLAMOS_DEMO,
  RESPONSABLES,
} from '@/features/reclamos/listado/mockData'

/*
 * Escenario ficticio de las vistas del supervisor. Las cifras totales salen de
 * `dashboard/mockData.ts`; aquí solo se agrega el detalle que esas vistas
 * necesitan. Son respuestas de ejemplo, no reglas de negocio del frontend.
 */

/** Casos en riesgo por funcionario (KPI 4 y 6 desglosados). */
const RIESGO: Record<string, { porVencer: number; vencidos: number }> = {
  'Diego Muñoz': { porVencer: 8, vencidos: 7 },
  'Camila Rojas': { porVencer: 6, vencidos: 4 },
  'Valentina Soto': { porVencer: 5, vencidos: 3 },
  'Martín Vega': { porVencer: 4, vencidos: 2 },
  'Sofía Torres': { porVencer: 3, vencidos: 1 },
}

export type Funcionario = {
  id: string
  nombre: string
  activos: number
  porVencer: number
  vencidos: number
}

export const EQUIPO: Funcionario[] = cargaFuncionarios.map(
  ({ nombre, value }) => ({
    id: RESPONSABLES.find((item) => item.nombre === nombre)?.id ?? nombre,
    nombre,
    activos: value,
    ...(RIESGO[nombre] ?? { porVencer: 0, vencidos: 0 }),
  }),
)

const enRiesgoEquipo = (campo: 'porVencer' | 'vencidos') =>
  EQUIPO.reduce((total, persona) => total + persona[campo], 0)

/** Casos sin responsable que también están vencidos o por vencer. */
export const SIN_ASIGNAR = {
  total: reclamosActivos.sinAsignar,
  ingresados: reclamosActivos.estados[0].value,
  pendientes: reclamosActivos.estados[1].value,
  vencidos: alertasPlazo.vencidos - enRiesgoEquipo('vencidos'),
  porVencer: alertasPlazo.proximos - enRiesgoEquipo('porVencer'),
}

export const PROMEDIO_CARGA =
  EQUIPO.reduce((total, persona) => total + persona.activos, 0) / EQUIPO.length

export type IngresoBandeja = {
  id: string
  asunto: string
  empresa: string
  mercado: string
  comuna: string
  consumidor: string
  relato: string
  adjuntos: string[]
  /** Días hasta la fecha límite. */
  dias: number
  tipo: 'nuevo' | 'antecedentes'
}

/** Muestra de la bandeja de revisión (30 nuevos y 4 con antecedentes). */
const NOMBRES_CONSUMIDOR = [
  'Rodrigo Álvarez',
  'Josefa Araya',
  'Matías Rivera',
  'Daniela Cortés',
  'Felipe Rojas',
  'Carolina Pérez',
  'Ignacia Muñoz',
  'Tomás Contreras',
]

function aIngreso(
  row: (typeof RECLAMOS_DEMO)[number],
  index: number,
  tipo: IngresoBandeja['tipo'],
): IngresoBandeja {
  return {
    id: row.id,
    asunto: row.asunto,
    empresa: row.empresa,
    mercado: row.mercado,
    comuna: row.comuna,
    consumidor: NOMBRES_CONSUMIDOR[index % NOMBRES_CONSUMIDOR.length],
    relato:
      row.descripcion ??
      `${row.asunto}. Pedí una solución a ${row.empresa} y no obtuve respuesta.`,
    adjuntos:
      tipo === 'antecedentes'
        ? ['Antecedentes enviados.pdf', 'Comprobante.pdf']
        : index % 3 === 0
          ? []
          : ['Comprobante.pdf'],
    dias: row.diasRestantes ?? 0,
    tipo,
  }
}

/** Con antecedentes ya entregados por el consumidor (vuelven a revisión). */
const ANTECEDENTES_RECIBIDOS = 4

/**
 * Bandeja de revisión completa, tomada del listado de prueba para que los
 * folios coincidan: los reclamos ingresados y los que ya recibieron los
 * antecedentes pedidos. Primero los de menor plazo restante.
 */
export const BANDEJA = {
  nuevos: SIN_ASIGNAR.ingresados,
  antecedentes: ANTECEDENTES_RECIBIDOS,
  ingresos: [
    ...RECLAMOS_DEMO.filter((row) => row.estado === 'ingresado').map(
      (row, index) => aIngreso(row, index, 'nuevo'),
    ),
    ...RECLAMOS_DEMO.filter((row) => row.estado === 'pendiente_antecedentes')
      .slice(0, ANTECEDENTES_RECIBIDOS)
      .map((row, index) => aIngreso(row, index + 3, 'antecedentes')),
  ].sort((a, b) => a.dias - b.dias),
}

export type UsuarioInterno = {
  id: string
  nombre: string
  correo: string
  perfil: 'supervisor' | 'funcionario'
  activo: boolean
  casos?: number
}

const correo = (nombre: string) =>
  `${nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.')}@unidad.test`

export const USUARIOS_INTERNOS: UsuarioInterno[] = [
  {
    id: 'andrea-fuentes',
    nombre: 'Andrea Fuentes',
    correo: correo('Andrea Fuentes'),
    perfil: 'supervisor',
    activo: true,
  },
  ...EQUIPO.map((persona) => ({
    id: persona.id,
    nombre: persona.nombre,
    correo: correo(persona.nombre),
    perfil: 'funcionario' as const,
    activo: true,
    casos: persona.activos,
  })),
  {
    id: 'pablo-rios',
    nombre: 'Pablo Ríos',
    correo: correo('Pablo Ríos'),
    perfil: 'funcionario',
    activo: false,
    casos: 0,
  },
]

/** Cuentas de consumidores creadas en el portal (ficticio). */
export const CONSUMIDORES = 128

export const COMUNAS_REGION = [
  'La Serena',
  'Coquimbo',
  'Ovalle',
  'Illapel',
  'Vicuña',
  'Andacollo',
  'Salamanca',
  'Los Vilos',
  'Combarbalá',
  'Monte Patria',
  'Punitaqui',
  'Río Hurtado',
  'Canela',
  'La Higuera',
  'Paihuano',
]

export const CATALOGOS = {
  empresas: [...new Set(RECLAMOS_DEMO.map((row) => row.empresa))].sort((a, b) =>
    a.localeCompare(b, 'es-CL'),
  ),
  mercados: MERCADOS,
  comunas: COMUNAS_REGION,
}
