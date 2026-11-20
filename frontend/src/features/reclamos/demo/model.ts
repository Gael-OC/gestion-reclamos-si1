import type { Usuario } from '@/features/auth/model'
import { reclamosActivos } from '@/features/dashboard/mockData'
import {
  casoDeFuncionaria,
  PRIORIDAD,
  CERRADOS,
} from '@/features/funcionario/escenario'
import {
  CERRADOS_CLIENTE,
  RECLAMOS_CON_CLIENTE,
  seguimientoInicial,
  eventosParaCliente,
} from '@/features/cliente/mockData'
import {
  estaActivo,
  eventosPublicos,
  type EventoCliente,
} from '@/features/cliente/model'
import { fechaISO, hoy, sumarDias } from '@/lib/fechas'
import {
  FECHA_REFERENCIA,
  RESPONSABLES,
  RECLAMOS_DEMO,
} from '../listado/mockData'
import type { NuevoReclamoDatos, ReclamoListado } from '../listado/model'
import { PLAZO_DIAS } from '../estados'
import {
  CASO_EJEMPLO,
  detalleReclamo,
  type EventoHistorial,
} from '../detalle/detalle'
import type { CambioGestion } from './context'

export type EstadoDemo = {
  creados: ReclamoListado[]
  aportes: Record<string, EventoCliente[]>
  cambios: Record<string, CambioGestion>
  gestiones: Record<string, EventoHistorial[]>
}

export type AccionDemo = { usuario: Usuario | null } & (
  | { tipo: 'registrar'; reclamo: ReclamoListado }
  | { tipo: 'aportar'; id: string; evento: EventoCliente }
  | {
      tipo: 'gestionar'
      id: string
      evento: EventoHistorial
      cambio: CambioGestion
    }
)

export function estadoInicialDemo(): EstadoDemo {
  return { creados: [], aportes: {}, cambios: {}, gestiones: {} }
}

export function folioInicialDemo() {
  return (
    Math.max(
      ...[...RECLAMOS_DEMO, ...CERRADOS_CLIENTE, ...PRIORIDAD, ...CERRADOS].map(
        (row) => Number(row.id.split('-').at(-1)),
      ),
    ) + 1
  )
}

export function crearReclamoDemo(
  datos: NuevoReclamoDatos,
  usuario: Usuario,
  folio: number,
): ReclamoListado {
  return {
    ...datos,
    clienteId: usuario.rol === 'cliente' ? usuario.id : undefined,
    consumidor: usuario.rol === 'cliente' ? usuario.nombre : undefined,
    id: `R-${hoy().getFullYear()}-${String(folio).padStart(6, '0')}`,
    estado: 'ingresado',
    responsableId: null,
    fechaIngreso: fechaISO(hoy()),
    fechaLimite: fechaISO(sumarDias(hoy(), PLAZO_DIAS)),
    diasRestantes: PLAZO_DIAS,
    atencion: 'en_plazo',
  }
}

