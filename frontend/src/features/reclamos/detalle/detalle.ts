import { diaRelativo, fechaLarga, hoy, sumarDias } from '@/lib/fechas'
import { PLAZO_DIAS, type Estado } from '../estados'
import type { ReclamoListado } from '../listado/model'

/*
 * Ficha de un reclamo para las vistas de detalle y de gestión. El backend
 * entregará estos datos; aquí se arman desde el listado de prueba y se agrega
 * un caso completo de ejemplo (R-2026-004812) con historial y comunicaciones.
 */

export type TipoEvento = 'sistema' | 'gestion' | 'empresa' | 'nota' | 'hoy'

export type EventoHistorial = {
  fecha: string
  titulo: string
  detalle: string
  tipo: TipoEvento
}

export type DetalleReclamo = {
  id: string
  asunto: string
  empresa: string
  mercado: string
  comuna: string
  consumidor: string
  relato: string
  estado: Estado
  responsableId: string | null
  responsable: string | null
  /** Días hasta la fecha límite; null si el caso terminó. */
  dias: number | null
  fechaIngreso: string
  fechaLimite: string
  adjuntos: string[]
  historial: EventoHistorial[]
  /** true si ya se registró la respuesta de la empresa. */
  respuestaEmpresa: boolean
}

export const CASO_EJEMPLO = 'R-2026-004812'

function casoEjemplo(): DetalleReclamo {
  const ingreso = -PLAZO_DIAS
  return {
    id: CASO_EJEMPLO,
    asunto: 'Devolución por producto defectuoso',
    empresa: 'Tienda Brisa',
    mercado: 'Retail',
    comuna: 'Coquimbo',
    consumidor: 'Fernanda Castillo',
    relato:
      'El producto dejó de funcionar a los 10 días de comprarlo. Pido la devolución del dinero.',
    estado: 'en_gestion',
    responsableId: 'camila-rojas',
    responsable: 'Camila Rojas',
    dias: 0,
    fechaIngreso: fechaLarga(sumarDias(hoy(), ingreso)),
    fechaLimite: fechaLarga(hoy()),
    adjuntos: ['Boleta.pdf', 'Producto.jpg', 'Respuesta empresa.pdf'],
    respuestaEmpresa: true,
    historial: [
      {
        fecha: diaRelativo(ingreso),
        titulo: 'Ingresó por el portal',
        detalle: 'Fernanda Castillo · adjuntó boleta y foto del producto',
        tipo: 'sistema',
      },
      {
        fecha: diaRelativo(ingreso + 1),
        titulo: 'Asignado a Camila Rojas',
        detalle: 'Andrea Fuentes · antecedentes completos',
        tipo: 'gestion',
      },
      {
        fecha: diaRelativo(ingreso + 2),
        titulo: 'En gestión',
        detalle: 'Camila Rojas · revisa garantía y boleta',
        tipo: 'gestion',
      },
      {
        fecha: diaRelativo(ingreso + 5),
        titulo: 'Solicitud enviada a Tienda Brisa',
        detalle: 'Esperando respuesta de empresa',
        tipo: 'empresa',
      },
      {
        fecha: diaRelativo(ingreso + 13),
        titulo: 'La empresa respondió',
        detalle: 'Ofrece cambio del producto, no devolución del dinero',
        tipo: 'empresa',
      },
      {
        fecha: diaRelativo(ingreso + 17),
        titulo: 'Nota interna',
        detalle: 'La consumidora prefiere devolución. Insistir con la empresa.',
        tipo: 'nota',
      },
      {
        fecha: 'Hoy',
        titulo: 'Vence el plazo',
        detalle: 'Falta informar el resultado y cerrar',
        tipo: 'hoy',
      },
    ],
  }
}

const deIso = (iso: string) => iso.split('-').reverse().join('-')

/** Ficha del reclamo o null si el folio no existe en la demo. */
export function detalleReclamo(
  id: string,
  reclamos: ReclamoListado[],
  responsables: { id: string; nombre: string }[],
): DetalleReclamo | null {
  if (id === CASO_EJEMPLO) return casoEjemplo()
  const row = reclamos.find((item) => item.id === id)
  if (!row) return null
  const responsable =
    responsables.find((item) => item.id === row.responsableId)?.nombre ?? null
  const ingreso = deIso(row.fechaIngreso)
  const historial: EventoHistorial[] = [
    {
      fecha: ingreso.slice(0, 5),
      titulo: 'Ingresó por el portal',
      detalle: 'Antecedentes del consumidor recibidos',
      tipo: 'sistema',
    },
  ]
  if (responsable)
    historial.push({
      fecha: ingreso.slice(0, 5),
      titulo: `Asignado a ${responsable}`,
      detalle: 'Andrea Fuentes',
      tipo: 'gestion',
    })
  if (row.estado === 'esperando_empresa')
    historial.push({
      fecha: '—',
      titulo: `Solicitud enviada a ${row.empresa}`,
      detalle: 'Esperando respuesta de empresa',
      tipo: 'empresa',
    })
  if (row.estado === 'cerrado' && row.fechaCierre)
    historial.push({
      fecha: deIso(row.fechaCierre).slice(0, 5),
      titulo: 'Caso cerrado',
      detalle: row.cierreEnPlazo ? 'Dentro de plazo' : 'Fuera de plazo',
      tipo: 'gestion',
    })
  if (row.estado === 'anulado')
    historial.push({
      fecha: '—',
      titulo: 'Reclamo anulado',
      detalle: 'Motivo registrado por la supervisión',
      tipo: 'nota',
    })
  return {
    id: row.id,
    asunto: row.asunto,
    empresa: row.empresa,
    mercado: row.mercado,
    comuna: row.comuna,
    consumidor: 'Consumidor de prueba',
    relato: row.descripcion ?? 'Relato del consumidor (dato de prueba).',
    estado: row.estado,
    responsableId: row.responsableId,
    responsable,
    dias: row.diasRestantes,
    fechaIngreso: ingreso,
    fechaLimite: deIso(row.fechaLimite),
    adjuntos: [],
    historial,
    respuestaEmpresa: false,
  }
}
