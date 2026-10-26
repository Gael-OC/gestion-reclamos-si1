import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Glass } from '@/components/ui/Glass'
import { historialMensual } from '@/features/dashboard/mockData'

const tick = { fill: 'var(--color-ink-muted)', fontSize: 12 }

/** Cierres de cada mes, la base de KPI 1 y KPI 3; el último mes va destacado. */
export function CierresPorMes() {
  const data = historialMensual.map((mes) => ({
    mes: mes.mes,
    valor: mes.cierres,
  }))
  const max = Math.max(...data.map((d) => d.valor))

  return (
    <Glass
      title="Cierres por mes"
      subtitle="KPI 1 y KPI 3"
      className="flex min-h-[230px] flex-col tall:min-h-0 compact:p-4 [&>header]:mb-0"
    >
      <div
        className="min-h-0 flex-1"
        role="img"
        aria-label={`Cierres por mes: ${data.map((d) => `${d.mes} ${d.valor}`).join(', ')}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 8, bottom: 0, left: 8 }}
            barCategoryGap="22%"
          >
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={{ stroke: 'var(--color-glass-shade)' }}
              tick={tick}
              interval={0}
            />
            <YAxis hide domain={[0, max * 1.05]} />
            <Tooltip
              cursor={false}
              isAnimationActive={false}
              labelFormatter={(label) => `${label} 2026`}
              contentStyle={{
                background: 'var(--color-ink)',
                border: 0,
                borderRadius: 12,
                color: 'var(--color-on-ink)',
                fontSize: 13,
              }}
              labelStyle={{ color: 'var(--color-on-ink)' }}
              itemStyle={{ color: 'var(--color-on-ink)' }}
            />
            <Bar
              dataKey="valor"
              name="Cierres"
              maxBarSize={44}
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((d, index) => (
                <Cell
                  key={d.mes}
                  fill={
                    index === data.length - 1
                      ? 'var(--color-brand)'
                      : 'var(--color-data-acero)'
                  }
                  fillOpacity={index === data.length - 1 ? 1 : 0.55}
                />
              ))}
              <LabelList
                dataKey="valor"
                position="top"
                offset={6}
                style={{
                  fill: 'var(--color-ink)',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Glass>
  )
}
