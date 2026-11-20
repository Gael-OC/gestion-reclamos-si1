import { Link } from 'react-router'
import { CircleCheck, TriangleAlert } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { RingStat } from '@/components/ui/RingStat'
import { PageHeading } from '@/components/layout/PageHeading'
import { TrendCard } from '@/features/dashboard/TrendCard'
import { RESULTADOS, type Resultado } from '@/features/funcionario/escenario'
import { useMisCasos } from '@/features/funcionario/useMisCasos'
import { mesActual, mesAnterior, mesesRecientes } from '@/lib/fechas'

const unDecimal = (value: number) =>
  value.toLocaleString('es-CL', { maximumFractionDigits: 1 })

/** Cerrados de la funcionaria y su mes (KPI 1 y 3, solo sus casos). */
export function CerradosPage() {
  const { cerrados, mes } = useMisCasos()
  const enPlazo = Math.round((mes.enPlazo / mes.cierres) * 100)
  const color: Record<Resultado, string> = {
    total: 'bg-brand',
    parcial: 'bg-brand-glow',
    sin_solucion: 'bg-orb-pizarra',
  }
  const resultados = (Object.keys(RESULTADOS) as Resultado[]).map((key) => ({
    key,
    label: RESULTADOS[key],
    n: cerrados.filter((caso) => caso.resultado === key).length,
    color: color[key],
  }))
  const serie = mes.resolucion
  const mejora = serie.at(-2)! - serie.at(-1)!

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Mis cerrados"
        subtitle={`${mesActual()} · solo sus casos, no es un ranking del equipo`}
      />
      <div className="grid flex-1 gap-6 *:min-w-0 md:grid-cols-2 lg:grid-cols-3 tall:min-h-0 tall:grid-rows-[1fr_1.15fr] compact:gap-5">
        <Glass
          title="Cerrados en plazo"
          subtitle={`KPI 3 · ${mesActual()}`}
          className="flex min-h-[240px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-2"
        >
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-4">
            <div className="grid h-full min-h-28 place-items-center [container-type:size]">
              <RingStat
                value={enPlazo}
                label={`${enPlazo} %: ${mes.enPlazo} de ${mes.cierres} cierres en plazo`}
                className="size-[min(100cqw,100cqh)] max-h-52 max-w-52"
              >
                <span className="text-hero-number">{enPlazo}</span>
                <span className="text-caption text-ink-muted"> %</span>
                <span className="block text-caption text-ink-muted">
                  {mes.enPlazo} de {mes.cierres}
                </span>
              </RingStat>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="glass-tile flex flex-col gap-2 px-3 py-2.5">
                <p className="text-caption text-ink-muted">
                  Cómo terminaron ·{' '}
                  <span className="font-medium text-danger">
                    {mes.cierres - mes.enPlazo} fuera de plazo
                  </span>
                </p>
                <div
                  role="img"
                  aria-label={resultados
                    .map((r) => `${r.label}: ${r.n}`)
                    .join(', ')}
                  className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
                >
                  {resultados.map((r) => (
                    <span
                      key={r.key}
                      className={r.color}
                      style={{ width: `${(r.n / cerrados.length) * 100}%` }}
                    />
                  ))}
                </div>
                <ul className="flex flex-col gap-1 text-caption">
                  {resultados.map((r) => (
                    <li key={r.key} className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${r.color}`} />
                      <span className="flex-1 text-ink-muted">{r.label}</span>
                      <span className="font-medium">{r.n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Glass>

        <TrendCard
          className="md:col-span-2"
          title="Mi tiempo de resolución"
          subtitle="KPI 1 · días corridos por mes"
          value={serie.at(-1)!}
          unit="días"
          delta={{
            text: `${unDecimal(mejora)} días menos que ${mesAnterior()}`,
            direction: 'down',
          }}
          points={serie}
          labels={mesesRecientes(serie.length)}
          format={(value) => `${unDecimal(value)} días`}
        />

        <Glass
          title="Cerrados este mes"
          subtitle={`${cerrados.length} casos · los más recientes primero`}
          className="flex flex-col md:col-span-2 lg:col-span-3 tall:min-h-0 compact:p-4 [&>header]:mb-1"
        >
          <ul className="flex flex-col tall:min-h-0 tall:overflow-y-auto">
            {cerrados.map((caso) => (
              <li key={caso.id}>
                <Link
                  to={`/funcionario/casos/${caso.id}`}
                  className="grid grid-cols-[8rem_minmax(0,1fr)_9.5rem_5rem_9rem] items-center gap-4 rounded-md px-3 py-2.5 hover:bg-glass-tile"
                >
                  <span className="text-id font-mono text-ink-muted">
                    {caso.id}
                  </span>
                  <span className="truncate font-medium">{caso.asunto}</span>
                  <span className="pill pill-neutral justify-self-start">
                    {RESULTADOS[caso.resultado]}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {caso.diasGestion} días
                  </span>
                  <span
                    className={
                      caso.enPlazo
                        ? 'pill pill-success justify-self-start'
                        : 'pill pill-danger justify-self-start'
                    }
                  >
                    {caso.enPlazo ? (
                      <CircleCheck size={13} strokeWidth={1.8} aria-hidden />
                    ) : (
                      <TriangleAlert size={13} strokeWidth={1.8} aria-hidden />
                    )}
                    {caso.enPlazo ? 'En plazo' : 'Fuera de plazo'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Glass>
      </div>
    </div>
  )
}
