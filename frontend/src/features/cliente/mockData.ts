import {
  RECLAMOS_DEMO,
  RESPONSABLES,
} from '@/features/reclamos/listado/mockData'
import type { ReclamoListado } from '@/features/reclamos/listado/model'
import type { EventoCliente } from './model'
import { eventosPublicos } from './model'
import {
  CASO_EJEMPLO,
  detalleReclamo,
  type EventoHistorial,
} from '@/features/reclamos/detalle/detalle'
import { fechaISO, hoy, sumarDias } from '@/lib/fechas'

const perfiles = [
  { estado: 'pendiente_antecedentes', clienteId: 'cliente-fernanda' },
  { estado: 'esperando_empresa', clienteId: 'cliente-fernanda' },
  { estado: 'en_gestion', clienteId: 'cliente-valentina' },
  { estado: 'asignado', clienteId: 'cliente-matias' },
]

export const RECLAMOS_CON_CLIENTE: ReclamoListado[] = RECLAMOS_DEMO.map(
  (reclamo) => {
    if (reclamo.id === CASO_EJEMPLO) {
      const ficha = detalleReclamo(reclamo.id, RECLAMOS_DEMO, RESPONSABLES)!
      return {
        ...reclamo,
        clienteId: 'cliente-fernanda',
        consumidor: ficha.consumidor,
        asunto: ficha.asunto,
        empresa: ficha.empresa,
        comuna: ficha.comuna,
        descripcion: ficha.relato,
      }
    }
    const perfil = perfiles.find(
      (item) =>
        RECLAMOS_DEMO.find((row) => row.estado === item.estado)?.id ===
        reclamo.id,
    )
    return perfil
      ? {
          ...reclamo,
          clienteId: perfil.clienteId,
          descripcion: `Solicito revisar el caso «${reclamo.asunto.toLowerCase()}» y comunicar una respuesta sobre los antecedentes entregados.`,
        }
      : reclamo
  },
)

export const CERRADOS_CLIENTE: ReclamoListado[] = [
  {
    id: 'R-2026-003900',
    clienteId: 'cliente-fernanda',
    asunto: 'Devolución por compra cancelada',
    descripcion:
      'La compra fue cancelada y solicité revisar la devolución del monto pagado.',
    empresa: 'Comercial Pacífico',
    mercado: 'Retail',
    comuna: 'Coquimbo',
    responsableId: 'camila-rojas',
    estado: 'cerrado',
    fechaIngreso: fechaISO(sumarDias(hoy(), -30)),
    fechaLimite: fechaISO(sumarDias(hoy(), -10)),
    fechaCierre: fechaISO(sumarDias(hoy(), -13)),
    cierreEnPlazo: true,
    diasRestantes: null,
    atencion: 'no_aplica',
    resultado:
      'La empresa informó la devolución del monto de la compra. Se comunicó la respuesta y se registró el cierre del caso.',
  },
]

export function seguimientoInicial(reclamo: ReclamoListado): EventoCliente[] {
  if (reclamo.id === CASO_EJEMPLO) {
    const ficha = detalleReclamo(reclamo.id, RECLAMOS_DEMO, RESPONSABLES)!
    return eventosParaCliente(reclamo.id, ficha.historial)
  }
  const eventos: EventoCliente[] = [
    {
      id: `${reclamo.id}-registro`,
      fecha: reclamo.fechaIngreso,
      titulo: 'Reclamo registrado',
      descripcion: 'Recibimos los antecedentes del reclamo para su revisión.',
      tipo: 'registro',
    },
  ]
  if (reclamo.estado === 'pendiente_antecedentes') {
    eventos.push({
      id: `${reclamo.id}-solicitud`,
      fecha: reclamo.fechaIngreso,
      titulo: 'Necesitamos más antecedentes',
      descripcion:
        'Agrega el comprobante de la compra o del cobro y explica la solución que solicitas.',
      tipo: 'solicitud',
    })
  } else if (reclamo.estado !== 'ingresado') {
    eventos.push({
      id: `${reclamo.id}-gestion`,
      fecha: reclamo.fechaIngreso,
      titulo:
        reclamo.estado === 'esperando_empresa'
          ? 'Respuesta de la empresa pendiente'
          : 'Caso asignado para su gestión',
      descripcion:
        reclamo.estado === 'esperando_empresa'
          ? 'Se solicitaron antecedentes a la empresa. Aquí podrás consultar las próximas novedades.'
          : 'Un funcionario está revisando los antecedentes del caso.',
      tipo: 'gestion',
    })
  }
  if (reclamo.estado === 'cerrado') {
    eventos.push({
      id: `${reclamo.id}-cierre`,
      fecha: reclamo.fechaCierre ?? reclamo.fechaIngreso,
      titulo: 'Resultado y cierre',
      descripcion: reclamo.resultado ?? 'El caso finalizó su seguimiento.',
      tipo: 'resultado',
    })
  }
  return eventos
}

export function eventosParaCliente(
  id: string,
  historial: EventoHistorial[],
): EventoCliente[] {
  return eventosPublicos(historial).map((evento, index) => {
    let fecha = evento.fecha
    if (/^\d{2}-\d{2}$/.test(fecha)) {
      const [dia, mes] = fecha.split('-').map(Number)
      const actual = hoy()
      const diaEvento = new Date(actual.getFullYear(), mes - 1, dia)
      if (diaEvento > actual) diaEvento.setFullYear(diaEvento.getFullYear() - 1)
      fecha = fechaISO(diaEvento)
    }
    return {
      id: `${id}-publico-${index}-${evento.titulo}`,
      fecha,
      titulo: evento.titulo,
      descripcion: evento.detalle,
      registradoEn: evento.registradoEn,
      tipo: evento.titulo.startsWith('Caso cerrado') ? 'resultado' : 'gestion',
    }
  })
}
