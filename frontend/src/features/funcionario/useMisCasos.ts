import { useAuth } from '@/features/auth/context'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { PLAZO_DIAS, type Estado } from '@/features/reclamos/estados'
import { RECLAMOS_DEMO } from '@/features/reclamos/listado/mockData'
import { tonoPlazo } from '@/features/reclamos/plazo'
import {
  CERRADOS,
  MI_MES,
  MIS_CASOS,
  PRIORIDAD,
  RESULTADOS,
  type CasoPrioritario,
  type Resultado,
} from './escenario'
import { proximoPaso, type Accion } from './pasos'
import { hoy } from '@/lib/fechas'

const PASO: Record<Accion, string> = {
  analizar: 'Analizar caso',
  solicitar: 'Pedir respuesta a la empresa',
  respuesta: 'Registrar respuesta',
  resultado: 'Informar resultado',
}

const activo = (estado: Estado | undefined) =>
  estado !== undefined && estado !== 'cerrado' && estado !== 'anulado'

/** Días desde hoy hasta una fecha ISO (negativo si ya pasó). */
const diasHasta = (iso: string) =>
  Math.round(
    (new Date(`${iso}T00:00:00`).getTime() - hoy().getTime()) / 86_400_000,
  )

const SEMILLA = new Map(RECLAMOS_DEMO.map((row) => [row.id, row]))
const EN_PRIORIDAD = new Set(PRIORIDAD.map((caso) => caso.id))

/**
 * Casos de la funcionaria con lo ocurrido durante la demo: los que le asignó
 * la supervisión, el paso que sigue en cada uno y los que ya cerró. Las
 * cifras parten del escenario de prueba y se ajustan con esos cambios.
 */
export function useMisCasos() {
  const { usuario } = useAuth()
  const { reclamos, detalle } = useReclamosDemo()
  const responsableId = usuario?.responsableId ?? ''

  const asignadosEnDemo: CasoPrioritario[] = reclamos
    .filter(
      (row) =>
        row.responsableId === responsableId &&
        SEMILLA.get(row.id)?.responsableId !== responsableId &&
        !EN_PRIORIDAD.has(row.id),
    )
    .map((row) => ({
      id: row.id,
      asunto: row.asunto,
      empresa: row.empresa,
      mercado: row.mercado,
      estado: row.estado,
      dias: diasHasta(row.fechaLimite),
      paso: '',
      respuestaEmpresa: false,
    }))

  const seguidos = [
    ...PRIORIDAD.map((caso) => ({ caso, inicial: caso.estado as Estado })),
    ...asignadosEnDemo.map((caso) => ({ caso, inicial: undefined })),
  ].map(({ caso, inicial }) => {
    const ficha = detalle(caso.id)
    const estado = ficha?.estado ?? caso.estado
    const respuesta = ficha?.respuestaEmpresa ?? caso.respuestaEmpresa
    const accion = proximoPaso(estado, respuesta, caso.empresa).accion
    const cierre = ficha?.historial
      .filter((evento) => evento.titulo.startsWith('Caso cerrado'))
      .at(-1)
    return {
      caso: {
        ...caso,
        estado,
        respuestaEmpresa: respuesta,
        paso: accion ? PASO[accion] : '',
      },
      inicial,
      cierre,
    }
  })

  const prioridad = seguidos
    .filter(({ caso }) => activo(caso.estado))
    .map(({ caso }) => caso)
    .sort((a, b) => a.dias - b.dias)

  const etapas = MIS_CASOS.etapas.map((etapa) => ({ ...etapa }))
  let vencidos = MIS_CASOS.vencidos
  let porVencer = MIS_CASOS.porVencer
  for (const { caso, inicial } of seguidos) {
    if (inicial === caso.estado) continue
    const antes = etapas.find((etapa) => etapa.estado === inicial)
    const ahora = etapas.find((etapa) => etapa.estado === caso.estado)
    if (antes) antes.value -= 1
    if (ahora) ahora.value += 1
    const tono = tonoPlazo(caso.dias)
    const delta = (activo(caso.estado) ? 1 : 0) - (activo(inicial) ? 1 : 0)
    if (tono === 'vencido') vencidos += delta
    if (tono === 'por_vencer') porVencer += delta
  }

  const cerradosEnDemo = seguidos
    .filter(
      ({ caso, inicial }) => caso.estado === 'cerrado' && inicial !== 'cerrado',
    )
    .map(({ caso, cierre }) => ({
      id: caso.id,
      asunto: caso.asunto,
      resultado: ((Object.keys(RESULTADOS) as Resultado[]).find((clave) =>
        cierre?.titulo.endsWith(RESULTADOS[clave]),
      ) ?? 'total') as Resultado,
      diasGestion: PLAZO_DIAS - caso.dias,
      enPlazo: caso.dias >= 0,
    }))

  return {
    nombre: MIS_CASOS.nombre,
    activos: etapas.reduce((total, etapa) => total + etapa.value, 0),
    vencidos,
    porVencer,
    etapas,
    prioridad,
    porIniciar: etapas.find((etapa) => etapa.estado === 'asignado')?.value ?? 0,
    cerrados: [...cerradosEnDemo, ...CERRADOS],
    mes: {
      ...MI_MES,
      cierres: MI_MES.cierres + cerradosEnDemo.length,
      enPlazo:
        MI_MES.enPlazo + cerradosEnDemo.filter((caso) => caso.enPlazo).length,
    },
  }
}
