import { cargaFuncionarios } from '@/features/dashboard/mockData'
import { PLAZO_DIAS, type Estado } from '@/features/reclamos/estados'
import type { DetalleReclamo } from '@/features/reclamos/detalle/detalle'
import { diaRelativo, fechaLarga, hoy, sumarDias } from '@/lib/fechas'

/*
 * Escenario ficticio de la funcionaria de la demo (Camila Rojas). Solo sus
 * casos: no es un ranking del equipo. Respuestas de ejemplo, no reglas.
 */

const NOMBRE = 'Camila Rojas'
const activos =
  cargaFuncionarios.find((persona) => persona.nombre === NOMBRE)?.value ?? 0

export const MIS_CASOS = {
  nombre: NOMBRE,
  activos,
  vencidos: 4,
  porVencer: 6,
  etapas: [
    {
      estado: 'asignado' as Estado,
      label: 'Asignados',
      hint: 'Por iniciar',
      value: 10,
    },
    {
      estado: 'en_gestion' as Estado,
      label: 'En gestión',
      hint: 'Usted está trabajando en ellos',
      value: 36,
    },
    {
      estado: 'esperando_empresa' as Estado,
      label: 'Esperando empresa',
      hint: 'Revise si respondieron',
      value: 18,
    },
  ],
}

export type CasoPrioritario = {
  id: string
  asunto: string
  empresa: string
  mercado: string
  estado: Estado
  dias: number
  paso: string
  respuestaEmpresa: boolean
}

/** Los casos que conviene mover primero, ordenados por plazo. */
export const PRIORIDAD: CasoPrioritario[] = [
  {
    id: 'R-2026-004781',
    asunto: 'Garantía rechazada sin revisión',
    empresa: 'Electro Norte',
    mercado: 'Retail',
    estado: 'en_gestion',
    dias: -2,
    paso: 'Informar resultado',
    respuestaEmpresa: true,
  },
  {
    id: 'R-2026-004812',
    asunto: 'Devolución por producto defectuoso',
    empresa: 'Tienda Brisa',
    mercado: 'Retail',
    estado: 'en_gestion',
    dias: 0,
    paso: 'Informar resultado',
    respuestaEmpresa: true,
  },
  {
    id: 'R-2026-004840',
    asunto: 'Comisión no pactada',
    empresa: 'Banco Austral',
    mercado: 'Mercado financiero',
    estado: 'esperando_empresa',
    dias: 1,
    paso: 'Registrar respuesta',
    respuestaEmpresa: false,
  },
  {
    id: 'R-2026-004857',
    asunto: 'Plan móvil cambiado sin aviso',
    empresa: 'Móvil Pacífico',
    mercado: 'Telecomunicaciones',
    estado: 'en_gestion',
    dias: 3,
    paso: 'Pedir respuesta a la empresa',
    respuestaEmpresa: false,
  },
  {
    id: 'R-2026-004862',
    asunto: 'Envío incompleto',
    empresa: 'Tienda Brisa',
    mercado: 'Retail',
    estado: 'esperando_empresa',
    dias: 5,
    paso: 'Registrar respuesta',
    respuestaEmpresa: false,
  },
  {
    id: 'R-2026-004866',
    asunto: 'Cobro por reconexión',
    empresa: 'Energía Elqui',
    mercado: 'Servicios básicos',
    estado: 'en_gestion',
    dias: 6,
    paso: 'Pedir respuesta a la empresa',
    respuestaEmpresa: false,
  },
  {
    id: 'R-2026-004869',
    asunto: 'Cobro tras anular suscripción',
    empresa: 'Instituto Vértice',
    mercado: 'Educación',
    estado: 'en_gestion',
    dias: 9,
    paso: 'Informar resultado',
    respuestaEmpresa: true,
  },
  {
    id: 'R-2026-005142',
    asunto: 'Compra web sin entregar',
    empresa: 'Tienda Brisa',
    mercado: 'Retail',
    estado: 'asignado',
    dias: 18,
    paso: 'Analizar caso',
    respuestaEmpresa: false,
  },
]

/** Ficha de un caso de la funcionaria que no está en el listado de prueba. */
export function casoDeFuncionaria(id: string): DetalleReclamo | null {
  const cerrado = CERRADOS.find((item) => item.id === id)
  if (cerrado) return casoCerrado(cerrado)
  const caso = PRIORIDAD.find((item) => item.id === id)
  if (!caso) return null
  const ingreso = caso.dias - PLAZO_DIAS
  const historial: DetalleReclamo['historial'] = [
    {
      fecha: diaRelativo(ingreso),
      titulo: 'Ingresó por el portal',
      detalle: 'Antecedentes del consumidor recibidos',
      tipo: 'sistema',
    },
    {
      fecha: diaRelativo(ingreso + 1),
      titulo: `Asignado a ${NOMBRE}`,
      detalle: 'Andrea Fuentes',
      tipo: 'gestion',
    },
  ]
  if (caso.estado !== 'asignado')
    historial.push({
      fecha: diaRelativo(ingreso + 3),
      titulo: `Solicitud enviada a ${caso.empresa}`,
      detalle: 'Esperando respuesta de empresa',
      tipo: 'empresa',
    })
  if (caso.respuestaEmpresa)
    historial.push({
      fecha: diaRelativo(ingreso + 10),
      titulo: 'La empresa respondió',
      detalle: 'Respuesta registrada en el caso',
      tipo: 'empresa',
    })
  return {
    id: caso.id,
    asunto: caso.asunto,
    empresa: caso.empresa,
    mercado: caso.mercado,
    comuna: 'La Serena',
    consumidor: 'Consumidor de prueba',
    relato: 'Relato del consumidor (dato de prueba).',
    estado: caso.estado,
    responsableId: 'camila-rojas',
    responsable: NOMBRE,
    dias: caso.dias,
    fechaIngreso: fechaLarga(sumarDias(hoy(), ingreso)),
    fechaLimite: fechaLarga(sumarDias(hoy(), caso.dias)),
    adjuntos: [],
    historial,
    respuestaEmpresa: caso.respuestaEmpresa,
  }
}

