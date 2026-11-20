import type { ReactNode } from 'react'
import { ChevronDown, Layers3 } from 'lucide-react'
import { Link } from 'react-router'
import { Glass } from '@/components/ui/Glass'
import { cn } from '@/lib/cn'

export function AuthLayout({
  children,
  informacion,
}: {
  children: ReactNode
  informacion?: ReactNode
}) {
  const mostrarInformacion = Boolean(informacion)
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-4 sm:px-6 lg:px-10 [@media(max-height:600px)]:gap-3 [@media(max-height:600px)]:py-3 [@media(min-height:650px)]:gap-6 [@media(min-height:650px)]:py-6">
      {!mostrarInformacion && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-1/2 -z-10 h-[clamp(6rem,24vh,14rem)] w-[min(92vw,68rem)] -translate-x-1/2 bg-brand/12 [mask-image:url('/images/coquimbo-monocromo.png')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
        />
      )}
      <header
        className={cn(
          'flex w-full justify-center',
          mostrarInformacion ? 'max-w-5xl md:justify-start' : 'max-w-md',
        )}
      >
        <Link to="/login" className="flex w-fit items-center gap-3 rounded-md">
          <span className="glass-strong grid size-9 place-items-center rounded-full text-brand">
            <Layers3 size={20} strokeWidth={1.5} aria-hidden />
          </span>
          <span className="text-title font-medium">Gestión de Reclamos</span>
        </Link>
      </header>
      <div
        className={cn(
          'w-full',
          mostrarInformacion
            ? 'grid max-w-md items-center gap-4 md:max-w-5xl md:grid-cols-[0.95fr_1.05fr] md:gap-6 lg:gap-10'
            : 'max-w-md',
        )}
      >
        <Glass
          className={cn(
            'w-full p-5 sm:[@media(min-height:650px)]:p-8 [@media(max-height:600px)]:p-4',
            mostrarInformacion && 'md:col-start-2 md:row-start-1 tall:p-10',
          )}
        >
          {children}
        </Glass>
        {mostrarInformacion && (
          <>
            <div className="hidden min-w-0 flex-col gap-6 md:col-start-1 md:row-start-1 md:flex">
              <div
                aria-hidden
                className="pointer-events-none relative flex h-[clamp(8rem,23dvh,13rem)] items-center justify-center"
              >
                <div className="absolute h-full aspect-square rounded-full border border-glass-rim bg-glass-shell shadow-panel" />
                <div className="absolute inset-x-0 bottom-3 h-[85%] bg-brand/65 [mask-image:url('/images/coquimbo-monocromo.png')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]" />
              </div>
              <Glass padding="none" className="p-6 lg:p-7">
                {informacion}
              </Glass>
            </div>
            <details className="glass-panel group rounded-lg px-5 py-3 md:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-label [&::-webkit-details-marker]:hidden">
                Sobre SERNAC
                <ChevronDown
                  size={17}
                  aria-hidden
                  className="transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="pt-4 pb-2 [&_h2]:hidden">{informacion}</div>
            </details>
          </>
        )}
      </div>
      <p className="max-w-5xl text-center text-caption text-ink-muted">
        Proyecto académico UCN · Datos ficticios · Sin vinculación institucional
        con SERNAC
      </p>
    </main>
  )
}
