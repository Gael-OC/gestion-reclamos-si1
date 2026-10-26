import { ArrowUpRight, UserRound } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { EstadoBadge } from '../EstadoBadge'
import { PlazoChip } from '../PlazoChip'
import { RESPONSABLES } from './mockData'
import { fechaVisible, type ReclamoListado } from './model'

export function PlazoListado({ reclamo }: { reclamo: ReclamoListado }) {
  if (reclamo.estado === 'anulado') {
    return <span className="pill pill-muted">No aplica</span>
  }
  return (
    <PlazoChip
      dias={reclamo.diasRestantes ?? 0}
      cerrado={reclamo.estado === 'cerrado'}
      dentroDePlazo={reclamo.cierreEnPlazo}
    />
  )
}

export function ResponsableListado({ id }: { id: string | null }) {
  const persona = RESPONSABLES.find((item) => item.id === id)
  return persona ? (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <span aria-hidden>
        <Avatar name={persona.nombre} size={36} />
      </span>
      <span className="truncate text-label">{persona.nombre}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 text-caption text-ink-muted">
      <UserRound size={15} strokeWidth={1.6} aria-hidden />
      Sin asignar
    </span>
  )
}

type ReclamosTableProps = {
  rows: ReclamoListado[]
  onPreview: (row: ReclamoListado) => void
}

export function ReclamosTable({ rows, onPreview }: ReclamosTableProps) {
  return (
    <>
      <div
        role="region"
        aria-label="Tabla de reclamos, desplazable"
        tabIndex={0}
        className="hidden min-h-0 flex-1 overflow-auto rounded-md md:block"
      >
        <table className="w-full min-w-[64rem] table-fixed border-separate border-spacing-0 text-left">
          <caption className="sr-only">Listado de reclamos</caption>
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[19%]" />
            <col className="w-[17%]" />
            <col className="w-[21%]" />
            <col className="w-[19%]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-sky-niebla text-caption text-ink-muted">
            <tr>
              {[
                'Reclamo / ingreso',
                'Empresa / mercado',
                'Responsable',
                'Estado',
                'Plazo',
              ].map((title) => (
                <th
                  key={title}
                  scope="col"
                  className="px-3 py-3 font-medium first:rounded-l-sm last:rounded-r-sm"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                aria-label={`Ver resumen del reclamo ${row.id}`}
                aria-haspopup="dialog"
                onClick={(event) => {
                  event.currentTarget.focus({ preventScroll: true })
                  onPreview(row)
                }}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault()
                    onPreview(row)
                  }
                }}
                className="group cursor-pointer transition-colors hover:bg-glass-tile focus-visible:bg-glass-strong"
              >
                <td className="border-b border-glass-shade px-3 py-3 compact:py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-id text-brand underline-offset-4 group-hover:underline group-focus-visible:underline">
                      {row.id}
                      <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden />
                    </span>
                    <time
                      dateTime={row.fechaIngreso}
                      title={`Ingreso ${fechaVisible(row.fechaIngreso)}`}
                      className="shrink-0 text-caption text-ink-muted"
                    >
                      {fechaVisible(row.fechaIngreso, true)}
                    </time>
                  </div>
                  <p
                    className="mt-0.5 truncate text-caption"
                    title={row.asunto}
                  >
                    {row.asunto}
                  </p>
                </td>
                <td className="border-b border-glass-shade px-3 py-3">
                  <p className="truncate text-label" title={row.empresa}>
                    {row.empresa}
                  </p>
                  <p className="mt-1 truncate text-caption text-ink-muted">
                    {row.mercado}
                  </p>
                </td>
                <td className="border-b border-glass-shade px-3 py-3">
                  <ResponsableListado id={row.responsableId} />
                </td>
                <td className="border-b border-glass-shade px-3 py-3">
                  <EstadoBadge estado={row.estado} short />
                </td>
                <td className="border-b border-glass-shade px-3 py-3">
                  <PlazoListado reclamo={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label="Reclamos" className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.focus({ preventScroll: true })
                onPreview(row)
              }}
              className="group block w-full cursor-pointer rounded-md border border-glass-rim bg-glass-tile p-4 text-left shadow-tile transition-colors hover:bg-glass-strong"
              aria-label={`Ver resumen del reclamo ${row.id}`}
              aria-haspopup="dialog"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-id text-brand underline-offset-4 group-hover:underline group-focus-visible:underline">
                  {row.id}
                  <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden />
                </span>
                <time
                  dateTime={row.fechaIngreso}
                  className="text-caption text-ink-muted"
                >
                  {fechaVisible(row.fechaIngreso, true)}
                </time>
              </span>
              <span className="mt-2 block text-label">{row.asunto}</span>
              <span className="mt-1 block text-caption text-ink-muted">
                {row.empresa} · {row.mercado}
              </span>
              <span className="mt-3 flex flex-wrap gap-2">
                <EstadoBadge estado={row.estado} short />
                <PlazoListado reclamo={row} />
              </span>
              <span className="mt-3 block">
                <ResponsableListado id={row.responsableId} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
