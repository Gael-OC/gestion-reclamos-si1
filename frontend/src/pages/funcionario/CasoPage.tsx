import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Check, CircleCheck, FileText, Send } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import { PlazoChip } from '@/features/reclamos/PlazoChip'
import { PLAZO_DIAS, type Estado } from '@/features/reclamos/estados'
import { COLOR_PLAZO, tonoPlazo } from '@/features/reclamos/plazo'
import {
  CASO_EJEMPLO,
  detalleReclamo,
  type EventoHistorial,
} from '@/features/reclamos/detalle/detalle'
import { Historial } from '@/features/reclamos/detalle/Historial'
import { RESPONSABLES } from '@/features/reclamos/listado/mockData'
import { casoDeFuncionaria, RESULTADOS } from '@/features/funcionario/escenario'
import { PASOS, proximoPaso, type Accion } from '@/features/funcionario/pasos'
import {
  GestionDialog,
  RespuestaDialog,
  ResultadoDialog,
  SolicitudDialog,
} from '@/features/funcionario/dialogos'
import { cn } from '@/lib/cn'
import { diaRelativo } from '@/lib/fechas'

type Abierto = Accion | 'nota' | 'otra' | null

/** Gestión del caso: un solo próximo paso, guiado por el estado del caso. */
export function CasoPage() {
  const { reclamoId = '' } = useParams()
  // La clave reinicia el estado de la demo al cambiar de caso.
  return <CasoGestion key={reclamoId} reclamoId={reclamoId} />
}

