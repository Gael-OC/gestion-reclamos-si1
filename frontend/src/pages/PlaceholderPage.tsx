import { Glass } from '@/components/ui/Glass'
import { cn } from '@/lib/cn'

type PlaceholderPageProps = {
  title: string
  /** true fuera del layout interno (por ejemplo, el login). */
  fullScreen?: boolean
}

export function PlaceholderPage({
  title,
  fullScreen = false,
}: PlaceholderPageProps) {
  return (
    <div
      className={cn(
        'grid flex-1 place-items-center',
        fullScreen && 'min-h-dvh px-6 py-12',
      )}
    >
      <Glass float enter={2} className="w-full max-w-xl">
        <h1 className="text-display">{title}</h1>
        <p className="mt-2 text-ink-muted">Vista pendiente de diseño.</p>
        {fullScreen && (
          <p className="mt-6 text-caption text-ink-muted">
            Prototipo académico ficticio — UCN 2026. Sin relación institucional
            con SERNAC.
          </p>
        )}
      </Glass>
    </div>
  )
}
