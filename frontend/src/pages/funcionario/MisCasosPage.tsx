import { Link, useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { RingStat } from '@/components/ui/RingStat'
import { PageHeading } from '@/components/layout/PageHeading'
import { LiquidOrbs } from '@/features/dashboard/LiquidOrbs'
import { PlazoRing } from '@/features/reclamos/PlazoRing'
import { textoPlazo, tonoPlazo } from '@/features/reclamos/plazo'
import { useMisCasos } from '@/features/funcionario/useMisCasos'
import { cn } from '@/lib/cn'
import { fechaLarga, hoy, mesActual } from '@/lib/fechas'

const colorTexto = {
  vencido: 'text-danger font-medium',
  por_vencer: 'text-warning font-medium',
  en_plazo: 'text-ink-muted',
}
const colorEtapa: Record<string, string> = {
  asignado: 'bg-orb-pizarra',
  en_gestion: 'bg-linear-to-r from-brand-glow to-brand',
  esperando_empresa: 'bg-data-teal',
}

/** Mis casos de la funcionaria: por dónde empezar y cómo van sus plazos. */
const DESTINOS_PLAZOS = [
  '/reclamos?alcance=mios&atencion=vencidos',
  '/reclamos?alcance=mios&orden=urgentes',
  '/reclamos?alcance=mios&atencion=por_vencer',
]

export function MisCasosPage() {
  const navigate = useNavigate()
  const misCasos = useMisCasos()
  const { prioridad, mes } = misCasos
  const conMargen = misCasos.activos - misCasos.vencidos - misCasos.porVencer
  const enPlazo = Math.round((mes.enPlazo / mes.cierres) * 100)
  const urgente = prioridad[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title={`Hola, ${misCasos.nombre.split(' ')[0]}`}
        subtitle={`Tiene ${misCasos.activos} casos · corte al ${fechaLarga(hoy())}`}
        action={
          urgente && (
            <Link
              to={`/funcionario/casos/${urgente.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-label text-on-ink shadow-ink hover:bg-ink-soft"
            >
              Abrir el más urgente <ArrowRight size={16} aria-hidden />
            </Link>
          )
        }
      />
      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-[1.35fr_1fr] compact:gap-5">
        <Glass
          title="Empiece por aquí"
          subtitle="Ordenados por plazo, con el paso que sigue"
          action={
            <Link
              to="/reclamos?alcance=mios"
              className="pill pill-neutral hover:bg-glass-strong"
            >
              Ver todos mis casos <ArrowRight size={14} aria-hidden />
            </Link>
          }
          className="flex flex-col md:col-span-2 tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-2rem),transparent)]">
            {prioridad.map((caso) => (
              <li key={caso.id}>
                <Link
                  to={`/funcionario/casos/${caso.id}`}
                  className="grid grid-cols-[1.875rem_7.5rem_minmax(0,1fr)_auto_2.25rem] items-center gap-3.5 rounded-md px-3 py-2 hover:bg-glass-tile"
                >
                  <PlazoRing dias={caso.dias} />
                  <span className="text-id font-mono text-ink-muted">
                    {caso.id}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {caso.asunto}
                    </span>
                    <span
                      className={cn(
                        'text-caption',
                        colorTexto[tonoPlazo(caso.dias)],
                      )}
                    >
                      {caso.estado === 'asignado' ? 'Nuevo · ' : ''}
                      {textoPlazo(caso.dias)}
                    </span>
                  </span>
                  <span className="rounded-full bg-brand-mist px-2.5 py-1 text-caption font-medium whitespace-nowrap text-brand">
                    {caso.paso}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full border border-glass-rim bg-glass-strong">
                    <ArrowRight size={15} strokeWidth={1.8} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Glass>

        <Glass
          title="Mis plazos"
          subtitle="KPI 2, 4 y 6 · toque una burbuja para ver esos casos"
          className="flex min-h-[230px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-1"
        >
          <div className="relative min-h-[120px] flex-1">
            <LiquidOrbs
              items={[
                { label: 'vencidos', value: misCasos.vencidos },
                { label: 'con margen', value: conMargen },
                { label: 'por vencer', value: misCasos.porVencer },
              ]}
              tones={['danger', 'warning']}
              onSelect={(index) => navigate(DESTINOS_PLAZOS[index])}
              className="absolute inset-0"
            />
          </div>
        </Glass>

        <Link
          to="/funcionario/cerrados"
          aria-label={`Mi mes: ${enPlazo} % de cierres en plazo. Ver cerrados`}
          className="glass-panel group flex flex-col gap-3 p-5 hover:shadow-lift tall:min-h-0 compact:p-4"
        >
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-title">Mi mes</span>
              <span className="text-caption text-ink-muted">
                Cierres de {mesActual()} · solo sus casos
              </span>
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-glass-rim bg-glass-strong transition-transform duration-300 ease-spring group-hover:translate-x-0.5">
              <ArrowRight size={15} strokeWidth={1.8} aria-hidden />
            </span>
          </span>
          <span className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-5">
            <RingStat
              value={enPlazo}
              label={`${enPlazo} % en plazo`}
              size={7.5}
            >
              <span className="text-metric">{enPlazo}</span>
              <span className="text-caption text-ink-muted"> %</span>
              <span className="block text-caption text-ink-muted">
                en plazo
              </span>
            </RingStat>
            <span className="flex flex-col gap-2.5">
              <span className="glass-tile px-3.5 py-2.5">
                <span className="block text-title">
                  {mes.enPlazo} de {mes.cierres}
                </span>
                <span className="text-caption text-ink-muted">
                  cierres en plazo · KPI 3
                </span>
              </span>
              <span className="glass-tile px-3.5 py-2.5">
                <span className="block text-title">
                  {mes.resolucion.at(-1)?.toLocaleString('es-CL')} días
                </span>
                <span className="text-caption text-ink-muted">
                  de resolución · KPI 1
                </span>
              </span>
            </span>
          </span>
        </Link>

        <Glass
          title="Mis casos por etapa"
          className="flex flex-col md:col-span-2 tall:min-h-0 compact:p-4 [&>header]:mb-3"
        >
          <div
            className="grid flex-1 gap-3"
            style={{
              gridTemplateColumns: misCasos.etapas
                .map((etapa) => `minmax(9rem, ${etapa.value}fr)`)
                .join(' '),
            }}
          >
            {misCasos.etapas.map((etapa) => (
              <Link
                key={etapa.estado}
                to={`/reclamos?alcance=mios&estado=${etapa.estado}`}
                className="glass-tile flex min-w-0 flex-col gap-2 p-4 hover:bg-glass-strong"
              >
                <span className="text-metric">{etapa.value}</span>
                <span>
                  <span className="block font-medium">{etapa.label}</span>
                  <span className="block truncate text-caption text-ink-muted">
                    {etapa.hint}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'mt-auto h-2 rounded-full',
                    colorEtapa[etapa.estado],
                  )}
                />
              </Link>
            ))}
          </div>
        </Glass>
      </div>
    </div>
  )
}
