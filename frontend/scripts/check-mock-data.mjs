import assert from 'node:assert/strict'
import { crearDemoListado } from '../src/features/reclamos/listado/crearDemo.ts'
import { filtrarReclamos } from '../src/features/reclamos/listado/model.ts'
import { paginasVisibles } from '../src/features/reclamos/listado/paginacion.ts'
import { validarNuevoReclamo } from '../src/features/reclamos/registro/validacion.ts'
import {
  alertasPlazo,
  asignados,
  cargaFuncionarios,
  cierresPeriodo,
  cumplimientoPlazos,
  historialMensual,
  mesAnterior,
  meses,
  reclamosActivos,
  requierenAtencion,
  tiempoResolucion,
} from '../src/features/dashboard/mockData.ts'

const sum = (rows) => rows.reduce((total, row) => total + row.value, 0)
assert.equal(sum(reclamosActivos.estados), reclamosActivos.total)
assert.equal(sum(reclamosActivos.etapas), reclamosActivos.total)
assert.equal(
  sum(cargaFuncionarios) + reclamosActivos.sinAsignar,
  reclamosActivos.total,
)
const [ingresado, pendiente, asignado, enGestion, esperando] =
  reclamosActivos.estados
assert.deepEqual(
  reclamosActivos.etapas.map((etapa) => etapa.value),
  [
    ingresado.value + pendiente.value,
    asignado.value + enGestion.value,
    esperando.value,
  ],
)
assert.equal(asignados, reclamosActivos.total - reclamosActivos.sinAsignar)
assert.ok(
  alertasPlazo.proximos + alertasPlazo.vencidos <= reclamosActivos.total,
)
assert.equal(
  cierresPeriodo.enPlazo + cierresPeriodo.fueraDePlazo,
  cierresPeriodo.total,
)
assert.equal(
  (cierresPeriodo.enPlazo / cierresPeriodo.total) * 100,
  cumplimientoPlazos.value,
)
assert.equal(
  cierresPeriodo.diasAcumulados / cierresPeriodo.total,
  tiempoResolucion.value,
)
assert.equal(historialMensual.at(-1).cierres, cierresPeriodo.total)
assert.equal(historialMensual.at(-1).cumplimiento, cumplimientoPlazos.value)
assert.equal(historialMensual.at(-1).resolucion, tiempoResolucion.value)
assert.equal(
  historialMensual.at(-1).cumplimiento - historialMensual.at(-2).cumplimiento,
  cumplimientoPlazos.delta,
)
assert.equal(
  Number(
    (
      historialMensual.at(-2).resolucion - historialMensual.at(-1).resolucion
    ).toFixed(1),
  ),
  tiempoResolucion.mejora,
)
assert.equal(
  new Set(requierenAtencion.map((row) => row.id)).size,
  requierenAtencion.length,
)
const muestraVencidos = requierenAtencion.filter((row) => row.dias < 0).length
const muestraProximos = requierenAtencion.length - muestraVencidos
assert.ok(muestraVencidos <= alertasPlazo.vencidos)
assert.ok(muestraProximos <= alertasPlazo.proximos)
assert.ok(requierenAtencion.every((row) => row.dias <= 3))
assert.equal(new Set(meses).size, meses.length)
assert.equal(mesAnterior, historialMensual.at(-2).mes.toLowerCase())
assert.ok(
  requierenAtencion.every(
    (row) => !['cerrado', 'anulado'].includes(row.estado),
  ),
)
console.log(
  'Escenario ficticio coherente: estados, carga, alertas y cierres de los seis KPI.',
)

