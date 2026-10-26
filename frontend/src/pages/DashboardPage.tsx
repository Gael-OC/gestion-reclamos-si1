import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { GlassList, type GlassListColumn } from '@/components/ui/GlassList'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import { PlazoChip } from '@/features/reclamos/PlazoChip'
import { LiquidOrbs } from '@/features/dashboard/LiquidOrbs'
import { TrendCard } from '@/features/dashboard/TrendCard'
import { WorkloadChart } from '@/features/dashboard/WorkloadChart'
import { PageHeading } from '@/components/layout/PageHeading'
import { enDias, enPorcentaje } from '@/lib/format'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import {
  alertasPlazo,
  corte,
  cumplimientoPlazos,
  mesAnterior,
  meses,
  periodo,
  requierenAtencion,
  tiempoResolucion,
  type ReclamoAtencion,
} from '@/features/dashboard/mockData'

const columns: GlassListColumn<ReclamoAtencion>[] = [
  {
    key: 'id',
    header: 'Reclamo',
    width: 'minmax(104px, 1fr)',
    render: (row) => <span className="text-id">{row.id}</span>,
  },
  {
    key: 'mercado',
    header: 'Mercado',
    width: 'minmax(90px, 1fr)',
    render: (row) => (
      <span className="truncate text-caption text-ink-muted">
        {row.mercado}
      </span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    width: '10.25rem',
    render: (row) => (
      <EstadoBadge estado={row.estado} short className="w-full" />
    ),
  },
  {
    key: 'plazo',
    header: 'Plazo',
    width: '10.75rem',
    align: 'right',
    render: (row) => <PlazoChip dias={row.dias} className="w-full" />,
  },
]

type Filtro = 'todos' | 'proximos' | 'vencidos'

/** Resumen de los seis KPI; las dos vistas de Indicadores amplían el detalle. */
export function DashboardPage() {
  const { activos: reclamosActivos, resumenCarga } = useReclamosDemo()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [selected, setSelected] = useState('R-2026-004812')
  const [etapa1, etapa2, etapa3] = reclamosActivos.etapas
  const filas = requierenAtencion.filter((row) =>
    filtro === 'todos'
      ? true
      : filtro === 'vencidos'
        ? row.dias < 0
        : row.dias >= 0 && row.dias <= 3,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Panel operativo"
        subtitle={`Corte al ${corte}`}
        action={
          <Link
            to="/indicadores"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-caption font-medium text-on-ink shadow-ink hover:bg-ink-soft"
          >
            Explorar indicadores <ArrowUpRight size={15} aria-hidden />
          </Link>
        }
      />
      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-2 compact:gap-5">
        <Glass className="grid min-h-[230px] gap-4 md:col-span-2 md:grid-cols-[minmax(11rem,0.7fr)_1.6fr] tall:min-h-0 compact:p-4">
          <div className="flex flex-col justify-between gap-3">
            <div>
              <h2 className="text-title whitespace-nowrap">
                Reclamos pendientes
              </h2>
              <p className="text-caption text-ink-muted">KPI 2</p>
              <p className="mt-2">
                <span className="text-hero-number compact:text-[2.75rem] compact:leading-[3rem]">
                  {reclamosActivos.total}
                </span>
                <span className="ml-2 text-caption text-ink-muted">
                  activos
                </span>
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Link
                to="/reclamos"
                className="pill pill-neutral hover:bg-glass-strong"
              >
                Ver listado <ArrowUpRight size={14} aria-hidden />
              </Link>
              <Link
                to="/indicadores?vista=seguimiento"
                className="pill pill-neutral hover:bg-glass-strong"
              >
                Ver por estado <ArrowUpRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
          <div className="relative min-h-[130px]">
            <LiquidOrbs
              items={[etapa1, etapa2, etapa3]}
              className="absolute inset-0"
            />
          </div>
        </Glass>

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
            <Link
              to="/indicadores"
              className="flex items-center justify-between gap-2"
            >
              <span className="text-ink-muted">
                KPI 1 · Resolución promedio
              </span>
              <span className="font-medium whitespace-nowrap">
                {enDias(tiempoResolucion.value)}{' '}
                <ArrowUpRight className="inline" size={14} aria-hidden />
              </span>
            </Link>
          }
        />

        <Glass
          title="Carga por funcionario"
          subtitle={`KPI 5 · ${resumenCarga}`}
          className="flex min-h-[260px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <WorkloadChart />
        </Glass>

        <Glass className="flex min-h-[280px] flex-col md:col-span-2 lg:col-span-2 tall:min-h-0 compact:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h2 className="text-title">
              <Link
                to={`/reclamos?orden=urgentes${filtro === 'todos' ? '' : `&atencion=${filtro === 'proximos' ? 'por_vencer' : 'vencidos'}`}`}
                title="Ver listado de alertas"
                className="underline-offset-4 hover:underline"
              >
                Requieren atención{' '}
                <ArrowUpRight className="inline" size={14} aria-hidden />
              </Link>
            </h2>
            <SegmentedControl
              label="Filtrar alertas"
              value={filtro}
              onChange={setFiltro}
              options={[
                {
                  value: 'todos',
                  label: `Todos · ${alertasPlazo.proximos + alertasPlazo.vencidos}`,
                },
                {
                  value: 'proximos',
                  label: `Próximos · ${alertasPlazo.proximos}`,
                },
                {
                  value: 'vencidos',
                  label: `Vencidos · ${alertasPlazo.vencidos}`,
                },
              ]}
            />
          </div>
          <div className="-mx-2 min-h-0 flex-1 overflow-x-auto px-2">
            <GlassList
              caption="Reclamos que requieren atención"
              columns={columns}
              rows={filas}
              selectedId={selected}
              onRowClick={(row) => setSelected(row.id)}
              className="h-full min-w-[592px] flex-wrap content-start overflow-hidden [&_[role=row]]:w-full"
            />
          </div>
        </Glass>
      </div>
    </div>
  )
}
