import { useState, type FormEvent } from 'react'
import { CircleCheck, Minus, Plus, X } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Switch } from '@/components/ui/Switch'
import { PageHeading } from '@/components/layout/PageHeading'
import { PLAZO_DIAS } from '@/features/reclamos/estados'
import { CATALOGOS } from '@/features/supervision/escenario'
import { cn } from '@/lib/cn'
import { fechaCorta, fechaLarga, hoy, sumarDias } from '@/lib/fechas'

type Catalogo = keyof typeof CATALOGOS

const NOMBRES: Record<Catalogo, { label: string; nuevo: string }> = {
  empresas: { label: 'Empresas', nuevo: 'Nueva empresa' },
  mercados: { label: 'Mercados', nuevo: 'Nuevo mercado' },
  comunas: { label: 'Comunas', nuevo: 'Nueva comuna' },
}

const AVISOS = [
  {
    id: 'vencido',
    titulo: 'Caso vencido',
    detalle:
      'Avisa a la supervisión y al responsable cuando un caso supera su plazo.',
  },
  {
    id: 'asignado',
    titulo: 'Caso asignado',
    detalle: 'Avisa al funcionario cuando recibe un caso nuevo o reasignado.',
  },
  {
    id: 'antecedentes',
    titulo: 'Antecedentes recibidos',
    detalle: 'Avisa a la supervisión cuando un consumidor responde lo pedido.',
  },
  {
    id: 'consumidor',
    titulo: 'Cambios para el consumidor',
    detalle: 'Avisa por correo al consumidor cuando su caso cambia de estado.',
  },
]

function Ajuste({
  titulo,
  valor,
  unidad,
  min,
  max,
  onChange,
}: {
  titulo: string
  valor: number
  unidad: string
  min: number
  max: number
  onChange: (valor: number) => void
}) {
  return (
    <div className="glass-tile flex items-center justify-between gap-3 px-4 py-3">
      <span>
        <span className="block font-medium">{titulo}</span>
        <span className="text-caption text-ink-muted">{unidad}</span>
      </span>
      <span className="flex items-center gap-2">
        <IconButton
          icon={Minus}
          label={`${titulo}: un día menos`}
          size="sm"
          disabled={valor <= min}
          onClick={() => onChange(Math.max(min, valor - 1))}
        />
        <span
          aria-live="polite"
          aria-label={`${titulo}: ${valor} días`}
          className="w-10 text-center text-metric"
        >
          {valor}
        </span>
        <IconButton
          icon={Plus}
          label={`${titulo}: un día más`}
          size="sm"
          disabled={valor >= max}
          onClick={() => onChange(Math.min(max, valor + 1))}
        />
      </span>
    </div>
  )
}

function ListaCatalogo({
  catalogo,
  items,
  onChange,
}: {
  catalogo: Catalogo
  items: string[]
  onChange: (items: string[]) => void
}) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const inputId = `nuevo-${catalogo}`

  function agregar(event: FormEvent) {
    event.preventDefault()
    const valor = texto.trim()
    if (!valor) return setError('Escriba un nombre.')
    if (
      items.some(
        (item) =>
          item.toLocaleLowerCase('es-CL') === valor.toLocaleLowerCase('es-CL'),
      )
    )
      return setError(`"${valor}" ya está en la lista.`)
    onChange([...items, valor])
    setTexto('')
    setError('')
  }

  return (
    <section
      aria-labelledby={`${catalogo}-titulo`}
      className="glass-tile flex min-h-0 flex-col gap-2 p-3"
    >
      <h3
        id={`${catalogo}-titulo`}
        className="flex items-baseline justify-between px-1 font-medium"
      >
        {NOMBRES[catalogo].label}
        <span className="text-caption text-ink-muted">{items.length}</span>
      </h3>
      <ul className="flex min-h-24 flex-1 flex-col overflow-y-auto">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 hover:bg-glass-strong"
          >
            <span className="truncate">{item}</span>
            <button
              type="button"
              aria-label={`Quitar ${item}`}
              onClick={() => onChange(items.filter((i) => i !== item))}
              className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-ink-muted hover:bg-glass-shade hover:text-ink"
            >
              <X size={13} strokeWidth={2} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={agregar} noValidate className="flex flex-col gap-1">
        <div className="flex gap-2">
          <label className="sr-only" htmlFor={inputId}>
            {NOMBRES[catalogo].nuevo}
          </label>
          <input
            id={inputId}
            value={texto}
            onChange={(event) => {
              setTexto(event.target.value)
              setError('')
            }}
            placeholder={NOMBRES[catalogo].nuevo}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'h-10 min-w-0 flex-1 rounded-full border border-glass-rim bg-white px-4 text-body outline-none placeholder:text-ink-muted focus:shadow-focus-ring',
              error && 'ring-1 ring-danger/50',
            )}
          />
          <IconButton
            icon={Plus}
            label={`Agregar a ${NOMBRES[catalogo].label}`}
            type="submit"
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="px-1 text-caption text-danger">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}

