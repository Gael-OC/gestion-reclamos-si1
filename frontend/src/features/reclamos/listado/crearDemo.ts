import type { Estado } from '../estados'
import type { ReclamoListado } from './model'

type EscenarioDemo = {
  fechaReferencia: string
  estados: { label: string; value: number }[]
  funcionarios: { nombre: string; value: number }[]
  alertas: { proximos: number; vencidos: number }
  muestras: {
    id: string
    mercado: string
    responsable: string
    estado: Estado
    dias: number
  }[]
}

const estadosActivos: [Estado, string][] = [
  ['ingresado', 'Ingresado'],
  ['pendiente_antecedentes', 'Pendiente de antecedentes'],
  ['asignado', 'Asignado'],
  ['en_gestion', 'En gestión'],
  ['esperando_empresa', 'Esperando respuesta de empresa'],
]

const mercadosDemo = [
  {
    mercado: 'Telecomunicaciones',
    empresa: 'Conecta Norte',
    asunto: 'Cobro posterior al término del contrato',
  },
  {
    mercado: 'Retail',
    empresa: 'Tienda Horizonte',
    asunto: 'Solicitud de devolución pendiente',
  },
  {
    mercado: 'Mercado financiero',
    empresa: 'Financiera Cordillera',
    asunto: 'Cobro de mantención no informado',
  },
  {
    mercado: 'Servicios básicos',
    empresa: 'Energía del Valle',
    asunto: 'Revisión de consumo facturado',
  },
  {
    mercado: 'Transporte',
    empresa: 'Transportes Bahía',
    asunto: 'Devolución de pasaje pendiente',
  },
  {
    mercado: 'Educación',
    empresa: 'Academia Horizonte',
    asunto: 'Devolución de matrícula pendiente',
  },
  {
    mercado: 'Salud',
    empresa: 'Centro Brisa',
    asunto: 'Cobro de prestación no realizada',
  },
  {
    mercado: 'Seguros',
    empresa: 'Protección del Valle',
    asunto: 'Respuesta a solicitud de cobertura',
  },
  {
    mercado: 'Turismo',
    empresa: 'Viajes Costa',
    asunto: 'Reembolso de reserva pendiente',
  },
]
const comunas = [
  'La Serena',
  'Coquimbo',
  'Ovalle',
  'Illapel',
  'Vicuña',
  'Monte Patria',
]

export function crearDemoListado(escenario: EscenarioDemo) {
  const responsables = escenario.funcionarios.map(({ nombre }) => ({
    id: nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-'),
    nombre,
  }))
  const pendientesPorEstado = new Map(
    estadosActivos.map(([estado, label]) => {
      const objetivo = escenario.estados.find((item) => item.label === label)
      if (!objetivo) throw new Error(`Falta el estado de prueba ${label}`)
      return [estado, objetivo.value]
    }),
  )
  const pendientesPorResponsable = new Map(
    escenario.funcionarios.map((item) => [item.nombre, item.value]),
  )
  const alertasPendientes = { ...escenario.alertas }
  const referencia = Date.parse(`${escenario.fechaReferencia}T00:00:00Z`)
  if (!Number.isFinite(referencia))
    throw new Error('Fecha de referencia de prueba inválida')
  const fechaSintetica = (offset: number) =>
    new Date(referencia + offset * 86_400_000).toISOString().slice(0, 10)

  function prepararCaso(
    id: string,
    estado: Estado,
    responsableId: string | null,
    mercado: string,
    dias: number,
    index: number,
  ): ReclamoListado {
    const plantilla = mercadosDemo.find((item) => item.mercado === mercado)
    if (!plantilla)
      throw new Error(`Falta plantilla para el mercado de prueba ${mercado}`)
    const estadoPendiente = pendientesPorEstado.get(estado) ?? 0
    if (estadoPendiente <= 0)
      throw new Error(`Se excedió la muestra del estado ${estado}`)
    pendientesPorEstado.set(estado, estadoPendiente - 1)
    if (responsableId) {
      const persona = responsables.find((item) => item.id === responsableId)
      const restantes = persona
        ? (pendientesPorResponsable.get(persona.nombre) ?? 0)
        : 0
      if (!persona || restantes <= 0)
        throw new Error('Carga de responsable de prueba inconsistente')
      pendientesPorResponsable.set(persona.nombre, restantes - 1)
    }
    const atencion =
      dias < 0 ? 'vencido' : dias <= 3 ? 'por_vencer' : 'en_plazo'
    if (atencion === 'vencido') alertasPendientes.vencidos -= 1
    if (atencion === 'por_vencer') alertasPendientes.proximos -= 1
    return {
      id,
      asunto: plantilla.asunto,
      empresa: plantilla.empresa,
      mercado,
      comuna: comunas[index % comunas.length],
      responsableId,
      estado,
      fechaIngreso: fechaSintetica(dias - 20),
      fechaLimite: fechaSintetica(dias),
      diasRestantes: dias,
      atencion,
    }
  }

  const reclamos = escenario.muestras.map((muestra, index) => {
    const persona = responsables.find(
      (item) => item.nombre === muestra.responsable,
    )
    if (!persona && muestra.responsable !== 'Sin asignar')
      throw new Error('Responsable de muestra desconocido')
    return prepararCaso(
      muestra.id,
      muestra.estado,
      persona?.id ?? null,
      muestra.mercado,
      muestra.dias,
      index,
    )
  })
  const ids = new Set(reclamos.map((row) => row.id))
  let folio = 5000
  let index = 0
  for (const [estado] of estadosActivos) {
    const restantes = pendientesPorEstado.get(estado) ?? 0
    for (let item = 0; item < restantes; item += 1) {
      let id: string
      do {
        id = `R-2026-${String(folio).padStart(6, '0')}`
        folio += 1
      } while (ids.has(id))
      const sinAsignar =
        estado === 'ingresado' || estado === 'pendiente_antecedentes'
      const persona = sinAsignar
        ? undefined
        : Array.from(
            { length: responsables.length },
            (_, offset) => responsables[(index + offset) % responsables.length],
          ).find(
            (candidate) =>
              (pendientesPorResponsable.get(candidate.nombre) ?? 0) > 0,
          )
      if (!sinAsignar && !persona)
        throw new Error('Falta carga disponible en los datos de prueba')
      const dias =
        alertasPendientes.vencidos > 0 && index % 7 === 0
          ? -(1 + (Math.floor(index / 7) % 7))
          : alertasPendientes.proximos > 0 && index % 4 === 0
            ? Math.floor(index / 4) % 4
            : 4 + (index % 17)
      reclamos.push(
        prepararCaso(
          id,
          estado,
          persona?.id ?? null,
          mercadosDemo[index % mercadosDemo.length].mercado,
          dias,
          index,
        ),
      )
      ids.add(id)
      index += 1
    }
  }
  if (
    alertasPendientes.proximos !== 0 ||
    alertasPendientes.vencidos !== 0 ||
    [...pendientesPorResponsable.values()].some((value) => value !== 0)
  ) {
    throw new Error(
      'La cartera de prueba no coincide con las alertas y cargas de main',
    )
  }
  return { reclamos, responsables }
}