/** Cierres del mes de la funcionaria (KPI 1 y 3, solo sus casos). */
export const MI_MES = {
  cierres: 24,
  enPlazo: 21,
  resolucion: [18.2, 17.5, 16.9, 16.0, 15.2],
}

export type Resultado = 'total' | 'parcial' | 'sin_solucion'

export const RESULTADOS: Record<Resultado, string> = {
  total: 'Solución total',
  parcial: 'Solución parcial',
  sin_solucion: 'Sin solución',
}

type Cerrado = {
  id: string
  asunto: string
  resultado: Resultado
  diasGestion: number
  enPlazo: boolean
}

const RECIENTES: Cerrado[] = [
  {
    id: 'R-2026-004777',
    asunto: 'Cobro de cuota ya pagada',
    resultado: 'total',
    diasGestion: 14,
    enPlazo: true,
  },
  {
    id: 'R-2026-004760',
    asunto: 'Producto distinto al comprado',
    resultado: 'parcial',
    diasGestion: 19,
    enPlazo: true,
  },
  {
    id: 'R-2026-004741',
    asunto: 'Corte de servicio sin aviso',
    resultado: 'sin_solucion',
    diasGestion: 23,
    enPlazo: false,
  },
  {
    id: 'R-2026-004735',
    asunto: 'Reembolso de matrícula',
    resultado: 'total',
    diasGestion: 11,
    enPlazo: true,
  },
  {
    id: 'R-2026-004729',
    asunto: 'Cargo duplicado en tarjeta',
    resultado: 'total',
    diasGestion: 9,
    enPlazo: true,
  },
]

const ASUNTOS_CERRADOS = [
  'Despacho no realizado',
  'Garantía no respetada',
  'Cambio de plan sin aviso',
  'Cobro de intereses no informados',
  'Devolución de pasaje',
  'Producto sin stock tras el pago',
  'Medidor cambiado sin aviso',
  'Seguro cobrado sin contratar',
  'Reembolso por vuelo cancelado',
  'Cuota de mantención no pactada',
  'Servicio técnico sin respuesta',
  'Promoción no respetada',
  'Boleta con cargo duplicado',
  'Cancelación de suscripción ignorada',
  'Arriendo de equipo cobrado',
  'Producto usado vendido como nuevo',
  'Retención de garantía',
  'Envío con productos faltantes',
  'Cobro tras dar de baja el servicio',
]
const RESULTADOS_CICLO: Resultado[] = [
  'total',
  'parcial',
  'total',
  'sin_solucion',
]

/**
 * Los cierres del mes completos (MI_MES): los recientes más el resto, con
 * 3 fuera de plazo en total para que cuadre con el anillo de KPI 3.
 */
export const CERRADOS: Cerrado[] = [
  ...RECIENTES,
  ...ASUNTOS_CERRADOS.map((asunto, index) => ({
    id: `R-2026-${String(4726 - index * 3).padStart(6, '0')}`,
    asunto,
    resultado: RESULTADOS_CICLO[index % RESULTADOS_CICLO.length],
    diasGestion: 8 + ((index * 5) % 12),
    enPlazo: index !== 6 && index !== 14,
  })),
]

function casoCerrado(caso: (typeof CERRADOS)[number]): DetalleReclamo {
  const ingreso = -caso.diasGestion - 2
  const cierre = ingreso + caso.diasGestion
  return {
    id: caso.id,
    asunto: caso.asunto,
    empresa: 'Empresa de prueba',
    mercado: 'Retail',
    comuna: 'Coquimbo',
    consumidor: 'Consumidor de prueba',
    relato: 'Relato del consumidor (dato de prueba).',
    estado: 'cerrado',
    responsableId: 'camila-rojas',
    responsable: NOMBRE,
    dias: null,
    fechaIngreso: fechaLarga(sumarDias(hoy(), ingreso)),
    fechaLimite: fechaLarga(sumarDias(hoy(), ingreso + PLAZO_DIAS)),
    adjuntos: [],
    respuestaEmpresa: true,
    historial: [
      {
        fecha: diaRelativo(ingreso),
        titulo: 'Ingresó por el portal',
        detalle: 'Antecedentes del consumidor recibidos',
        tipo: 'sistema',
      },
      {
        fecha: diaRelativo(ingreso + 1),
        titulo: `Asignado a ${NOMBRE}`,
        detalle: 'Andrea Fuentes',
        tipo: 'gestion',
      },
      {
        fecha: diaRelativo(cierre),
        titulo: `Caso cerrado · ${RESULTADOS[caso.resultado]}`,
        detalle: caso.enPlazo ? 'Dentro de plazo' : 'Fuera de plazo',
        tipo: 'gestion',
      },
    ],
  }
}
