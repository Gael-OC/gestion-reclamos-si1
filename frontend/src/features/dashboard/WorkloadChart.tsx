import { BarList } from '@/components/ui/BarList'
import { cargaFuncionarios } from './mockData'

const items = cargaFuncionarios.map(({ nombre, value }) => ({
  label: nombre,
  value,
}))

/** KPI 5: misma escala para todos los responsables ficticios. */
export function WorkloadChart() {
  return (
    <BarList
      items={items}
      label="Reclamos activos por funcionario"
      labelWidth="7.5rem"
      className="flex-1"
    />
  )
}
