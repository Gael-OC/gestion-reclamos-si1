import type { ReclamoListado } from '@/features/reclamos/listado/model'
import type { EventoHistorial } from '@/features/reclamos/detalle/detalle'

export type AdjuntoCliente = { nombre: string; tamano: number; tipo: string }

export type EventoCliente = {
  registradoEn?: number
  id: string
  fecha: string
  titulo: string
  descripcion: string
  tipo: 'registro' | 'gestion' | 'solicitud' | 'antecedentes' | 'resultado'
  adjuntos?: AdjuntoCliente[]
}

export function estaActivo(reclamo: ReclamoListado) {
  return reclamo.estado !== 'cerrado' && reclamo.estado !== 'anulado'
}

export function requiereAntecedentes(
  reclamo: ReclamoListado,
  eventos: EventoCliente[],
) {
  const ultimo = [...eventos]
    .reverse()
    .find((item) => item.tipo === 'solicitud' || item.tipo === 'antecedentes')
  return (
    reclamo.estado === 'pendiente_antecedentes' && ultimo?.tipo === 'solicitud'
  )
}

export function reclamosDeCliente(
  reclamos: ReclamoListado[],
  clienteId: string,
) {
  return reclamos
    .filter((row) => row.clienteId === clienteId)
    .sort(
      (a, b) =>
        b.fechaIngreso.localeCompare(a.fechaIngreso) ||
        b.id.localeCompare(a.id),
    )
}

export function eventosPublicos(eventos: EventoHistorial[]) {
  return eventos.filter(
    (evento) => evento.tipo !== 'nota' && evento.tipo !== 'hoy',
  )
}
