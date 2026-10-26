import { useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Inbox,
  RotateCcw,
  SearchX,
  UserRound,
} from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { PageHeading } from '@/components/layout/PageHeading'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { SearchField } from '@/components/ui/SearchField'
import { SelectField } from '@/components/ui/SelectField'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ESTADOS } from '@/features/reclamos/estados'
import { ReclamosTable } from '@/features/reclamos/listado/ReclamosTable'
import { ReclamoPreview } from '@/features/reclamos/listado/ReclamoPreview'
import { paginasVisibles } from '@/features/reclamos/listado/paginacion'
import {
  FECHA_REFERENCIA,
  MERCADOS,
  RESPONSABLES,
  USUARIO_DEMO,
} from '@/features/reclamos/listado/mockData'
import {
  fechaVisible,
  filtrarReclamos,
  type Atencion,
  type FiltrosListado,
  type Orden,
  type ReclamoListado,
} from '@/features/reclamos/listado/model'
import { cn } from '@/lib/cn'
import { useReclamosDemo } from '@/features/reclamos/demo/context'

const PAGE_SIZE = 6
const ATENCION = [
  { value: 'todos', label: 'Todos los casos', icon: Inbox },
  { value: 'vencidos', label: 'Vencidos', icon: CircleAlert },
  { value: 'por_vencer', label: 'Por vencer', icon: Clock3 },
  { value: 'sin_asignar', label: 'Sin asignar', icon: UserRound },
] as const
const ORDENES = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguos', label: 'Más antiguos' },
  { value: 'urgentes', label: 'Menor plazo restante' },
  { value: 'empresa', label: 'Empresa: A a Z' },
]

