import { ArrowLeft, Plus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'

const today = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
  .format(new Date())
  .replaceAll('/', '-')

export function TopBar() {
  const navigate = useNavigate()
  const nuevoReclamo = useLocation().pathname === '/reclamos/nuevo'
  return (
    <Glass
      role="banner"
      padding="none"
      className="flex shrink-0 items-center gap-3 rounded-full py-2 pr-2 pl-5 sm:gap-4 sm:pl-7"
    >
      <span className="text-title font-semibold whitespace-nowrap">
        Gestión de Reclamos
      </span>
      <div className="flex-1" />
      <span className="pill pill-neutral hidden h-11 px-4 font-mono text-id sm:inline-flex">
        {today}
      </span>
      <Button
        variant={nuevoReclamo ? 'glass' : 'ink'}
        icon={nuevoReclamo ? ArrowLeft : Plus}
        aria-label={nuevoReclamo ? 'Volver al listado' : 'Nuevo reclamo'}
        onClick={() => navigate(nuevoReclamo ? '/reclamos' : '/reclamos/nuevo')}
      >
        <span className="hidden sm:inline">
          {nuevoReclamo ? 'Volver al listado' : 'Nuevo reclamo'}
        </span>
      </Button>
    </Glass>
  )
}
