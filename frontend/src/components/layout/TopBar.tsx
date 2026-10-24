import { Plus } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { SearchField } from '@/components/ui/SearchField'

const today = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
  .format(new Date())
  .replaceAll('/', '-')

/** Barra superior en píldora: marca, buscador, fecha y la acción principal. */
export function TopBar() {
  return (
    <Glass
      role="banner"
      float
      enter={1}
      floatDelay={-1}
      padding="none"
      className="flex shrink-0 items-center gap-3 rounded-full py-2 pr-2 pl-5 sm:gap-4 sm:pl-7"
    >
      <span className="text-title font-semibold whitespace-nowrap">
        Gestión de Reclamos
      </span>
      <span className="hidden text-caption whitespace-nowrap text-ink-muted xl:inline">
        Coquimbo · escenario académico
      </span>
      <div className="flex-1" />
      <SearchField
        label="Buscar reclamos"
        placeholder="Buscar reclamo"
        className="hidden w-56 md:flex xl:w-72"
      />
      <span className="pill pill-neutral hidden h-11 px-4 font-mono text-id sm:inline-flex">
        {today}
      </span>
      <Button variant="ink" icon={Plus} aria-label="Nuevo reclamo">
        <span className="hidden sm:inline">Nuevo reclamo</span>
      </Button>
    </Glass>
  )
}
