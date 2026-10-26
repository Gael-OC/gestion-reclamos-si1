import assert from 'node:assert/strict'
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