export function ReclamosPage() {
  const { reclamos } = useReclamosDemo()
  const [params, setParams] = useSearchParams()
  const [preview, setPreview] = useState<ReclamoListado | null>(null)
  const filtros: FiltrosListado = {
    buscar: params.get('buscar') ?? '',
    estado: params.get('estado') ?? '',
    mercado: params.get('mercado') ?? '',
    responsable: params.get('responsable') ?? '',
    alcance: params.get('alcance') === 'mios' ? 'mios' : 'todos',
    atencion: ATENCION.some((item) => item.value === params.get('atencion'))
      ? (params.get('atencion') as Atencion)
      : 'todos',
    orden: ORDENES.some((item) => item.value === params.get('orden'))
      ? (params.get('orden') as Orden)
      : 'recientes',
  }
  const baseRows = filtrarReclamos(
    reclamos,
    { ...filtros, atencion: 'todos' },
    USUARIO_DEMO,
    RESPONSABLES,
  )
  const filteredRows = filtrarReclamos(
    reclamos,
    filtros,
    USUARIO_DEMO,
    RESPONSABLES,
  )
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const requestedPage = Number(params.get('pagina') ?? 1)
  const page = Number.isInteger(requestedPage)
    ? Math.min(totalPages, Math.max(1, requestedPage))
    : 1
  const start = (page - 1) * PAGE_SIZE
  const rows = filteredRows.slice(start, start + PAGE_SIZE)
  const hasFilters = Boolean(
    filtros.buscar ||
    filtros.estado ||
    filtros.mercado ||
    filtros.responsable ||
    filtros.alcance !== 'todos' ||
    filtros.atencion !== 'todos',
  )
  const counts: Record<Atencion, number> = {
    todos: baseRows.length,
    vencidos: baseRows.filter((row) => row.atencion === 'vencido').length,
    por_vencer: baseRows.filter((row) => row.atencion === 'por_vencer').length,
    sin_asignar: baseRows.filter((row) => row.responsableId === null).length,
  }

  function updateParam(key: string, value: string, replace = false) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (
          !value ||
          value === 'todos' ||
          (key === 'orden' && value === 'recientes')
        )
          next.delete(key)
        else next.set(key, value)
        if (key !== 'pagina') next.delete('pagina')
        return next
      },
      { replace },
    )
  }

  function clearFilters() {
    setParams(filtros.orden === 'recientes' ? {} : { orden: filtros.orden })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Reclamos"
        subtitle={`${reclamos.length} activos · corte al ${fechaVisible(FECHA_REFERENCIA)}`}
        action={
          <SegmentedControl
            label="Alcance del listado"
            value={filtros.alcance}
            onChange={(value) => updateParam('alcance', value)}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'mios', label: 'Míos' },
            ]}
          />
        }
      />

      <Glass
        padding="none"
        className="shrink-0 p-4 compact:p-3"
        aria-label="Filtros del listado"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.15fr_1fr_1fr]">
          <div className="min-w-0">
            <p aria-hidden className="mb-1.5 text-caption text-ink-muted">
              Buscar reclamo
            </p>
            <SearchField
              label="Buscar en el listado"
              placeholder="Folio, empresa, asunto o comuna"
              value={filtros.buscar}
              onChange={(event) =>
                updateParam('buscar', event.target.value, true)
              }
            />
          </div>
          <SelectField
            label="Estado"
            value={filtros.estado}
            onValueChange={(value) => updateParam('estado', value)}
            options={[
              { value: '', label: 'Todos los estados' },
              ...Object.entries(ESTADOS).map(([value, info]) => ({
                value,
                label: info.label,
              })),
            ]}
          />
          <SelectField
            label="Mercado"
            value={filtros.mercado}
            onValueChange={(value) => updateParam('mercado', value)}
            options={[
              { value: '', label: 'Todos los mercados' },
              ...MERCADOS.map((value) => ({ value, label: value })),
            ]}
          />
          <SelectField
            label="Responsable"
            value={filtros.responsable}
            onValueChange={(value) => updateParam('responsable', value)}
            options={[
              { value: '', label: 'Todos los responsables' },
              { value: 'sin_asignar', label: 'Sin asignar' },
              ...RESPONSABLES.map((item) => ({
                value: item.id,
                label: item.nombre,
              })),
            ]}
          />
        </div>
      </Glass>

      <Glass
        padding="none"
        className="flex min-h-0 flex-1 flex-col gap-4 p-4 compact:gap-3"
        aria-label="Resultados del listado"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Atención de reclamos"
            className="flex flex-wrap gap-1"
          >
            {ATENCION.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filtros.atencion === value}
                onClick={() => updateParam('atencion', value)}
                className={cn(
                  'flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-caption transition-colors',
                  filtros.atencion === value
                    ? 'bg-glass-strong text-ink shadow-tile ring-1 ring-glass-rim'
                    : 'text-ink-muted hover:bg-glass-tile',
                )}
                title={
                  value === 'por_vencer'
                    ? 'Casos activos con 0 a 3 días corridos restantes'
                    : undefined
                }
              >
                <Icon size={14} strokeWidth={1.6} aria-hidden />
                {label}
                <span className="ml-0.5 font-mono text-id">
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={clearFilters}
              >
                Limpiar
              </Button>
            )}
            <SelectField
              label="Ordenar reclamos"
              hideLabel
              value={filtros.orden}
              onValueChange={(value) => updateParam('orden', value)}
              options={ORDENES}
              className="w-44"
            />
          </div>
        </div>

        {rows.length ? (
          <ReclamosTable
            key={`${page}-${filtros.orden}`}
            rows={rows}
            onPreview={setPreview}
          />
        ) : (
          <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center tall:min-h-0">
            <span className="glass-tile grid size-14 place-items-center rounded-full">
              <SearchX size={24} strokeWidth={1.5} aria-hidden />
            </span>
            <h2 className="text-title">No se encontraron reclamos</h2>
            <p className="max-w-sm text-body text-ink-muted">
              Pruebe con otra búsqueda o quite algunos filtros para ver más
              casos.
            </p>
            <Button onClick={clearFilters} icon={RotateCcw}>
              Limpiar filtros
            </Button>
          </div>
        )}

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-glass-shade pt-3">
          <div>
            <p
              role="status"
              aria-live="polite"
              className="text-caption text-ink-muted"
            >
              {filteredRows.length
                ? `${start + 1}–${Math.min(start + PAGE_SIZE, filteredRows.length)} de ${filteredRows.length} ${filteredRows.length === 1 ? 'reclamo' : 'reclamos'}`
                : '0 reclamos'}
            </p>
            <p className="mt-0.5 text-caption text-ink-muted">
              Datos ficticios. Los registros se reinician al recargar la página.
            </p>
          </div>
          <nav
            aria-label="Paginación de reclamos"
            className="flex max-w-full flex-wrap items-center justify-end gap-1"
          >
            <IconButton
              size="sm"
              variant="ghost"
              icon={ChevronLeft}
              label="Página anterior"
              className="disabled:cursor-not-allowed disabled:opacity-45"
              disabled={page === 1}
              onClick={() => updateParam('pagina', String(page - 1))}
            />
            {paginasVisibles(page, totalPages).map((number) =>
              typeof number === 'string' ? (
                <span
                  key={number}
                  aria-hidden
                  className="w-5 text-center text-caption text-ink-muted"
                >
                  …
                </span>
              ) : (
                <button
                  key={number}
                  type="button"
                  aria-label={`Página ${number}`}
                  aria-current={page === number ? 'page' : undefined}
                  onClick={() => updateParam('pagina', String(number))}
                  className={cn(
                    'grid size-8 cursor-pointer place-items-center rounded-full text-caption tabular-nums transition-colors',
                    page === number
                      ? 'bg-glass-strong font-medium shadow-tile ring-1 ring-glass-rim'
                      : 'text-ink-muted hover:bg-glass-tile',
                  )}
                >
                  {number}
                </button>
              ),
            )}
            <IconButton
              size="sm"
              variant="ghost"
              icon={ChevronRight}
              label="Página siguiente"
              className="disabled:cursor-not-allowed disabled:opacity-45"
              disabled={page === totalPages}
              onClick={() => updateParam('pagina', String(page + 1))}
            />
          </nav>
        </footer>
      </Glass>
      {preview && (
        <ReclamoPreview reclamo={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}
