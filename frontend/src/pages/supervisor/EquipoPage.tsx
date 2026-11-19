import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Orb } from '@/components/ui/Orb'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { PageHeading } from '@/components/layout/PageHeading'
import { GlassBars } from '@/features/dashboard/GlassBars'
import { AsignarDialog } from '@/features/supervision/AsignarDialog'
import {
  EQUIPO,
  SIN_ASIGNAR,
  type Funcionario,
} from '@/features/supervision/escenario'

type Orden = 'carga' | 'vencidos'
type Reasignacion = { desde: Funcionario; cantidad: number }

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .map((parte) => parte[0])
    .join('')

/** Equipo y carga (KPI 5), con los vencidos por responsable (KPI 6). */
export function EquipoPage() {
  const [equipo, setEquipo] = useState(EQUIPO)
  const [orden, setOrden] = useState<Orden>('carga')
  const [reasignar, setReasignar] = useState<Reasignacion | null>(null)
  const [aviso, setAviso] = useState('')

  const total = equipo.reduce((suma, persona) => suma + persona.activos, 0)
  const promedio = total / equipo.length
  const max = Math.max(...equipo.map((persona) => persona.activos))
  const filas = [...equipo].sort((a, b) =>
    orden === 'carga' ? b.activos - a.activos : b.vencidos - a.vencidos,
  )
  const porCarga = [...equipo].sort((a, b) => b.activos - a.activos)
  const mas = porCarga[0]
  // Mismo orden que el diálogo: primero quien tiene menos casos.
  const menos = [...equipo].sort((a, b) => a.activos - b.activos)[0]
  const mover = Math.floor((mas.activos - menos.activos) / 2)

  function confirmar(destino: Funcionario, cantidad: number) {
    if (!reasignar) return
    setEquipo((prev) =>
      prev.map((persona) =>
        persona.id === reasignar.desde.id
          ? { ...persona, activos: persona.activos - cantidad }
          : persona.id === destino.id
            ? { ...persona, activos: persona.activos + cantidad }
            : persona,
      ),
    )
    setAviso(
      `Se movieron ${cantidad} casos de ${reasignar.desde.nombre} a ${destino.nombre}. Ambos reciben un aviso.`,
    )
    setReasignar(null)
  }

  const vencidosBarras = [
    ...[...equipo]
      .sort((a, b) => b.vencidos - a.vencidos)
      .map((persona) => ({
        label: iniciales(persona.nombre),
        value: persona.vencidos,
      })),
    { label: 'Sin asignar', value: SIN_ASIGNAR.vencidos },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Equipo"
        subtitle={`${equipo.length} funcionarios · ${total} casos asignados`}
        action={
          <SegmentedControl
            label="Ordenar"
            value={orden}
            onChange={setOrden}
            options={[
              { value: 'carga', label: 'Más carga' },
              { value: 'vencidos', label: 'Más vencidos' },
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

      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-[minmax(0,1.2fr)_minmax(0,1fr)] compact:gap-4">
        <Glass
          title="Carga por funcionario"
          subtitle={`KPI 5 · casos activos al corte · la línea es el promedio (${promedio.toLocaleString('es-CL', { maximumFractionDigits: 1 })})`}
          action={
            <div className="hidden gap-1.5 xl:flex">
              <span className="pill pill-brand">
                <i className="size-2 rounded-full bg-brand" /> Con margen
              </span>
              <span className="pill pill-warning">
                <i className="size-2 rounded-full bg-warning" /> Por vencer
              </span>
              <span className="pill pill-danger">
                <i className="size-2 rounded-full bg-danger" /> Vencido
              </span>
            </div>
          }
          className="flex flex-col md:col-span-2 tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <ul className="flex min-h-0 flex-1 flex-col justify-around overflow-y-auto">
            {filas.map((persona) => {
              const margen =
                persona.activos - persona.porVencer - persona.vencidos
              const ancho = (n: number) => `${(n / max) * 100}%`
              return (
                <li
                  key={persona.id}
                  className="grid grid-cols-[2.25rem_8.5rem_minmax(0,1fr)_2.25rem_auto] items-center gap-3.5 rounded-md px-1.5 py-1.5 hover:bg-glass-tile compact:py-0.5"
                >
                  <Avatar name={persona.nombre} size={34} />
                  <span className="truncate font-medium">{persona.nombre}</span>
                  <span
                    role="img"
                    aria-label={`${margen} con margen, ${persona.porVencer} por vencer, ${persona.vencidos} vencidos`}
                    className="relative flex h-3.5 gap-0.5 rounded-full bg-glass-shade/60"
                  >
                    <span
                      className="h-full rounded-full bg-linear-to-r from-brand-glow to-brand"
                      style={{ width: ancho(margen) }}
                    />
                    <span
                      className="h-full rounded-full bg-[color-mix(in_srgb,var(--color-warning)_70%,white)]"
                      style={{ width: ancho(persona.porVencer) }}
                    />
                    <span
                      className="h-full rounded-full bg-danger"
                      style={{ width: ancho(persona.vencidos) }}
                    />
                    <span
                      aria-hidden
                      className="absolute -inset-y-1.5 border-l-[1.5px] border-dashed border-ink-muted"
                      style={{ left: ancho(promedio) }}
                    />
                  </span>
                  <strong className="text-right font-medium">
                    {persona.activos}
                  </strong>
                  <Button
                    size="sm"
                    onClick={() =>
                      setReasignar({
                        desde: persona,
                        cantidad: Math.max(
                          1,
                          Math.round(persona.activos - promedio),
                        ),
                      })
                    }
                  >
                    Reasignar
                  </Button>
                </li>
              )
            })}
          </ul>
        </Glass>

        <Glass className="flex flex-col items-center justify-center gap-3 text-center tall:min-h-0 compact:p-4">
          <Orb tone="vacio" size={8.5}>
            <span className="text-hero-number">{SIN_ASIGNAR.total}</span>
          </Orb>
          <div>
            <h2 className="text-title">Sin responsable</h2>
            <p className="text-caption text-ink-muted">
              {SIN_ASIGNAR.ingresados} ingresados · {SIN_ASIGNAR.pendientes}{' '}
              esperan antecedentes · se cuentan aparte del KPI 5
            </p>
          </div>
          <Link
            to="/supervisor/bandeja"
            className="glass-tile inline-flex h-10 items-center rounded-full px-4 text-caption font-medium hover:bg-glass-strong"
          >
            Ir a la bandeja
          </Link>
        </Glass>

        <Glass
          title="Vencidos por responsable"
          subtitle="KPI 6 · plazo superado"
          className="flex flex-col tall:min-h-0 compact:p-4 [&>header]:mb-0"
        >
          <GlassBars
            data={vencidosBarras}
            initialActive={0}
            tone="danger"
            className="min-h-40 flex-1"
          />
        </Glass>

        <Glass
          title="Sugerencia para equilibrar"
          subtitle="Se mueve la mitad de la diferencia entre quien tiene más y menos casos; la línea punteada es el promedio del equipo"
          className="flex flex-col gap-4 md:col-span-2 tall:min-h-0 compact:gap-2 compact:p-4 [&>header]:mb-0"
        >
          <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-stretch gap-4">
            {[
              { persona: mas, despues: mas.activos - mover },
              null,
              { persona: menos, despues: menos.activos + mover },
            ].map((lado, index) =>
              lado ? (
                <div
                  key={lado.persona.id}
                  className="glass-tile flex flex-col justify-center gap-2.5 px-5 py-3 compact:gap-1.5 compact:py-2"
                >
                  <span className="flex items-center gap-3">
                    <Avatar name={lado.persona.nombre} size={36} />
                    <span className="font-medium">{lado.persona.nombre}</span>
                  </span>
                  <span className="flex items-baseline gap-2">
                    <s className="text-title text-ink-muted">
                      {lado.persona.activos}
                    </s>
                    <ArrowRight
                      size={16}
                      className="text-ink-muted"
                      aria-hidden
                    />
                    <span className="text-metric">{lado.despues}</span>
                    <span className="text-caption text-ink-muted">casos</span>
                  </span>
                  <span className="relative h-2.5 rounded-full bg-glass-shade">
                    <span
                      className="block h-full rounded-full bg-linear-to-r from-brand-glow to-brand"
                      style={{ width: `${(lado.despues / max) * 100}%` }}
                    />
                    <span
                      aria-hidden
                      title="Promedio del equipo"
                      className="absolute -inset-y-1.5 border-l-[1.5px] border-dashed border-ink-muted"
                      style={{ left: `${(promedio / max) * 100}%` }}
                    />
                  </span>
                </div>
              ) : (
                <div
                  key={`flecha-${index}`}
                  className="flex flex-col items-center justify-center gap-2 text-center"
                >
                  <span className="rounded-full bg-ink px-3.5 py-1.5 text-label text-on-ink shadow-ink">
                    {mover} casos
                  </span>
                  <ArrowRight
                    size={22}
                    className="text-ink-muted"
                    aria-hidden
                  />
                  <span className="font-mono text-caption text-ink-muted compact:hidden">
                    ({mas.activos} − {menos.activos}) ÷ 2
                  </span>
                  <Button
                    size="sm"
                    className="mt-1"
                    disabled={mover < 1}
                    onClick={() =>
                      setReasignar({ desde: mas, cantidad: mover })
                    }
                  >
                    Revisar y mover
                  </Button>
                </div>
              ),
            )}
          </div>
        </Glass>
      </div>

      {reasignar && (
        <AsignarDialog
          open
          onClose={() => setReasignar(null)}
          title={`Reasignar casos de ${reasignar.desde.nombre}`}
          description="Se mueven primero los que tienen más margen"
          desdeId={reasignar.desde.id}
          cantidad={{
            max: reasignar.desde.activos,
            inicial: reasignar.cantidad,
          }}
          equipo={equipo}
          onConfirm={confirmar}
        />
      )}
    </div>
  )
}
