import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  Ban,
  CircleCheck,
  FileQuestion,
  FileText,
  Search,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ChipGroup } from '@/components/ui/ChipGroup'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { PageHeading } from '@/components/layout/PageHeading'
import { EstadoBadge } from '@/features/reclamos/EstadoBadge'
import { PlazoChip } from '@/features/reclamos/PlazoChip'
import { PlazoRing } from '@/features/reclamos/PlazoRing'
import { useBandeja } from '@/features/supervision/useBandeja'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { cn } from '@/lib/cn'
import { diaRelativo } from '@/lib/fechas'
import { PLAZO_DIAS } from '@/features/reclamos/estados'

type Decision = 'asignar' | 'pedir' | 'anular'
type Tipo = 'nuevo' | 'antecedentes'

const DECISIONES: {
  value: Decision
  label: string
  hint: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    value: 'asignar',
    label: 'Asignar',
    hint: 'Está completo',
    icon: UserPlus,
    tone: 'bg-brand-mist text-brand',
  },
  {
    value: 'pedir',
    label: 'Pedir antecedentes',
    hint: 'Falta información',
    icon: FileQuestion,
    tone: 'bg-[color-mix(in_srgb,var(--color-warning)_10%,white)] text-warning',
  },
  {
    value: 'anular',
    label: 'Anular',
    hint: 'No corresponde',
    icon: Ban,
    tone: 'bg-[color-mix(in_srgb,var(--color-danger)_10%,white)] text-danger',
  },
]

const FALTANTES = [
  { value: 'boleta', label: 'Boleta o comprobante' },
  { value: 'respuesta', label: 'Respuesta de la empresa' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'otro', label: 'Otro' },
]
const MOTIVOS = [
  { value: 'improcedente', label: 'Improcedente' },
  { value: 'desiste', label: 'El consumidor desiste' },
  { value: 'duplicado', label: 'Duplicado' },
]

/**
 * Bandeja de revisión del supervisor: elegir un ingreso y decidir entre
 * asignarlo, pedir antecedentes o anularlo (actividades 2 a 6 del BPMN).
 */
