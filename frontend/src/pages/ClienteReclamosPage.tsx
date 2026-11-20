import { Link, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight, SearchX, Plus } from 'lucide-react'
import { PageHeading } from '@/components/layout/PageHeading'
import { Glass } from '@/components/ui/Glass'
import { SearchField } from '@/components/ui/SearchField'
import { SelectField } from '@/components/ui/SelectField'
import { Button } from '@/components/ui/Button'
import { useMisReclamos } from '@/features/cliente/useMisReclamos'
import { ReclamoClienteFila } from '@/features/cliente/ReclamoClienteFila'
import { estaActivo } from '@/features/cliente/model'
import { ESTADOS } from '@/features/reclamos/estados'
import { normalizarBusqueda } from '@/features/reclamos/listado/model'

const PAGE_SIZE = 6

export function ClienteReclamosPage() {
  const { reclamos } = useMisReclamos()
  const [params, setParams] = useSearchParams()
  const buscar = params.get('buscar') ?? ''
  const estado = params.get('estado') ?? ''
  const terms = normalizarBusqueda(buscar).split(/\s+/).filter(Boolean)
  const rows = reclamos.filter((row) => {
    const texto = normalizarBusqueda(`${row.id} ${row.asunto} ${row.empresa}`)
    return (
      terms.every((term) => texto.includes(term)) &&
      (!estado ||
        (estado === 'activos' ? estaActivo(row) : row.estado === estado))
    )
  })
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const requestedPage = Number(params.get('pagina') ?? 1)
  const page = Number.isInteger(requestedPage)
    ? Math.min(pages, Math.max(1, requestedPage))
    : 1
  const start = (page - 1) * PAGE_SIZE

  function actualizar(campo: string, value: string) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(campo, value)
        else next.delete(campo)
        if (campo !== 'pagina') next.delete('pagina')
        return next
      },
      { replace: campo === 'buscar' },
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 compact:gap-5">
      <PageHeading
        title="Mis reclamos"
        subtitle="Consulta el estado y las novedades de tus casos"
        action={
          <Link
            to="/portal/reclamos/nuevo"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-label text-on-ink shadow-ink hover:bg-ink-soft"
          >
            <Plus size={17} aria-hidden /> Nuevo reclamo
          </Link>
        }
      />
      <Glass
        className="grid gap-4 sm:grid-cols-[1fr_18rem]"
        aria-label="Filtrar mis reclamos"
      >
        <div>
          <p aria-hidden className="mb-1.5 text-caption text-ink-muted">
            Buscar reclamo
          </p>
          <SearchField
            label="Buscar en mis reclamos"
            placeholder="Folio, empresa o asunto"
            value={buscar}
            onChange={(e) => actualizar('buscar', e.target.value)}
          />
        </div>
        <SelectField
          label="Estado"
          value={estado}
          onValueChange={(value) => actualizar('estado', value)}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'activos', label: 'En seguimiento' },
            ...Object.entries(ESTADOS).map(([value, item]) => ({
              value,
              label: item.label,
            })),
          ]}
        />
      </Glass>
      <Glass className="flex flex-1 flex-col">
        <p
          role="status"
          aria-live="polite"
          className="px-1 pb-4 text-caption text-ink-muted"
        >
          {rows.length}{' '}
          {rows.length === 1 ? 'reclamo encontrado' : 'reclamos encontrados'}
        </p>
        {rows.length ? (
          <ul className="flex flex-col divide-y divide-glass-shade">
            {rows.slice(start, start + PAGE_SIZE).map((row) => (
              <li key={row.id}>
                <ReclamoClienteFila reclamo={row} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
            <SearchX
              size={32}
              strokeWidth={1.5}
              className="text-ink-muted"
              aria-hidden
            />
            <h2 className="text-title">No hay reclamos para mostrar</h2>
            <p className="text-body text-ink-muted">
              Tus casos aparecerán aquí al registrarlos. También puedes revisar
              los filtros.
            </p>
            {(buscar || estado) && (
              <Button onClick={() => setParams({})}>Limpiar filtros</Button>
            )}
          </div>
        )}
        {pages > 1 && (
          <nav
            aria-label="Paginación de mis reclamos"
            className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-glass-shade pt-4"
          >
            <p className="text-caption text-ink-muted">
              Página {page} de {pages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                icon={ChevronLeft}
                disabled={page === 1}
                onClick={() => actualizar('pagina', String(page - 1))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                iconRight={ChevronRight}
                disabled={page === pages}
                onClick={() => actualizar('pagina', String(page + 1))}
              >
                Siguiente
              </Button>
            </div>
          </nav>
        )}
      </Glass>
    </div>
  )
}