/** Reglas de plazos, avisos y catálogos del formulario de reclamo. */
export function ConfiguracionPage() {
  const [plazo, setPlazo] = useState(PLAZO_DIAS)
  const [aviso, setAviso] = useState(3)
  const [avisos, setAvisos] = useState<Record<string, boolean>>({
    vencido: true,
    asignado: true,
    antecedentes: true,
    consumidor: false,
  })
  const [catalogos, setCatalogos] = useState(CATALOGOS)
  const [guardado, setGuardado] = useState(false)

  const margen = plazo - aviso
  const limite = sumarDias(hoy(), plazo)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Configuración"
        subtitle="Reglas de plazos, avisos y opciones del formulario · solo la supervisión puede cambiarlas"
        action={
          <Button variant="ink" onClick={() => setGuardado(true)}>
            Guardar cambios
          </Button>
        }
      />
      <p role="status" aria-live="polite" className="sr-only">
        {guardado ? 'Cambios guardados en la demo.' : ''}
      </p>
      {guardado && (
        <div className="glass-strong flex items-center gap-2.5 self-start rounded-full px-4 py-2 text-caption font-medium text-success">
          <CircleCheck size={16} aria-hidden /> Cambios guardados en la demo. Se
          pierden al recargar hasta que exista el backend.
        </div>
      )}

      <div className="grid flex-1 gap-6 *:min-w-0 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-[auto_minmax(0,1fr)] compact:gap-5">
        <Glass
          title="Plazos"
          subtitle="Aplican a los reclamos que ingresen desde ahora · no son plazos legales"
          className="flex flex-col gap-4 lg:col-span-2 compact:p-4 [&>header]:mb-0"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Ajuste
              titulo="Plazo de gestión"
              unidad="días corridos desde el ingreso"
              valor={plazo}
              min={Math.max(5, aviso + 1)}
              max={30}
              onChange={(valor) => {
                setPlazo(valor)
                setGuardado(false)
              }}
            />
            <Ajuste
              titulo="Aviso de por vencer"
              unidad="días antes del límite · KPI 4"
              valor={aviso}
              min={1}
              max={Math.min(7, plazo - 1)}
              onChange={(valor) => {
                setAviso(valor)
                setGuardado(false)
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div
              role="img"
              aria-label={`${margen} días con margen, ${aviso} días por vencer y luego vencido`}
              className="flex h-9 gap-1"
            >
              {Array.from({ length: plazo }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    'flex-1 rounded-[6px]',
                    index < margen
                      ? 'bg-linear-to-b from-brand-glow to-brand'
                      : 'bg-[color-mix(in_srgb,var(--color-warning)_70%,white)]',
                  )}
                />
              ))}
              <span className="w-9 rounded-[6px] bg-danger" />
            </div>
            <div className="flex justify-between gap-4 text-caption">
              <span>
                <span className="block font-medium">Ingresa hoy</span>
                <span className="text-ink-muted">{fechaLarga(hoy())}</span>
              </span>
              <span className="text-center">
                <span className="block font-medium text-warning">
                  Por vencer
                </span>
                <span className="text-ink-muted">
                  desde el {fechaCorta(sumarDias(hoy(), margen))}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-medium">Fecha límite</span>
                <span className="text-ink-muted">
                  {fechaLarga(limite)} · luego vencido
                </span>
              </span>
            </div>
          </div>
        </Glass>

        <Glass
          title="Avisos"
          subtitle="Qué notificaciones envía el sistema"
          className="flex flex-col lg:row-span-2 tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <ul className="flex flex-1 flex-col gap-3 tall:min-h-0 tall:overflow-y-auto">
            {AVISOS.map((item) => (
              <li
                key={item.id}
                className="glass-tile flex flex-1 items-center justify-between gap-4 px-4 py-3.5"
              >
                <span id={`aviso-${item.id}`}>
                  <span className="block font-medium">{item.titulo}</span>
                  <span className="text-caption text-ink-muted">
                    {item.detalle}
                  </span>
                </span>
                <Switch
                  checked={avisos[item.id]}
                  labelledBy={`aviso-${item.id}`}
                  onChange={(valor) => {
                    setAvisos((prev) => ({ ...prev, [item.id]: valor }))
                    setGuardado(false)
                  }}
                />
              </li>
            ))}
          </ul>
        </Glass>

        <Glass
          title="Catálogos"
          subtitle="Las opciones que aparecen en el formulario de reclamo"
          className="flex flex-col lg:col-span-2 tall:min-h-0 compact:p-4 [&>header]:mb-3"
        >
          <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-3">
            {(Object.keys(NOMBRES) as Catalogo[]).map((catalogo) => (
              <ListaCatalogo
                key={catalogo}
                catalogo={catalogo}
                items={catalogos[catalogo]}
                onChange={(items) => {
                  setCatalogos((prev) => ({ ...prev, [catalogo]: items }))
                  setGuardado(false)
                }}
              />
            ))}
          </div>
        </Glass>
      </div>
    </div>
  )
}