export function modeloDemo(estado: EstadoDemo, usuario: Usuario | null) {
  const { creados, aportes, cambios, gestiones } = estado
  const reclamos = [...creados, ...RECLAMOS_CON_CLIENTE].map((row) => {
    const cambio = cambios[row.id]
    if (!cambio) return row
    const cerrado = cambio.estado === 'cerrado' || cambio.estado === 'anulado'
    return {
      ...row,
      estado: cambio.estado ?? row.estado,
      responsableId:
        cambio.responsableId === undefined
          ? row.responsableId
          : cambio.responsableId,
      resultado: cambio.resultado ?? row.resultado,
      ...(cerrado
        ? {
            fechaCierre: FECHA_REFERENCIA,
            cierreEnPlazo: (row.diasRestantes ?? 0) >= 0,
            diasRestantes: null,
            atencion: 'no_aplica' as const,
          }
        : {}),
    }
  })
  const pendientes = reclamos.filter(estaActivo)
  const estados = [
    'ingresado',
    'pendiente_antecedentes',
    'asignado',
    'en_gestion',
    'esperando_empresa',
  ]
  const cantidades = estados.map(
    (nombre) => pendientes.filter((row) => row.estado === nombre).length,
  )
  const etapas = [
    cantidades[0] + cantidades[1],
    cantidades[2] + cantidades[3],
    cantidades[4],
  ]
  const activos = {
    ...reclamosActivos,
    total: pendientes.length,
    sinAsignar: pendientes.filter((row) => row.responsableId === null).length,
    etapas: reclamosActivos.etapas.map((etapa, index) => ({
      ...etapa,
      value: etapas[index],
    })),
    estados: reclamosActivos.estados.map((item, index) => ({
      ...item,
      value: cantidades[index],
    })),
  }

  function seguimiento(reclamo: ReclamoListado) {
    const propio = [...reclamos, ...CERRADOS_CLIENTE].find(
      (row) => row.id === reclamo.id,
    )
    if (
      usuario?.rol !== 'cliente' ||
      !propio ||
      propio.clienteId !== usuario.id
    )
      return []
    const nuevos = gestiones[reclamo.id] ?? []
    // Los eventos de partida salen del estado con que se cargó el caso; los
    // cambios posteriores ya quedan como gestiones con su propia fecha.
    const original =
      [...creados, ...RECLAMOS_CON_CLIENTE, ...CERRADOS_CLIENTE].find(
        (row) => row.id === reclamo.id,
      ) ?? propio
    const inicial = seguimientoInicial(original).filter(
      (evento) =>
        evento.tipo !== 'resultado' ||
        !nuevos.some((gestion) => gestion.titulo.startsWith('Caso cerrado')),
    )
    return [
      ...inicial,
      ...eventosParaCliente(reclamo.id, nuevos),
      ...(aportes[reclamo.id] ?? []),
    ].sort((a, b) => (a.registradoEn ?? 0) - (b.registradoEn ?? 0))
  }

  function detalle(id: string) {
    if (!usuario) return null
    const row = [...reclamos, ...CERRADOS_CLIENTE].find(
      (item) => item.id === id,
    )
    const base =
      id === CASO_EJEMPLO
        ? detalleReclamo(id, reclamos, RESPONSABLES)
        : (casoDeFuncionaria(id) ??
          // La ficha base parte del caso tal como se cargó; responsable,
          // estado y gestiones posteriores se agregan abajo desde los cambios.
          detalleReclamo(
            id,
            [...creados, ...RECLAMOS_CON_CLIENTE, ...CERRADOS_CLIENTE],
            RESPONSABLES,
          ))
    if (!base) return null
    const cambio = cambios[id]
    const responsableId =
      cambio?.responsableId === undefined
        ? base.responsableId
        : cambio.responsableId
    if (usuario.rol === 'cliente' && row?.clienteId !== usuario.id) return null
    if (
      usuario.rol === 'funcionario' &&
      responsableId !== usuario.responsableId
    )
      return null
    const aportados = aportes[id] ?? []
    const historial = [
      ...base.historial.filter(
        (evento) =>
          !cambio?.estado || !evento.titulo.startsWith('Caso cerrado'),
      ),
      ...(gestiones[id] ?? []),
      ...aportados.map((evento) => ({
        fecha: evento.fecha.split('-').reverse().join('-').slice(0, 5),
        titulo: evento.titulo,
        detalle: evento.descripcion,
        tipo: 'gestion' as const,
        registradoEn: evento.registradoEn,
      })),
    ].sort((a, b) => (a.registradoEn ?? 0) - (b.registradoEn ?? 0))
    return {
      ...base,
      estado: cambio?.estado ?? base.estado,
      responsableId,
      responsable:
        RESPONSABLES.find((persona) => persona.id === responsableId)?.nombre ??
        null,
      respuestaEmpresa: cambio?.respuestaEmpresa ?? base.respuestaEmpresa,
      dias:
        cambio?.estado === 'cerrado' || cambio?.estado === 'anulado'
          ? null
          : base.dias,
      historial:
        usuario.rol === 'cliente' ? eventosPublicos(historial) : historial,
      adjuntos: [
        ...base.adjuntos,
        ...aportados.flatMap(
          (evento) => evento.adjuntos?.map((archivo) => archivo.nombre) ?? [],
        ),
      ],
    }
  }

  // Casos pendientes de antecedentes cuyo consumidor ya respondió después de
  // la última solicitud: vuelven a la bandeja de revisión del supervisor.
  const recibidos = reclamos
    .filter((row) => row.estado === 'pendiente_antecedentes')
    .filter((row) => {
      const ultimoAporte = Math.max(
        0,
        ...(aportes[row.id] ?? []).map((evento) => evento.registradoEn ?? 0),
      )
      const ultimaSolicitud = Math.max(
        0,
        ...(gestiones[row.id] ?? [])
          .filter((evento) => evento.solicitud)
          .map((evento) => evento.registradoEn ?? 0),
      )
      return ultimoAporte > ultimaSolicitud
    })
    .map((row) => row.id)

  return {
    reclamos,
    recibidos,
    activos,
    resumenCarga: `${activos.total - activos.sinAsignar} asignados · ${activos.sinAsignar} sin asignar`,
    historicoCliente: CERRADOS_CLIENTE,
    seguimiento,
    detalle,
  }
}

export function reducirDemo(
  estado: EstadoDemo,
  accion: AccionDemo,
): EstadoDemo {
  const { usuario } = accion
  if (!usuario) return estado
  if (accion.tipo === 'registrar') {
    if (
      usuario.rol === 'funcionario' ||
      estado.creados.some((row) => row.id === accion.reclamo.id)
    )
      return estado
    return {
      ...estado,
      creados: [
        {
          ...accion.reclamo,
          clienteId: usuario.rol === 'cliente' ? usuario.id : undefined,
          consumidor: usuario.rol === 'cliente' ? usuario.nombre : undefined,
        },
        ...estado.creados,
      ],
    }
  }
  const modelo = modeloDemo(estado, usuario)
  if (accion.tipo === 'gestionar') {
    if (usuario.rol === 'cliente' || !modelo.detalle(accion.id)) return estado
    return {
      ...estado,
      gestiones: {
        ...estado.gestiones,
        [accion.id]: [...(estado.gestiones[accion.id] ?? []), accion.evento],
      },
      cambios: {
        ...estado.cambios,
        [accion.id]: { ...estado.cambios[accion.id], ...accion.cambio },
      },
    }
  }
  const reclamo = modelo.reclamos.find((row) => row.id === accion.id)
  if (
    !reclamo ||
    usuario.rol !== 'cliente' ||
    reclamo.clienteId !== usuario.id ||
    !estaActivo(reclamo) ||
    !accion.evento.descripcion.trim()
  )
    return estado
  return {
    ...estado,
    aportes: {
      ...estado.aportes,
      [accion.id]: [...(estado.aportes[accion.id] ?? []), accion.evento],
    },
  }
}