export function BandejaPage() {
  const [params] = useSearchParams()
  const { registrarGestion } = useReclamosDemo()
  const { ingresos: pendientes, equipo } = useBandeja()
  const porCarga = [...equipo].sort((a, b) => a.activos - b.activos)
  const pedido = pendientes.find((item) => item.id === params.get('caso'))
  const [tipo, setTipo] = useState<Tipo>(pedido?.tipo ?? 'nuevo')
  const lista = pendientes.filter((item) => item.tipo === tipo)
  const [selId, setSelId] = useState(pedido?.id ?? lista[0]?.id)
  const sel = lista.find((item) => item.id === selId) ?? lista[0]

  const [decision, setDecision] = useState<Decision>('asignar')
  const [destinoId, setDestinoId] = useState(porCarga[0].id)
  const [verTodos, setVerTodos] = useState(false)
  const [faltan, setFaltan] = useState<string[]>(['boleta'])
  const [mensaje, setMensaje] = useState(
    'Adjunta la boleta y, si la tienes, la respuesta de la empresa a tu solicitud.',
  )
  const [motivo, setMotivo] = useState<string[]>([])
  const [explicacion, setExplicacion] = useState('')
  const [intento, setIntento] = useState(false)
  const [aviso, setAviso] = useState('')

  // Si se llega con ?caso=, muestra ese reclamo en la lista aunque esté abajo.
  useEffect(() => {
    document
      .querySelector(
        '[aria-label="Reclamos por revisar"] [aria-current="true"]',
      )
      ?.scrollIntoView({ block: 'nearest' })
  }, [])

  const totalTipo = {
    nuevo: pendientes.filter((item) => item.tipo === 'nuevo').length,
    antecedentes: pendientes.filter((item) => item.tipo === 'antecedentes')
      .length,
  }
  const destino = porCarga.find((persona) => persona.id === destinoId)!
  const sugeridos = verTodos ? porCarga : porCarga.slice(0, 3)

  const errores = {
    faltan: faltan.length === 0 ? 'Elija al menos un antecedente.' : '',
    mensaje:
      mensaje.trim().length < 10
        ? 'Escriba qué necesita, para que el consumidor sepa qué enviar.'
        : '',
    motivo: motivo.length === 0 ? 'Elija el motivo.' : '',
    explicacion:
      explicacion.trim().length < 10
        ? 'Escriba por qué se anula. El consumidor lo leerá.'
        : '',
  }
  const invalido =
    (decision === 'pedir' && Boolean(errores.faltan || errores.mensaje)) ||
    (decision === 'anular' && Boolean(errores.motivo || errores.explicacion))

  function elegir(id: string) {
    setSelId(id)
    setDecision('asignar')
    setIntento(false)
    setMotivo([])
    setExplicacion('')
  }

  function confirmar() {
    if (!sel) return
    if (invalido) {
      setIntento(true)
      return
    }
    const texto = {
      asignar: `${sel.id} quedó asignado a ${destino.nombre}.`,
      pedir: `Se pidieron antecedentes para ${sel.id}. Volverá a la bandeja cuando el consumidor responda.`,
      anular: `${sel.id} quedó anulado y fuera de los indicadores.`,
    }[decision]
    const motivoTexto =
      MOTIVOS.find((item) => item.value === motivo[0])?.label ?? ''
    const faltantes = FALTANTES.filter((item) => faltan.includes(item.value))
      .map((item) => item.label.toLowerCase())
      .join(', ')
    const registrado = {
      asignar: () =>
        registrarGestion(
          sel.id,
          {
            fecha: diaRelativo(0),
            titulo: `Asignado a ${destino.nombre}`,
            detalle: 'Andrea Fuentes · antecedentes completos',
            tipo: 'gestion',
          },
          { estado: 'asignado', responsableId: destino.id },
        ),
      pedir: () =>
        registrarGestion(
          sel.id,
          {
            fecha: diaRelativo(0),
            titulo: 'Necesitamos más antecedentes',
            detalle: `${mensaje.trim()} (Falta: ${faltantes}.)`,
            tipo: 'gestion',
            solicitud: true,
          },
          { estado: 'pendiente_antecedentes' },
        ),
      anular: () =>
        registrarGestion(
          sel.id,
          {
            fecha: diaRelativo(0),
            titulo: `Reclamo anulado · ${motivoTexto}`,
            detalle: explicacion.trim(),
            tipo: 'gestion',
          },
          { estado: 'anulado', resultado: explicacion.trim() },
        ),
    }[decision]()
    if (!registrado) return
    setAviso(texto)
    const siguiente = lista.find((item) => item.id !== sel.id)
    if (siguiente) elegir(siguiente.id)
  }

  const efecto = {
    asignar: `El caso pasa a Asignado y aparece en Mis casos de ${destino.nombre}.`,
    pedir:
      'El caso pasa a Pendiente de antecedentes. Vuelve aquí cuando el consumidor responda.',
    anular: 'El caso pasa a Anulado y queda fuera de los indicadores.',
  }[decision]
  const boton = {
    asignar: `Asignar a ${destino.nombre}`,
    pedir: 'Pedir antecedentes',
    anular: 'Anular reclamo',
  }[decision]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Bandeja de revisión"
        subtitle="Los más antiguos primero"
        action={
          <SegmentedControl
            label="Filtrar bandeja"
            value={tipo}
            onChange={(value) => {
              setTipo(value)
              const primero = pendientes.find((item) => item.tipo === value)
              if (primero) elegir(primero.id)
              setAviso('')
            }}
            options={[
              { value: 'nuevo', label: `Nuevos · ${totalTipo.nuevo}` },
              {
                value: 'antecedentes',
                label: `Antecedentes recibidos · ${totalTipo.antecedentes}`,
              },
            ]}
          />
        }
      />
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>
      {aviso && (
        <div className="glass-strong flex items-center gap-2.5 self-start rounded-full px-4 py-2 text-caption font-medium text-success">
          <CircleCheck size={16} aria-hidden /> {aviso}
        </div>
      )}

      <div className="grid flex-1 gap-6 *:min-w-0 lg:grid-cols-[minmax(18rem,0.78fr)_2fr] tall:min-h-0">
        <Glass
          padding="sm"
          aria-label="Reclamos por revisar"
          className="flex flex-col gap-1 tall:min-h-0 tall:overflow-y-auto"
        >
          <p className="px-3 pt-1 pb-1.5 text-caption text-ink-muted">
            {lista.length} por revisar · desplácese para ver todos
          </p>
          {lista.map((item) => {
            const on = item.id === sel?.id
            return (
              <button
                key={item.id}
                type="button"
                aria-current={on}
                onClick={() => elegir(item.id)}
                className={cn(
                  'grid w-full cursor-pointer grid-cols-[1.875rem_minmax(0,1fr)] items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                  on
                    ? 'border-glass-rim bg-glass-strong shadow-tile'
                    : 'border-transparent hover:bg-glass-tile',
                )}
              >
                <PlazoRing dias={item.dias} />
                <span className="min-w-0">
                  <span className="flex justify-between gap-2">
                    <span className="text-id font-mono text-ink-muted">
                      {item.id}
                    </span>
                    <span
                      className={cn(
                        'text-caption whitespace-nowrap',
                        item.dias < 0
                          ? 'font-medium text-danger'
                          : item.dias <= 3
                            ? 'font-medium text-warning'
                            : 'text-ink-muted',
                      )}
                    >
                      {item.dias < 0
                        ? `vencido hace ${-item.dias} d`
                        : item.dias === 0
                          ? 'vence hoy'
                          : `${item.dias} días`}
                    </span>
                  </span>
                  <span className="line-clamp-2 font-medium">
                    {item.asunto}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {item.empresa}
                  </span>
                </span>
              </button>
            )
          })}
          {lista.length === 0 && (
            <p className="p-4 text-caption text-ink-muted">
              No hay reclamos por revisar en esta pestaña.
            </p>
          )}
          <Link
            to="/reclamos?atencion=sin_asignar"
            className="mt-auto px-3 pt-2 pb-1 text-caption font-medium text-brand"
          >
            Ver todos los sin asignar
          </Link>
        </Glass>

        {sel ? (
          <Glass
            aria-labelledby="caso-titulo"
            className="flex flex-col gap-4 px-6 py-5 tall:min-h-0 tall:overflow-y-auto compact:gap-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-id font-mono text-ink-muted">
                  {sel.id} · ingresó el {diaRelativo(sel.dias - PLAZO_DIAS)}
                </p>
                <h2
                  id="caso-titulo"
                  className="text-[1.375rem] leading-7 font-medium"
                >
                  {sel.asunto}
                </h2>
              </div>
              <div className="flex gap-2">
                <EstadoBadge
                  estado={
                    sel.tipo === 'nuevo'
                      ? 'ingresado'
                      : 'pendiente_antecedentes'
                  }
                  short
                />
                <PlazoChip dias={sel.dias} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
              <div className="glass-tile flex flex-col gap-2.5 px-4 py-3.5">
                <p>{sel.relato}</p>
                {sel.respuesta && (
                  <p className="border-l-2 border-brand/40 pl-3 text-ink-muted">
                    <span className="block text-caption font-medium text-ink">
                      Respuesta del consumidor
                    </span>
                    {sel.respuesta}
                  </p>
                )}
                {sel.adjuntos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sel.adjuntos.map((archivo) => (
                      <span key={archivo} className="pill pill-neutral">
                        <FileText size={13} aria-hidden /> {archivo}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <dl className="glass-tile grid grid-cols-2 content-start gap-x-4 gap-y-2.5 px-4 py-3.5">
                {[
                  ['Consumidor', sel.consumidor],
                  ['Comuna', sel.comuna],
                  ['Empresa', sel.empresa],
                  ['Mercado', sel.mercado],
                ].map(([dt, dd]) => (
                  <div key={dt}>
                    <dt className="text-caption text-ink-muted">{dt}</dt>
                    <dd className="font-medium">{dd}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <fieldset>
              <legend className="mb-2.5 text-label">
                ¿Qué hace con este reclamo?
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {DECISIONES.map((item) => {
                  const on = item.value === decision
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setDecision(item.value)
                        setIntento(false)
                      }}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-md border-[1.5px] px-4 py-3 text-left transition-[border-color,box-shadow,background-color]',
                        on
                          ? 'border-brand bg-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)]'
                          : 'border-glass-rim bg-glass-tile hover:bg-glass-strong',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-10 shrink-0 place-items-center rounded-sm',
                          item.tone,
                        )}
                      >
                        <item.icon size={18} strokeWidth={1.6} aria-hidden />
                      </span>
                      <span>
                        <span className="block font-medium">{item.label}</span>
                        <span className="text-caption text-ink-muted">
                          {item.hint}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {decision === 'asignar' && (
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2.5 flex w-full justify-between text-label">
                  Elija responsable
                  <span className="text-caption font-normal text-ink-muted">
                    Primero, quienes tienen menos casos · KPI 5
                  </span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-4">
                  {sugeridos.map((persona) => {
                    const on = persona.id === destinoId
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setDestinoId(persona.id)}
                        className={cn(
                          'flex cursor-pointer flex-col items-center gap-2 rounded-md border-[1.5px] px-2 py-3 transition-[border-color,box-shadow]',
                          on
                            ? 'border-brand bg-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)]'
                            : 'border-glass-rim bg-glass-tile hover:bg-glass-strong',
                        )}
                      >
                        <span className="relative grid size-16 place-items-center">
                          <svg
                            viewBox="0 0 64 64"
                            aria-hidden
                            className="absolute inset-0 -rotate-90"
                          >
                            <circle
                              cx="32"
                              cy="32"
                              r="29"
                              fill="none"
                              strokeWidth="4"
                              style={{ stroke: 'var(--color-glass-shade)' }}
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="29"
                              fill="none"
                              strokeWidth="4"
                              strokeLinecap="round"
                              pathLength={100}
                              strokeDasharray={`${(persona.activos / porCarga[porCarga.length - 1].activos) * 100} 100`}
                              style={{ stroke: 'var(--color-brand)' }}
                            />
                          </svg>
                          <Avatar name={persona.nombre} size={44} />
                        </span>
                        <span className="font-medium">{persona.nombre}</span>
                        <span className="text-caption text-ink-muted">
                          {persona.activos} casos activos
                        </span>
                      </button>
                    )
                  })}
                  {!verTodos && (
                    <button
                      type="button"
                      onClick={() => setVerTodos(true)}
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-ink-muted/40 px-2 py-3 text-caption text-ink-muted hover:bg-glass-tile"
                    >
                      <Search size={20} strokeWidth={1.6} aria-hidden />
                      Ver todo el equipo
                    </button>
                  )}
                </div>
              </fieldset>
            )}

            {decision === 'pedir' && (
              <div className="flex flex-col gap-2.5">
                <span id="faltan" className="text-label">
                  ¿Qué le falta?
                </span>
                <ChipGroup
                  label="Antecedentes que faltan"
                  multiple
                  options={FALTANTES}
                  value={faltan}
                  onChange={setFaltan}
                  invalid={intento && Boolean(errores.faltan)}
                />
                {intento && errores.faltan && (
                  <p className="text-caption font-medium text-danger">
                    {errores.faltan}
                  </p>
                )}
                <label
                  htmlFor="mensaje"
                  className="text-caption text-ink-muted"
                >
                  Mensaje que verá el consumidor en el portal
                </label>
                <textarea
                  id="mensaje"
                  rows={2}
                  value={mensaje}
                  onChange={(event) => setMensaje(event.target.value)}
                  aria-invalid={intento && Boolean(errores.mensaje)}
                  className={cn(
                    'w-full resize-none rounded-md border border-glass-rim bg-glass-strong px-4 py-3 text-body shadow-tile outline-none focus:shadow-focus-ring',
                    intento && errores.mensaje && 'ring-1 ring-danger/50',
                  )}
                />
                {intento && errores.mensaje && (
                  <p className="text-caption font-medium text-danger">
                    {errores.mensaje}
                  </p>
                )}
              </div>
            )}

            {decision === 'anular' && (
              <div className="flex flex-col gap-2.5">
                <span className="text-label">Motivo</span>
                <ChipGroup
                  label="Motivo de anulación"
                  options={MOTIVOS}
                  value={motivo}
                  onChange={setMotivo}
                  invalid={intento && Boolean(errores.motivo)}
                />
                {intento && errores.motivo && (
                  <p className="text-caption font-medium text-danger">
                    {errores.motivo}
                  </p>
                )}
                <label
                  htmlFor="explicacion"
                  className="text-caption text-ink-muted"
                >
                  Explicación para el consumidor (obligatoria)
                </label>
                <textarea
                  id="explicacion"
                  rows={2}
                  value={explicacion}
                  onChange={(event) => setExplicacion(event.target.value)}
                  placeholder="Explique en una o dos frases por qué no corresponde."
                  aria-invalid={intento && Boolean(errores.explicacion)}
                  className={cn(
                    'w-full resize-none rounded-md border border-glass-rim bg-glass-strong px-4 py-3 text-body shadow-tile outline-none placeholder:text-ink-muted focus:shadow-focus-ring',
                    intento && errores.explicacion && 'ring-1 ring-danger/50',
                  )}
                />
                {intento && errores.explicacion && (
                  <p className="text-caption font-medium text-danger">
                    {errores.explicacion}
                  </p>
                )}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-glass-shade pt-3.5">
              <p className="text-caption text-ink-muted">{efecto}</p>
              <Button variant="ink" onClick={confirmar}>
                {boton}
              </Button>
            </div>
          </Glass>
        ) : (
          <Glass className="grid place-items-center text-center">
            <div>
              <CircleCheck
                size={32}
                className="mx-auto text-success"
                aria-hidden
              />
              <h2 className="mt-2 text-title">Bandeja al día</h2>
              <p className="text-caption text-ink-muted">
                Los nuevos reclamos del portal aparecerán aquí.
              </p>
            </div>
          </Glass>
        )}
      </div>
    </div>
  )
}
