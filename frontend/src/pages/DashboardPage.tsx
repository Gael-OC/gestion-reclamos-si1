import { useState } from 'react'
import { ArrowUpRight, RefreshCw, UserPlus } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { GlassList, type GlassListColumn } from '@/components/ui/GlassList'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import { PlazoChip } from '@/features/reclamos/PlazoChip'
import { LiquidOrbs } from '@/features/dashboard/LiquidOrbs'
import { GlassBars } from '@/features/dashboard/GlassBars'
import { TrendCard } from '@/features/dashboard/TrendCard'
import {
  cumplimientoPlazos,
  ingresosPorMes,
  reclamosActivos,
  requierenAtencion,
  type ReclamoAtencion,
} from '@/features/dashboard/mockData'

const columns: GlassListColumn<ReclamoAtencion>[] = [
  {
    key: 'id',
    header: 'Reclamo',
    width: 'minmax(132px, 1.25fr)',
    render: (row) => (
      <>
        <span className="pill pill-neutral size-7 justify-center p-0">
          <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="text-label">{row.id}</span>
      </>
    ),
  },
  {
    key: 'mercado',
    header: 'Mercado',
    width: 'minmax(112px, 1.1fr)',
    render: (row) => (
      <span className="truncate text-ink-muted">{row.mercado}</span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    width: 'minmax(158px, 1.15fr)',
    render: (row) => <EstadoBadge estado={row.estado} short />,
  },
  {
    key: 'plazo',
    header: 'Plazo',
    width: 'minmax(158px, 1fr)',
    align: 'right',
    render: (row) => <PlazoChip dias={row.dias} />,
  },
]

/**
 * Panel principal: cuatro islas en una grilla de tres columnas con el mismo
 * espacio entre todas. Las filas alternan 2 + 1 y 1 + 2 columnas.
 */
export function DashboardPage() {
  const [alcance, setAlcance] = useState<'todos' | 'mios'>('todos')
  const [selected, setSelected] = useState('R-2026-004812')

  const [etapa1, etapa2, etapa3] = reclamosActivos.etapas

  return (
    <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-2 compact:gap-5">
      <Glass className="flex min-h-0 flex-col md:col-span-2 compact:p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-label text-ink-muted">Reclamos activos</h1>
            <span className="text-hero-number tabular-nums compact:text-[38px] compact:leading-[42px]">
              {reclamosActivos.total.toLocaleString('es-CL')}
            </span>
          </div>
          <SegmentedControl
            label="Alcance"
            value={alcance}
            onChange={setAlcance}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'mios', label: 'Míos' },
            ]}
          />
        </div>
        <div className="mt-2 flex min-h-0 flex-1 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative min-h-[150px] min-w-0 flex-1 sm:h-full">
            <LiquidOrbs
              items={[etapa1, etapa2, etapa3]}
              className="absolute inset-0"
            />
          </div>
          <div className="flex shrink-0 gap-2.5 sm:flex-col">
            <Button icon={UserPlus}>Asignar</Button>
            <Button variant="ghost" iconRight={ArrowUpRight}>
              Ver detalle
            </Button>
          </div>
        </div>
      </Glass>

      <TrendCard
        title="Cumplimiento de plazos"
        value={cumplimientoPlazos.value}
        unit="%"
        caption={`+${cumplimientoPlazos.delta} pts desde el mes pasado`}
        points={cumplimientoPlazos.serie}
        startLabel={`${cumplimientoPlazos.serie[0]} %`}
        endLabel={`${cumplimientoPlazos.value} %`}
        action={<IconButton icon={RefreshCw} label="Actualizar" size="sm" />}
        className="min-h-0"
      />

      <Glass
        title="Ingresos por mes"
        action={<Button size="sm">Mensual</Button>}
        className="flex min-h-[300px] flex-col tall:min-h-0 compact:p-4"
      >
        <GlassBars
          data={ingresosPorMes}
          initialActive={2}
          format={(value) => `${value} rec.`}
          className="flex-1"
        />
      </Glass>

      <Glass
        title="Requieren atención"
        subtitle="Ordenados por fecha límite"
        action={
          <Button variant="ink" size="sm">
            Ver todos
          </Button>
        }
        className="flex min-h-0 flex-col md:col-span-2 lg:col-span-2 compact:p-4"
      >
        <div className="-mx-1 min-h-0 flex-1 overflow-x-auto overflow-y-auto px-1">
          <GlassList
            caption="Reclamos que requieren atención"
            columns={columns}
            rows={requierenAtencion}
            selectedId={selected}
            onRowClick={(row) => setSelected(row.id)}
            className="min-w-[520px]"
          />
        </div>
      </Glass>
    </div>
  )
}