function CasoGestion({ reclamoId }: { reclamoId: string }) {
  const { reclamos } = useReclamosDemo()
  // El caso de ejemplo tiene la ficha completa; los demás de la funcionaria
  // salen de su escenario y, si no, del listado de prueba.
  const base =
    reclamoId === CASO_EJEMPLO
      ? detalleReclamo(reclamoId, reclamos, RESPONSABLES)
      : (casoDeFuncionaria(reclamoId) ??
        detalleReclamo(reclamoId, reclamos, RESPONSABLES))
  const [estado, setEstado] = useState<Estado | null>(null)
  const [respuesta, setRespuesta] = useState<boolean | null>(null)
  const [nuevos, setNuevos] = useState<EventoHistorial[]>([])
  const [abierto, setAbierto] = useState<Abierto>(null)
  const [aviso, setAviso] = useState('')

  if (!base) {
    return (
      <div className="grid flex-1 place-items-center">
        <Glass className="max-w-md text-center">
          <h1 className="text-display">No encontramos ese caso</h1>
          <p className="mt-2 text-ink-muted">
            Revise el folio {reclamoId} o vuelva a sus casos.
          </p>
          <Link
            to="/funcionario"
            className="mt-4 inline-block font-medium text-brand"
          >
            Ir a Mis casos
          </Link>
        </Glass>
      </div>
    )
  }

  const estadoActual = estado ?? base.estado
  const conRespuesta = respuesta ?? base.respuestaEmpresa
  const paso = proximoPaso(estadoActual, conRespuesta, base.empresa)
  const dias = base.dias ?? 0
  const activo = base.dias !== null && estadoActual !== 'cerrado'
  const historial = [
    ...base.historial.filter((evento) => evento.tipo !== 'hoy'),
    ...nuevos,
  ]

  const ultimoEmpresa = [...historial]
    .reverse()
    .find((evento) => evento.tipo === 'empresa')
  const segundo =
    estadoActual === 'cerrado'
      ? {
          titulo: 'Resultado publicado',
          texto: historial.at(-1)?.detalle ?? '',
        }
      : paso.accion === 'resultado' || paso.accion === 'respuesta'
        ? {
            titulo:
              paso.accion === 'resultado'
                ? 'Qué respondió la empresa'
                : 'Qué se le pidió a la empresa',
            texto: ultimoEmpresa
              ? `${ultimoEmpresa.detalle} · ${ultimoEmpresa.fecha}`
              : 'Sin registro todavía.',
          }
        : {
            titulo: 'Antecedentes',
            texto: base.adjuntos.length
              ? base.adjuntos.join(' · ')
              : 'Sin archivos adjuntos.',
          }
  const contexto = [
    { titulo: 'Qué pide el consumidor', texto: base.relato },
    segundo,
  ]

  function registrar(evento: Omit<EventoHistorial, 'fecha'>, texto: string) {
    setNuevos((prev) => [...prev, { ...evento, fecha: diaRelativo(0) }])
    setAviso(texto)
    setAbierto(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <Link
            to="/funcionario"
            className="inline-flex items-center gap-1 text-caption font-medium text-brand"
          >
            <ArrowLeft size={14} aria-hidden /> Mis casos
          </Link>
          <div className="flex flex-wrap items-baseline gap-x-4">
            <h1 className="text-display">{base.asunto}</h1>
            <span className="text-id font-mono text-ink-muted">{base.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <EstadoBadge estado={estadoActual} short />
          {activo && <PlazoChip dias={dias} />}
        </div>
      </header>
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>

      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-[minmax(0,1.7fr)_minmax(0,1fr)] compact:grid-rows-[minmax(0,2fr)_minmax(0,1fr)] compact:gap-4">
        <Glass
          aria-labelledby="proximo"
          className="flex flex-col gap-4 px-7 py-6 md:col-span-2 tall:min-h-0 compact:gap-3 compact:p-5"
        >
          <span className="text-axis text-ink-muted uppercase">
            {paso.accion ? 'Próximo paso' : 'Listo'}
          </span>
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className={cn(
                'grid size-16 shrink-0 place-items-center rounded-full text-on-ink shadow-[0_20px_36px_-16px_#1e2b4a99]',
                paso.accion
                  ? 'bg-radial-[at_35%_28%] from-orb-acero via-orb-marino to-orb-marino-deep'
                  : 'bg-success',
              )}
            >
              {paso.accion ? (
                <Send size={26} strokeWidth={1.6} />
              ) : (
                <Check size={28} strokeWidth={2} />
              )}
            </span>
            <div>
              <h2 id="proximo" className="text-[1.5rem] leading-8 font-medium">
                {paso.titulo}
              </h2>
              <p className="max-w-[60ch] text-ink-muted">{paso.texto}</p>
            </div>
          </div>
          {aviso && (
            <p className="flex items-center gap-2 text-caption font-medium text-success">
              <CircleCheck size={16} aria-hidden /> {aviso}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2.5">
            {paso.accion && (
              <Button variant="ink" onClick={() => setAbierto(paso.accion)}>
                {paso.boton}
              </Button>
            )}
            {paso.accion === 'resultado' && (
              <Button onClick={() => setAbierto('otra')}>
                Pedir otra gestión a la empresa
              </Button>
            )}
            {estadoActual !== 'cerrado' && (
              <Button onClick={() => setAbierto('nota')}>
                Agregar nota interna
              </Button>
            )}
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2 tall:min-h-0">
            {contexto.map((item) => (
              <div
                key={item.titulo}
                className="glass-tile flex min-h-16 flex-col gap-1 overflow-y-auto px-4 py-3 compact:py-2"
              >
                <span className="text-caption text-ink-muted">
                  {item.titulo}
                </span>
                <p className="text-label font-normal">{item.texto}</p>
              </div>
            ))}
          </div>
          <ol
            aria-label="Avance del caso"
            className="flex border-t border-glass-shade pt-4"
          >
            {PASOS.map((nombre, index) => {
              const hecho = index < paso.indice
              const actual = index === paso.indice
              return (
                <li
                  key={nombre}
                  aria-current={actual ? 'step' : undefined}
                  className="relative flex flex-1 flex-col items-center gap-1.5 text-center"
                >
                  {index > 0 && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-3.5 right-1/2 left-[-50%] -z-10 h-0.5',
                        index <= paso.indice ? 'bg-brand' : 'bg-glass-shade',
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full text-caption font-semibold shadow-[0_0_0_3px_var(--color-glass-strong)]',
                      hecho && 'bg-brand text-on-ink',
                      actual &&
                        'bg-ink text-on-ink shadow-[0_0_0_3px_var(--color-glass-strong),0_0_0_7px_color-mix(in_srgb,var(--color-ink)_15%,transparent)]',
                      !hecho &&
                        !actual &&
                        'bg-glass-strong text-ink-muted ring-[1.5px] ring-orb-pizarra ring-inset',
                    )}
                  >
                    {hecho ? (
                      <Check size={14} strokeWidth={2.4} aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-caption',
                      actual ? 'font-semibold text-ink' : 'text-ink-muted',
                    )}
                  >
                    {nombre}
                  </span>
                </li>
              )
            })}
          </ol>
        </Glass>

        <Glass
          title="Plazo"
          subtitle={`${PLAZO_DIAS} días corridos desde el ingreso`}
          className="flex flex-col gap-4 tall:min-h-0 compact:p-4 [&>header]:mb-0"
        >
          <div className="grid min-h-36 flex-1 place-items-center [container-type:size]">
            <div
              role="img"
              aria-label={
                activo
                  ? `Día ${Math.min(PLAZO_DIAS, PLAZO_DIAS - dias)} de ${PLAZO_DIAS}`
                  : 'Caso cerrado'
              }
              className="relative size-[min(100cqw,100cqh)] max-h-60 max-w-60"
            >
              <svg
                viewBox="0 0 120 120"
                aria-hidden
                className="size-full -rotate-90"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="8"
                  style={{ stroke: 'var(--color-glass-shade)' }}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${activo ? Math.min(100, Math.max(3, ((PLAZO_DIAS - dias) / PLAZO_DIAS) * 100)) : 100} 100`}
                  style={{
                    stroke: activo
                      ? COLOR_PLAZO[tonoPlazo(dias)]
                      : 'var(--color-success)',
                  }}
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-center">
                <span className="flex flex-col items-center gap-1">
                  <span
                    className="text-hero-number"
                    style={{
                      color: activo
                        ? COLOR_PLAZO[tonoPlazo(dias)]
                        : 'var(--color-success)',
                    }}
                  >
                    {!activo
                      ? 'Listo'
                      : dias === 0
                        ? 'Hoy'
                        : dias < 0
                          ? `+${-dias}`
                          : dias}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {!activo
                      ? 'caso cerrado'
                      : dias === 0
                        ? 'vence el plazo'
                        : dias < 0
                          ? 'días de atraso'
                          : 'días restantes'}
                  </span>
                </span>
              </span>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            <div className="glass-tile px-3.5 py-2.5">
              <dt className="text-caption text-ink-muted">Ingreso</dt>
              <dd className="font-medium">{base.fechaIngreso}</dd>
            </div>
            <div className="glass-tile px-3.5 py-2.5">
              <dt className="text-caption text-ink-muted">Fecha límite</dt>
              <dd className="font-medium">{base.fechaLimite}</dd>
            </div>
          </dl>
        </Glass>

        <Glass
          title="Lo último"
          className="flex flex-col md:col-span-2 tall:min-h-0 tall:overflow-y-auto compact:p-4 [&>header]:mb-2"
        >
          <Historial eventos={historial.slice(-4)} />
        </Glass>

        <Glass
          title="Datos"
          className="flex flex-col gap-3 tall:min-h-0 tall:overflow-y-auto compact:p-4 [&>header]:mb-0"
        >
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ['Consumidor', base.consumidor],
              ['Empresa', base.empresa],
              ['Comuna', base.comuna],
              ['Mercado', base.mercado],
            ].map(([dt, dd]) => (
              <div key={dt}>
                <dt className="text-caption text-ink-muted">{dt}</dt>
                <dd className="font-medium">{dd}</dd>
              </div>
            ))}
          </dl>
          <p className="text-caption text-ink-muted">{base.relato}</p>
          {base.adjuntos.length > 0 && (
            <p className="mt-auto flex items-center gap-1.5 text-caption text-ink-muted">
              <FileText size={14} aria-hidden /> {base.adjuntos.length} archivos
              adjuntos
            </p>
          )}
        </Glass>
      </div>

      {(abierto === 'analizar' || abierto === 'nota') && (
        <GestionDialog
          folio={base.id}
          modo={abierto === 'analizar' ? 'analisis' : 'nota'}
          onClose={() => setAbierto(null)}
          onSave={({ texto, visible, tipo }) => {
            if (abierto === 'analizar') setEstado('en_gestion')
            registrar(
              {
                titulo: abierto === 'analizar' ? 'Análisis registrado' : tipo,
                detalle: texto,
                tipo: visible ? 'gestion' : 'nota',
              },
              abierto === 'analizar'
                ? 'Análisis guardado. El caso pasó a En gestión.'
                : visible
                  ? 'Gestión guardada y visible para el consumidor.'
                  : 'Nota interna guardada.',
            )
          }}
        />
      )}
      {(abierto === 'solicitar' || abierto === 'otra') && (
        <SolicitudDialog
          folio={base.id}
          empresa={base.empresa}
          onClose={() => setAbierto(null)}
          onSave={({ hasta, texto }) => {
            setEstado('esperando_empresa')
            setRespuesta(false)
            registrar(
              {
                titulo: `Solicitud enviada a ${base.empresa}`,
                detalle: `Responder antes del ${hasta} · ${texto}`,
                tipo: 'empresa',
              },
              'Solicitud registrada. El caso pasó a Esperando respuesta de empresa.',
            )
          }}
        />
      )}
      {abierto === 'respuesta' && (
        <RespuestaDialog
          folio={base.id}
          empresa={base.empresa}
          onClose={() => setAbierto(null)}
          onSave={({ respondio, texto, otraGestion }) => {
            setEstado('en_gestion')
            setRespuesta(!otraGestion)
            registrar(
              {
                titulo: respondio
                  ? 'La empresa respondió'
                  : 'La empresa no respondió a tiempo',
                detalle: respondio
                  ? texto
                  : 'Se registra la falta de respuesta',
                tipo: 'empresa',
              },
              otraGestion
                ? 'Respuesta guardada. Pida una nueva gestión a la empresa.'
                : 'Respuesta guardada. Ya puede informar el resultado.',
            )
          }}
        />
      )}
      {abierto === 'resultado' && (
        <ResultadoDialog
          folio={base.id}
          dias={dias}
          onClose={() => setAbierto(null)}
          onSave={({ resultado, mensaje }) => {
            setEstado('cerrado')
            registrar(
              {
                titulo: `Caso cerrado · ${RESULTADOS[resultado]}`,
                detalle: mensaje,
                tipo: 'gestion',
              },
              `Resultado publicado en el portal. Caso cerrado ${dias >= 0 ? 'dentro' : 'fuera'} de plazo.`,
            )
          }}
        />
      )}
    </div>
  )
}