const escenarioListado = {
  fechaReferencia: '2026-10-26',
  estados: reclamosActivos.estados,
  funcionarios: cargaFuncionarios,
  alertas: alertasPlazo,
  muestras: requierenAtencion,
}
const { reclamos, responsables } = crearDemoListado(escenarioListado)
assert.equal(reclamos.length, reclamosActivos.total)
assert.equal(new Set(reclamos.map((row) => row.id)).size, reclamos.length)
assert.equal(
  reclamos.filter((row) => row.responsableId === null).length,
  reclamosActivos.sinAsignar,
)
assert.equal(
  reclamos.filter((row) => row.atencion === 'por_vencer').length,
  alertasPlazo.proximos,
)
assert.equal(
  reclamos.filter((row) => row.atencion === 'vencido').length,
  alertasPlazo.vencidos,
)
const estados = [
  'ingresado',
  'pendiente_antecedentes',
  'asignado',
  'en_gestion',
  'esperando_empresa',
]
assert.deepEqual(
  estados.map(
    (estado) => reclamos.filter((row) => row.estado === estado).length,
  ),
  reclamosActivos.estados.map((item) => item.value),
)
for (const persona of cargaFuncionarios) {
  const id = responsables.find((item) => item.nombre === persona.nombre).id
  assert.equal(
    reclamos.filter((row) => row.responsableId === id).length,
    persona.value,
  )
}
for (const muestra of requierenAtencion) {
  const row = reclamos.find((item) => item.id === muestra.id)
  assert.ok(row)
  assert.equal(row.estado, muestra.estado)
  assert.equal(row.mercado, muestra.mercado)
  assert.equal(row.diasRestantes, muestra.dias)
  assert.equal(
    responsables.find((item) => item.id === row.responsableId)?.nombre ??
      'Sin asignar',
    muestra.responsable,
  )
}
for (const row of reclamos) {
  assert.equal(
    (Date.parse(row.fechaLimite) -
      Date.parse(escenarioListado.fechaReferencia)) /
      86_400_000,
    row.diasRestantes,
  )
  assert.equal(
    (Date.parse(row.fechaLimite) - Date.parse(row.fechaIngreso)) / 86_400_000,
    20,
  )
}
assert.deepEqual(crearDemoListado(escenarioListado).reclamos, reclamos)
const filtros = {
  buscar: '',
  estado: '',
  mercado: '',
  responsable: '',
  alcance: 'todos',
  atencion: 'todos',
  orden: 'recientes',
}
const camila = responsables.find(
  (persona) => persona.nombre === 'Camila Rojas',
).id
const filtrar = (patch) =>
  filtrarReclamos(reclamos, { ...filtros, ...patch }, camila, responsables)
assert.equal(
  filtrar({ alcance: 'mios' }).length,
  cargaFuncionarios.find((persona) => persona.nombre === 'Camila Rojas').value,
)
assert.equal(filtrar({ atencion: 'sin_asignar' }).length, 48)
assert.equal(filtrar({ atencion: 'vencidos' }).length, 19)
assert.equal(filtrar({ atencion: 'por_vencer' }).length, 28)
assert.equal(filtrar({ buscar: 'R-2026-004790' }).length, 1)
assert.equal(
  filtrar({ buscar: 'Educación' }).length,
  filtrar({ buscar: 'educacion' }).length,
)
assert.equal(filtrar({ buscar: 'no-existe-este-caso' }).length, 0)
for (let pagina = 1; pagina <= 57; pagina += 1) {
  const visibles = paginasVisibles(pagina, 57)
  assert.ok(visibles.length <= 7)
  assert.ok(
    visibles.includes(pagina) && visibles.includes(1) && visibles.includes(57),
  )
  assert.equal(new Set(visibles).size, visibles.length)
}
console.log(
  'Listado coherente con main: 342 activos, 48 sin asignar, 28 próximos, 19 vencidos, estados y responsables; filtros y 57 páginas correctos.',
)

assert.equal(
  Object.keys(
    validarNuevoReclamo({
      asunto: '',
      empresa: '',
      mercado: '',
      comuna: '',
      descripcion: '',
    }),
  ).length,
  5,
)
assert.equal(
  Object.keys(
    validarNuevoReclamo({
      asunto: '  ',
      empresa: '  ',
      mercado: '',
      comuna: '',
      descripcion: '\n ',
    }),
  ).length,
  5,
)
assert.deepEqual(
  validarNuevoReclamo({
    asunto: 'Cobro duplicado',
    empresa: 'Empresa de prueba',
    mercado: 'Retail',
    comuna: 'Coquimbo',
    descripcion: 'Solicito revisar un cobro de prueba.',
  }),
  {},
)
console.log(
  'Formulario de demo: campos obligatorios, espacios en blanco y registro válido verificados.',
)
