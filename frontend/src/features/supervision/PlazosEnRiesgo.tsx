import { Link } from 'react-router'
import { Orb } from '@/components/ui/Orb'
import { alertasPlazo } from '@/features/dashboard/mockData'
import { cn } from '@/lib/cn'

type PlazosEnRiesgoProps = {
  /** Diámetro de cada burbuja en rem. */
  size?: number
  className?: string
}

/**
 * KPI 6 y KPI 4 como dos burbujas; cada una abre el listado filtrado por su
 * propia alerta (vencidos o por vencer).
 */
export function PlazosEnRiesgo({ size = 7.5, className }: PlazosEnRiesgoProps) {
  const burbujas = [
    {
      to: '/reclamos?atencion=vencidos',
      tone: 'danger' as const,
      value: alertasPlazo.vencidos,
      label: 'vencidos',
      color: 'text-danger',
    },
    {
      to: '/reclamos?atencion=por_vencer',
      tone: 'warning' as const,
      value: alertasPlazo.proximos,
      label: 'vencen en 0–3 días',
      color: 'text-warning',
    },
  ]
  return (
    <div className={cn('flex items-center justify-center gap-6', className)}>
      {burbujas.map((burbuja) => (
        <Link
          key={burbuja.to}
          to={burbuja.to}
          aria-label={`Ver ${burbuja.value} ${burbuja.label}`}
          className="group flex flex-col items-center gap-2 rounded-lg p-1"
        >
          <Orb
            tone={burbuja.tone}
            size={size}
            className="transition-transform duration-300 ease-spring group-hover:-translate-y-1"
          >
            <span className="text-metric font-light">{burbuja.value}</span>
          </Orb>
          <span
            className={cn(
              'text-caption font-medium underline-offset-4 group-hover:underline',
              burbuja.color,
            )}
          >
            {burbuja.label}
          </span>
        </Link>
      ))}
    </div>
  )
}
