import { Link, useNavigate } from 'react-router'
import { Glass } from '@/components/ui/Glass'
import { BarList } from '@/components/ui/BarList'
import { RingStat } from '@/components/ui/RingStat'
import { PageHeading } from '@/components/layout/PageHeading'
import { LiquidOrbs } from '@/features/dashboard/LiquidOrbs'
import { TrendCard } from '@/features/dashboard/TrendCard'
import {
  cierresPeriodo,
  cumplimientoPlazos,
  historialMensual,
  tiempoResolucion,
} from '@/features/dashboard/mockData'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { EQUIPO } from '@/features/supervision/escenario'
import { DESTINOS_ETAPAS } from '@/features/supervision/destinos'
import { PlazosEnRiesgo } from '@/features/supervision/PlazosEnRiesgo'
import {
  fechaLarga,
  hoy,
  mesActual,
  mesAnterior,
  mesesRecientes,
} from '@/lib/fechas'

const unDecimal = (value: number) =>
  value.toLocaleString('es-CL', { maximumFractionDigits: 1 })

/** Los seis KPI del informe, cada uno con su forma. */
export function IndicadoresPage() {
  const navigate = useNavigate()
  const { activos } = useReclamosDemo()
  const [etapa1, etapa2, etapa3] = activos.etapas
  const meses = mesesRecientes(historialMensual.length)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Indicadores"
        subtitle={`Seis KPI · ${mesActual()} en curso · corte ${fechaLarga(hoy())}`}
      />
      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-2 compact:gap-5">
        <TrendCard
          className="md:col-span-2"
          title="Tiempo promedio de resolución"
          subtitle={`KPI 1 · días corridos · ${mesActual()}`}
          value={tiempoResolucion.value}
          unit="días"
          delta={{
            text: `${unDecimal(tiempoResolucion.mejora)} días menos que ${mesAnterior()}`,
            direction: 'down',
          }}
          points={historialMensual.map((mes) => mes.resolucion)}
          labels={meses}
          format={(value) => `${unDecimal(value)} días`}
        />

        <Glass
          title="Cumplimiento de plazos"
          subtitle="KPI 3 · cierres del mes"
          className="flex min-h-[260px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <div className="grid flex-1 place-items-center">
            <RingStat
              value={cumplimientoPlazos.value}
              label={`${cumplimientoPlazos.value} % en plazo: ${cierresPeriodo.enPlazo} de ${cierresPeriodo.total} cierres`}
              size={10}
            >
              <span className="text-hero-number">
                {cumplimientoPlazos.value}
              </span>
              <span className="text-caption text-ink-muted"> %</span>
              <span className="block text-caption text-ink-muted">
                en plazo
              </span>
            </RingStat>
          </div>
          <div className="mt-3 grid grid-cols-2 text-center">
            <div>
              <p className="text-title">{cierresPeriodo.enPlazo}</p>
              <p className="text-caption text-ink-muted">dentro de plazo</p>
            </div>
            <div>
              <p className="text-title">{cierresPeriodo.fueraDePlazo}</p>
              <p className="text-caption text-ink-muted">fuera de plazo</p>
            </div>
          </div>
        </Glass>

        <Glass
          title="Reclamos pendientes"
          subtitle="KPI 2 · diario"
          action={<span className="text-metric">{activos.total}</span>}
          className="flex min-h-[230px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-1"
        >
          <div className="relative min-h-[120px] flex-1">
            <LiquidOrbs
              items={[etapa1, etapa2, etapa3]}
              onSelect={(index) => navigate(DESTINOS_ETAPAS[index])}
              className="absolute inset-0"
            />
          </div>
        </Glass>

        <Glass className="grid min-h-[260px] gap-6 md:col-span-2 md:grid-cols-[0.9fr_1.2fr] tall:min-h-0 compact:p-4">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-title">Plazos al corte</h2>
              <p className="text-caption text-ink-muted">
                KPI 6 vencidos · KPI 4 por vencer (0–3 días)
              </p>
            </div>
            <PlazosEnRiesgo size={7} className="flex-1" />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-title">
                <Link
                  to="/supervisor/equipo"
                  className="underline-offset-4 hover:underline"
                >
                  Carga por funcionario
                </Link>
              </h2>
              <p className="text-caption text-ink-muted">
                KPI 5 · {activos.total - activos.sinAsignar} asignados ·{' '}
                {activos.sinAsignar} sin asignar aparte
              </p>
            </div>
            <BarList
              label="Casos activos por funcionario"
              labelWidth="7.5rem"
              items={EQUIPO.map((persona) => ({
                label: persona.nombre,
                value: persona.activos,
              }))}
              className="flex-1"
            />
          </div>
        </Glass>
      </div>
    </div>
  )
}
