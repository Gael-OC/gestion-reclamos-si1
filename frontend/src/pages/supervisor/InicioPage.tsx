import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, ArrowUpRight, Inbox, TriangleAlert } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Avatar } from '@/components/ui/Avatar'
import { RingStat } from '@/components/ui/RingStat'
import { PageHeading } from '@/components/layout/PageHeading'
import { LiquidOrbs } from '@/features/dashboard/LiquidOrbs'
import {
  alertasPlazo,
  cierresPeriodo,
  cumplimientoPlazos,
  tiempoResolucion,
} from '@/features/dashboard/mockData'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { PlazosEnRiesgo } from '@/features/supervision/PlazosEnRiesgo'
import { DESTINOS_ETAPAS } from '@/features/supervision/destinos'
import { EQUIPO, SIN_ASIGNAR } from '@/features/supervision/escenario'
import { useBandeja } from '@/features/supervision/useBandeja'
import { cn } from '@/lib/cn'
import { enDias } from '@/lib/format'
import { fechaLarga, hoy, mesActual, saludo } from '@/lib/fechas'

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .map((parte) => parte[0])
    .join('')

/** «Diego Muñoz» → «Diego M.», para rótulos cortos que se lean completos. */
const nombreCorto = (nombre: string) => {
  const [nombrePila, apellido] = nombre.split(' ')
  return apellido ? `${nombrePila} ${apellido[0]}.` : nombrePila
}

function Tarea({
  to,
  icono,
  titulo,
  cifra,
  detalle,
  children,
}: {
  to: string
  icono: ReactNode
  titulo: string
  cifra: string
  detalle: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className="glass-tile group flex min-h-0 flex-col gap-3 p-4 hover:bg-glass-strong"
    >
      <span className="flex items-center gap-3">
        {icono}
        <span className="min-w-0 flex-1 font-medium">{titulo}</span>
        <ArrowRight
          size={16}
          strokeWidth={1.8}
          aria-hidden
          className="shrink-0 text-ink-muted transition-transform duration-300 ease-spring group-hover:translate-x-0.5 group-hover:text-ink"
        />
      </span>
      <span
        aria-hidden
        className="flex min-h-14 flex-1 items-center justify-center pt-3"
      >
        {children}
      </span>
      <span className="flex min-w-0 items-baseline gap-2.5">
        <span className="text-metric">{cifra}</span>
        <span className="min-w-0 text-caption text-ink-muted">{detalle}</span>
      </span>
    </Link>
  )
}

