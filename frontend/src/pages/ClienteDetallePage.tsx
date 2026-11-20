import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Ban,
  Building2,
  CircleCheck,
  FileText,
  MessageSquareText,
  Paperclip,
  SearchX,
} from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import { PlazoChip } from '@/features/reclamos/PlazoChip'
import { fechaVisible } from '@/features/reclamos/listado/model'
import { useMisReclamos } from '@/features/cliente/useMisReclamos'
import { estaActivo, requiereAntecedentes } from '@/features/cliente/model'
import { AportarAntecedentes } from '@/features/cliente/AportarAntecedentes'
import { ETAPAS, indiceEtapa } from '@/features/cliente/etapas'
import { cn } from '@/lib/cn'

export function ClienteDetallePage() {
  const { reclamoId } = useParams()
  const { reclamos, seguimiento, detalle } = useMisReclamos()
  const reclamo = reclamos.find((row) => row.id === reclamoId)
  const volver = (
    <Link
      to="/portal/reclamos"
      className="inline-flex w-fit items-center gap-2 rounded-sm text-label text-brand hover:underline"
    >
      <ArrowLeft size={16} aria-hidden />
      Volver a mis reclamos
    </Link>
  )
  if (!reclamo)
    return (
      <div className="space-y-6">
        {volver}
        <Glass className="flex flex-col items-center gap-3 py-14 text-center">
          <SearchX size={34} strokeWidth={1.5} aria-hidden />
          <h1 className="text-display">Reclamo no disponible</h1>
          <p className="max-w-md text-body text-ink-muted">
            No encontramos este reclamo en tu cuenta. Revisa el folio o vuelve a
            tu listado.
          </p>
        </Glass>
      </div>
    )
  const eventos = seguimiento(reclamo)
  const ficha = detalle(reclamo.id)
  const pendiente = requiereAntecedentes(reclamo, eventos)
  const etapaActual = indiceEtapa(reclamo.estado)
  return (
    <div className="flex flex-col gap-6">
      {volver}
      <Glass className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-id text-ink-muted">{reclamo.id}</p>
            <h1 className="mt-2 text-display break-words">{reclamo.asunto}</h1>
            <p className="mt-3 flex items-start gap-2 text-body text-ink-muted">
              <Building2 size={17} className="mt-0.5 shrink-0" aria-hidden />
              <span className="min-w-0 break-words">{reclamo.empresa}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <EstadoBadge estado={reclamo.estado} />
            {estaActivo(reclamo) && reclamo.diasRestantes !== null && (
              <PlazoChip dias={reclamo.diasRestantes} />
            )}
          </div>
        </div>
        {reclamo.estado !== 'anulado' && (
          <ol
            aria-label="Etapas del reclamo"
            className="mt-7 grid grid-cols-5 gap-2 border-t border-glass-shade pt-5"
          >
            {ETAPAS.map((label, index) => (
              <li
                key={label}
                aria-current={index === etapaActual ? 'step' : undefined}
                className="min-w-0"
              >
                <span
                  className={cn(
                    'mb-2 block h-1.5 rounded-full',
                    index <= etapaActual ? 'bg-brand' : 'bg-glass-shade',
                  )}
                />
                <span
                  className={cn(
                    'text-caption break-words',
                    index === etapaActual
                      ? 'font-medium text-brand'
                      : 'text-ink-muted',
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Glass>
      {pendiente && (
        <Glass className="flex items-start gap-3 border border-warning/20">
          <MessageSquareText
            size={22}
            className="mt-0.5 shrink-0 text-warning"
            aria-hidden
          />
          <div>
            <h2 className="text-title">Tu caso necesita más antecedentes</h2>
            <p className="mt-2 text-body text-ink-muted">
              {eventos.find((item) => item.tipo === 'solicitud')?.descripcion}
            </p>
            <a
              href="#aportar-antecedentes"
              className="mt-3 inline-flex rounded-sm text-label text-brand hover:underline"
            >
              Agregar información al caso
            </a>
          </div>
        </Glass>
      )}
      {reclamo.resultado && (
        <Glass className="flex items-start gap-3">
          {reclamo.estado === 'anulado' ? (
            <Ban
              size={23}
              className="mt-0.5 shrink-0 text-ink-muted"
              aria-hidden
            />
          ) : (
            <CircleCheck
              size={23}
              className="mt-0.5 shrink-0 text-success"
              aria-hidden
            />
          )}
          <div>
            <h2 className="text-title">
              {reclamo.estado === 'anulado'
                ? 'Reclamo anulado'
                : 'Resultado del reclamo'}
            </h2>
            <p className="mt-2 text-body text-ink-muted">{reclamo.resultado}</p>
          </div>
        </Glass>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Glass title="Antecedentes del reclamo">
            <p className="text-body whitespace-pre-wrap break-words text-ink-muted">
              {reclamo.descripcion ||
                'Revisión de los antecedentes entregados al registrar el caso.'}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-glass-shade pt-5">
              <div>
                <dt className="text-caption text-ink-muted">Ingreso</dt>
                <dd className="mt-1 text-label">
                  {fechaVisible(reclamo.fechaIngreso)}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-ink-muted">Comuna</dt>
                <dd className="mt-1 text-label">{reclamo.comuna}</dd>
              </div>
              <div>
                <dt className="text-caption text-ink-muted">Mercado</dt>
                <dd className="mt-1 text-label break-words">
                  {reclamo.mercado}
                </dd>
              </div>
              {estaActivo(reclamo) && (
                <div>
                  <dt className="text-caption text-ink-muted">Fecha límite</dt>
                  <dd className="mt-1 text-label">
                    {fechaVisible(reclamo.fechaLimite)}
                  </dd>
                </div>
              )}
              {reclamo.fechaCierre && (
                <div>
                  <dt className="text-caption text-ink-muted">Cierre</dt>
                  <dd className="mt-1 text-label">
                    {fechaVisible(reclamo.fechaCierre)}
                  </dd>
                </div>
              )}
            </dl>
            {Boolean(ficha?.adjuntos.length) && (
              <div className="mt-5 border-t border-glass-shade pt-5">
                <h3 className="text-label">Documentos del caso</h3>
                <ul className="mt-3 space-y-2">
                  {ficha?.adjuntos.map((nombre, index) => (
                    <li
                      key={`${nombre}-${index}`}
                      className="flex items-center gap-2 text-body text-ink-muted"
                    >
                      <Paperclip size={15} className="shrink-0" aria-hidden />
                      <span className="break-all">{nombre}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Glass>
          {estaActivo(reclamo) && (
            <div id="aportar-antecedentes" className="scroll-mt-6">
              <AportarAntecedentes key={reclamo.id} reclamoId={reclamo.id} />
            </div>
          )}
        </div>
        <Glass
          title="Seguimiento del caso"
          subtitle="Novedades y antecedentes compartidos contigo"
        >
          <ol className="space-y-5">
            {[...eventos].reverse().map((evento) => (
              <li key={evento.id} className="flex min-w-0 gap-3">
                <span className="glass-strong mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-brand">
                  {evento.tipo === 'resultado' ? (
                    <CircleCheck size={16} aria-hidden />
                  ) : (
                    <FileText size={15} aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1 border-b border-glass-shade pb-5">
                  <p className="text-caption text-ink-muted">
                    {fechaVisible(evento.fecha)}
                  </p>
                  <h3 className="mt-1 text-label font-medium">
                    {evento.titulo}
                  </h3>
                  <p className="mt-2 text-body whitespace-pre-wrap break-words text-ink-muted">
                    {evento.descripcion}
                  </p>
                  {evento.adjuntos?.map((file, index) => (
                    <p
                      key={`${file.nombre}-${index}`}
                      className="mt-2 flex items-start gap-1.5 text-caption break-all text-ink-muted"
                    >
                      <Paperclip
                        size={14}
                        className="mt-0.5 shrink-0"
                        aria-hidden
                      />
                      {file.nombre}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </Glass>
      </div>
    </div>
  )
}
