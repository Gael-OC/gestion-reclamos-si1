import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CalendarDays, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { EstadoBadge } from '../EstadoBadge'
import { PlazoListado, ResponsableListado } from './ReclamosTable'
import { fechaVisible, type ReclamoListado } from './model'

export function ReclamoPreview({
  reclamo,
  onClose,
  detalleHref,
}: {
  reclamo: ReclamoListado
  onClose: () => void
  /** Ruta de la ficha completa según el perfil. */
  detalleHref?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    dialog?.showModal()
    return () => {
      dialog?.close()
      previousFocus?.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="resumen-title"
      aria-describedby="resumen-description"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // Un clic en el velo (fuera del contenido) cierra el resumen.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-y-3 right-3 left-auto m-0 h-[calc(100dvh-24px)] max-h-none w-[min(32rem,calc(100vw-24px))] max-w-none overflow-y-auto rounded-xl border border-glass-rim bg-white p-0 text-ink shadow-[0_40px_80px_-20px_#12172a73] transition-[translate,opacity] duration-300 ease-glass backdrop:bg-linear-to-r backdrop:from-ink/10 backdrop:via-ink/25 backdrop:to-ink/50 backdrop:backdrop-blur-[2px] starting:open:translate-x-8 starting:open:opacity-0"
    >
      <div className="flex min-h-full flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-caption text-ink-muted">Resumen del reclamo</p>
          <IconButton icon={X} onClick={onClose} label="Cerrar resumen" />
        </div>
        <h2 id="resumen-title" className="mt-3 font-mono text-title">
          {reclamo.id}
        </h2>
        <p id="resumen-description" className="mt-2 break-words text-display">
          {reclamo.asunto}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <EstadoBadge estado={reclamo.estado} />
          <PlazoListado reclamo={reclamo} />
        </div>
        {reclamo.descripcion && (
          <section className="mt-5">
            <h3 className="text-caption text-ink-muted">Descripción</h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-body">
              {reclamo.descripcion}
            </p>
          </section>
        )}
        <dl className="mt-6 grid grid-cols-1 gap-5 border-t border-glass-shade pt-5 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-caption text-ink-muted">Empresa</dt>
            <dd className="mt-1 break-words text-label">{reclamo.empresa}</dd>
          </div>
          <div>
            <dt className="text-caption text-ink-muted">Mercado</dt>
            <dd className="mt-1 text-label">{reclamo.mercado}</dd>
          </div>
          <div>
            <dt className="text-caption text-ink-muted">Comuna</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-label">
              <MapPin size={14} strokeWidth={1.6} aria-hidden />
              {reclamo.comuna}
            </dd>
          </div>
          <div>
            <dt className="mb-2 text-caption text-ink-muted">Responsable</dt>
            <dd>
              <ResponsableListado id={reclamo.responsableId} />
            </dd>
          </div>
          <div>
            <dt className="text-caption text-ink-muted">Fecha de ingreso</dt>
            <dd className="mt-1 text-label">
              <time dateTime={reclamo.fechaIngreso}>
                {fechaVisible(reclamo.fechaIngreso)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-caption text-ink-muted">Fecha límite</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-label">
              <CalendarDays size={14} strokeWidth={1.6} aria-hidden />
              <time dateTime={reclamo.fechaLimite}>
                {fechaVisible(reclamo.fechaLimite)}
              </time>
            </dd>
          </div>
          {reclamo.fechaCierre && (
            <div>
              <dt className="text-caption text-ink-muted">
                {reclamo.estado === 'anulado'
                  ? 'Fecha de anulación'
                  : 'Fecha de cierre'}
              </dt>
              <dd className="mt-1 text-label">
                <time dateTime={reclamo.fechaCierre}>
                  {fechaVisible(reclamo.fechaCierre)}
                </time>
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-glass-shade pt-5">
          <Button onClick={onClose}>Volver al listado</Button>
          {detalleHref ? (
            <Link
              to={detalleHref}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-label text-on-ink shadow-ink hover:bg-ink-soft"
            >
              Ver ficha completa <ArrowRight size={16} aria-hidden />
            </Link>
          ) : (
            <p className="text-caption text-ink-muted">Vista de consulta</p>
          )}
        </div>
      </div>
    </dialog>
  )
}