/** Inicio del supervisor: KPI en formas y lo que necesita su decisión hoy. */
export function InicioPage() {
  const navigate = useNavigate()
  const { activos } = useReclamosDemo()
  const { nuevos, antecedentes, equipo } = useBandeja()
  const [etapa1, etapa2, etapa3] = activos.etapas
  const porCarga = [...equipo].sort((a, b) => b.activos - a.activos)
  const masCarga = porCarga[0]
  const porVencidos = [
    ...EQUIPO.map((persona) => ({
      id: persona.id,
      nombre: nombreCorto(persona.nombre),
      n: persona.vencidos,
    })),
    { id: 'sin-asignar', nombre: 'Sin asignar', n: SIN_ASIGNAR.vencidos },
  ].sort((a, b) => b.n - a.n)
  const masVencidos = porVencidos.slice(0, 3)
  const restoVencidos = porVencidos
    .slice(3)
    .reduce((total, fila) => total + fila.n, 0)
  const porRevisar = nuevos + antecedentes

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title={`${saludo()}, Andrea`}
        subtitle={`Corte al ${fechaLarga(hoy())} · ${mesActual()} en curso`}
        action={
          <Link
            to="/supervisor/bandeja"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-label text-on-ink shadow-ink hover:bg-ink-soft"
          >
            Revisar bandeja <ArrowRight size={16} aria-hidden />
          </Link>
        }
      />
      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-2 compact:gap-5">
        <Glass className="grid min-h-[230px] gap-4 md:col-span-2 md:grid-cols-[minmax(11rem,0.7fr)_1.6fr] tall:min-h-0 compact:p-4">
          <div className="flex flex-col justify-between gap-3">
            <div>
              <h2 className="text-title">Reclamos pendientes</h2>
              <p className="text-caption text-ink-muted">
                KPI 2 · activos al corte · toque una burbuja para ver sus casos
              </p>
              <p className="mt-2">
                <span className="text-hero-number">{activos.total}</span>
                <span className="ml-2 text-caption text-ink-muted">
                  activos
                </span>
              </p>
            </div>
            <Link
              to="/reclamos"
              className="pill pill-neutral self-start hover:bg-glass-strong"
            >
              Ver reclamos <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="relative min-h-[130px]">
            <LiquidOrbs
              items={[etapa1, etapa2, etapa3]}
              onSelect={(index) => navigate(DESTINOS_ETAPAS[index])}
              className="absolute inset-0"
            />
          </div>
        </Glass>

        <Glass
          title="Cumplimiento de plazos"
          subtitle={`KPI 3 · cierres de ${mesActual()}`}
          className="flex min-h-[260px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <Link
            to="/supervisor/indicadores"
            aria-label="Ver indicadores"
            className="grid flex-1 place-items-center"
          >
            <RingStat
              value={cumplimientoPlazos.value}
              label={`${cumplimientoPlazos.value} % de los cierres dentro del plazo`}
              size={9.5}
            >
              <span className="text-metric">{cumplimientoPlazos.value}</span>
              <span className="text-caption text-ink-muted"> %</span>
              <span className="block text-caption text-ink-muted">
                {cierresPeriodo.enPlazo} de {cierresPeriodo.total}
              </span>
            </RingStat>
          </Link>
          <Link
            to="/supervisor/indicadores"
            className="glass-tile mt-3 flex items-center justify-between gap-2 px-3.5 py-2.5 text-caption"
          >
            <span className="text-ink-muted">KPI 1 · Resolución promedio</span>
            <span className="font-medium whitespace-nowrap">
              {enDias(tiempoResolucion.value)}{' '}
              <ArrowUpRight className="inline" size={14} aria-hidden />
            </span>
          </Link>
        </Glass>

        <Glass
          title="Plazos en riesgo"
          subtitle="KPI 6 y KPI 4 · al corte"
          className="flex min-h-[260px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <PlazosEnRiesgo className="flex-1" />
        </Glass>

        <Glass
          title="Para hoy"
          subtitle="En orden de prioridad"
          className="flex min-h-[260px] flex-col md:col-span-2 tall:min-h-0 compact:p-4 [&>header]:mb-3"
        >
          <div className="grid flex-1 gap-4 sm:grid-cols-3 tall:min-h-0">
            <Tarea
              to="/supervisor/bandeja"
              icono={
                <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-linear-to-b from-brand-glow from-[-40%] to-brand to-70% text-on-ink">
                  <Inbox size={18} strokeWidth={1.6} aria-hidden />
                </span>
              }
              titulo="Revisar ingresos"
              cifra={String(porRevisar)}
              detalle="esperan su decisión"
            >
              <span className="flex w-full flex-col gap-2.5 text-caption">
                {[
                  { label: 'Nuevos', value: nuevos },
                  { label: 'Antecedentes recibidos', value: antecedentes },
                ].map((fila) => (
                  <span key={fila.label} className="flex flex-col gap-1">
                    <span className="flex justify-between">
                      <span className="text-ink-muted">{fila.label}</span>
                      <span className="font-medium">{fila.value}</span>
                    </span>
                    <span className="h-2.5 rounded-full bg-glass-shade">
                      <span
                        className="block h-full rounded-full bg-linear-to-r from-brand-glow to-brand"
                        style={{
                          width: `${Math.max(4, (fila.value / Math.max(1, nuevos, antecedentes)) * 100)}%`,
                        }}
                      />
                    </span>
                  </span>
                ))}
              </span>
            </Tarea>

            <Tarea
              to="/reclamos?atencion=vencidos"
              icono={
                <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-glass-strong text-danger shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-danger)_10%,transparent)]">
                  <TriangleAlert size={18} strokeWidth={1.6} aria-hidden />
                </span>
              }
              titulo="Seguir vencidos"
              cifra={String(alertasPlazo.vencidos)}
              detalle="casos vencidos"
            >
              <span className="flex w-full flex-col gap-2 text-caption">
                {masVencidos.map((fila) => (
                  <span
                    key={fila.id}
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-2"
                  >
                    <span className="truncate text-ink-muted">
                      {fila.nombre}
                    </span>
                    <span className="flex flex-wrap gap-[3px]">
                      {Array.from({ length: fila.n }, (_, index) => (
                        <span
                          key={index}
                          className="size-2.5 rounded-full bg-radial-[at_35%_30%] from-[color-mix(in_srgb,var(--color-danger)_45%,white)] to-danger"
                        />
                      ))}
                    </span>
                    <span className="font-medium tabular-nums">{fila.n}</span>
                  </span>
                ))}
                {restoVencidos > 0 && (
                  <span className="text-ink-muted">
                    y {restoVencidos} más en el resto del equipo
                  </span>
                )}
              </span>
            </Tarea>

            <Tarea
              to="/supervisor/equipo"
              icono={<Avatar name={masCarga.nombre} size={40} />}
              titulo="Equilibrar carga"
              cifra={String(masCarga.activos)}
              detalle={`casos de ${masCarga.nombre}`}
            >
              <span className="flex h-full max-h-28 w-full items-end gap-2">
                {porCarga.map((persona, index) => (
                  <span
                    key={persona.id}
                    title={`${persona.nombre} · ${persona.activos} casos`}
                    className="group/barra relative flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <span className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full rounded-[10px] bg-ink px-2.5 py-1 text-caption whitespace-nowrap text-on-ink shadow-ink group-hover/barra:block">
                      {persona.nombre} · {persona.activos}
                    </span>
                    <span
                      className={cn(
                        'w-full max-w-8 rounded-[10px]',
                        index === 0
                          ? 'bg-linear-to-b from-brand-glow to-brand'
                          : 'bg-glass-strong shadow-[inset_0_0_0_1px_var(--color-sky-acero)]',
                      )}
                      style={{
                        height: `${(persona.activos / masCarga.activos) * 100}%`,
                      }}
                    />
                    <span
                      className={cn(
                        'text-caption font-medium',
                        index === 0 ? 'text-ink' : 'text-ink-muted',
                      )}
                    >
                      {iniciales(persona.nombre)}
                    </span>
                  </span>
                ))}
              </span>
            </Tarea>
          </div>
        </Glass>
      </div>
    </div>
  )
}
