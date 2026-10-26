import { useSearchParams } from 'react-router'
import { Glass } from '@/components/ui/Glass'
import { BarList } from '@/components/ui/BarList'
import { RingStat } from '@/components/ui/RingStat'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { PageHeading } from '@/components/layout/PageHeading'
import { TrendCard } from '@/features/dashboard/TrendCard'
import { WorkloadChart } from '@/features/dashboard/WorkloadChart'
import { DeadlineCard } from '@/features/indicadores/DeadlineCard'
import { CierresPorMes } from '@/features/indicadores/CierresPorMes'
import { cn } from '@/lib/cn'
import { enDias, enPorcentaje } from '@/lib/format'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import {
  cierresPeriodo,
  corte,
  cumplimientoPlazos,
  mesAnterior,
  meses,
  periodo,
  tiempoResolucion,
} from '@/features/dashboard/mockData'

const { total, enPlazo, fueraDePlazo, diasAcumulados } = cierresPeriodo

/** Propuesta visual para los seis KPI comprometidos para Power BI. */
export function IndicadoresPage() {
  const { activos: reclamosActivos, resumenCarga } = useReclamosDemo()
  const [params, setParams] = useSearchParams()
  const vista = params.get('vista') === 'seguimiento' ? 'seguimiento' : 'plazos'

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Indicadores de gestión"
        subtitle={vista === 'plazos' ? periodo : `Corte al ${corte}`}
        action={
          <SegmentedControl
            label="Vista de indicadores"
            value={vista}
            onChange={(value) =>
              setParams(value === 'plazos' ? {} : { vista: value })
            }
            options={[
              { value: 'plazos', label: 'Plazos y resolución' },
              { value: 'seguimiento', label: 'Pendientes y carga' },
            ]}
          />
        }
      />
      <div
        key={vista}
        className={cn(
          'grid flex-1 gap-6 *:min-w-0 tall:min-h-0 tall:grid-rows-2 compact:gap-5',
          vista === 'plazos' ? 'md:grid-cols-2' : 'md:grid-cols-6',
        )}
      >
        {vista === 'plazos' ? (
          <>
            <TrendCard
              title="Tiempo promedio de resolución"
              subtitle={`KPI 1 · ${periodo}`}
              value={tiempoResolucion.value}
              unit="días"
              delta={{
                text: `${enDias(tiempoResolucion.mejora)} vs. ${mesAnterior}`,
                direction: 'down',
              }}
              points={tiempoResolucion.serie}
              labels={meses}
              format={enDias}
              footer={
                <span className="text-ink-muted">
                  {diasAcumulados.toLocaleString('es-CL')} días / {total}{' '}
                  cerrados
                </span>
              }
            />
            <TrendCard
              title="Cumplimiento de plazos"
              subtitle={`KPI 3 · ${periodo}`}
              value={cumplimientoPlazos.value}
              unit="%"
              delta={{
                text: `${cumplimientoPlazos.delta} pts vs. ${mesAnterior}`,
                direction: 'up',
              }}
              points={cumplimientoPlazos.serie}
              labels={meses}
              format={enPorcentaje}
              footer={
                <span className="text-ink-muted">
                  {enPlazo} de {total} cerrados en plazo
                </span>
              }
            />
            <Glass
              title="Cierres del período"
              subtitle={periodo}
              className="flex min-h-[230px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-2"
            >
              <div className="flex min-h-0 flex-1 items-center justify-center gap-8">
                <RingStat
                  value={cumplimientoPlazos.value}
                  className="h-full max-h-52"
                  label={`${enPlazo} de ${total} cierres dentro de plazo`}
                >
                  <span className="block text-display">{total}</span>
                  <span className="block text-caption text-ink-muted">
                    cerrados
                  </span>
                </RingStat>
                <ul className="w-64 divide-y divide-glass-shade">
                  <li className="flex items-center gap-2 py-3 compact:py-2">
                    <i className="size-2.5 rounded-full bg-brand" />
                    <span className="flex-1 text-label">Dentro de plazo</span>
                    <span className="text-metric tabular-nums">{enPlazo}</span>
                  </li>
                  <li className="flex items-center gap-2 py-3 compact:py-2">
                    <i className="size-2.5 rounded-full border border-ink-muted/40 bg-glass-shade" />
                    <span className="flex-1 text-label">Fuera de plazo</span>
                    <span className="text-metric tabular-nums">
                      {fueraDePlazo}
                    </span>
                  </li>
                </ul>
              </div>
            </Glass>
            <CierresPorMes />
          </>
        ) : (
          <>
            <Glass
              title="Reclamos pendientes"
              subtitle="KPI 2 · Activos por estado"
              className="flex min-h-[250px] flex-col md:col-span-4 tall:min-h-0 compact:p-4 [&>header]:mb-2"
            >
              <div className="grid min-h-0 flex-1 items-center gap-6 md:grid-cols-[minmax(8rem,0.5fr)_1.5fr]">
                <p className="self-stretch border-r border-glass-shade pr-6 text-center flex flex-col justify-center">
                  <span className="text-hero-number compact:text-[2.75rem] compact:leading-[3rem]">
                    {reclamosActivos.total}
                  </span>
                  <span className="block text-caption text-ink-muted">
                    activos
                  </span>
                </p>
                <BarList
                  items={reclamosActivos.estados}
                  label="Distribución de reclamos activos por estado"
                  labelWidth="13rem"
                  className="self-stretch"
                />
              </div>
            </Glass>
            <Glass
              title="Carga por funcionario"
              subtitle={`KPI 5 · ${resumenCarga}`}
              className="flex min-h-[250px] flex-col md:col-span-2 tall:min-h-0 compact:p-4 [&>header]:mb-2"
            >
              <WorkloadChart />
            </Glass>
            <DeadlineCard className="md:col-span-3" />
            <DeadlineCard vencidos className="md:col-span-3" />
          </>
        )}
      </div>
    </div>
  )
}
