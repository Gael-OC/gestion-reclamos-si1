import { FileText, House, UserRound } from 'lucide-react'
import { Link, Outlet } from 'react-router'
import { Glass } from '@/components/ui/Glass'
import { SideRail } from '@/components/layout/SideRail'
import { SessionControl } from '@/features/auth/SessionControl'
import { useAuth } from '@/features/auth/context'
import { fechaLarga, hoy } from '@/lib/fechas'

const nav = [
  { to: '/portal', label: 'Inicio', icon: House, end: true },
  {
    to: '/portal/reclamos',
    label: 'Mis reclamos',
    icon: FileText,
    end: false,
  },
  { to: '/portal/perfil', label: 'Mi cuenta', icon: UserRound, end: false },
]

export function ClienteLayout() {
  const { usuario, cerrarSesion } = useAuth()
  return (
    <div className="flex min-h-dvh gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:px-10 lg:py-8 xl:px-16 compact:gap-5 compact:py-5">
      <SideRail
        items={nav}
        usuario={usuario?.nombre ?? ''}
        onSalir={cerrarSesion}
        mostrarNotificaciones={false}
        fija
      />
      <div className="flex min-w-0 flex-1 flex-col gap-6 compact:gap-5">
        <Glass
          role="banner"
          padding="none"
          className="flex shrink-0 items-center justify-between gap-3 rounded-full py-2 pr-2 pl-5 sm:pl-7"
        >
          <Link
            to="/portal"
            className="min-w-0 rounded-sm text-title font-semibold"
          >
            Gestión de Reclamos
          </Link>
          <div className="flex items-center gap-2">
            <span className="pill pill-neutral hidden h-11 px-4 font-mono text-id sm:inline-flex">
              {fechaLarga(hoy())}
            </span>
            <div className="lg:hidden">
              <SessionControl compacto />
            </div>
          </div>
        </Glass>
        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
        <footer className="flex flex-wrap justify-between gap-2 px-1 pb-2 text-caption text-ink-muted">
          <p>
            Datos ficticios. Los registros se reinician al recargar la página.
          </p>
          <p>
            Proyecto académico UCN · Sin vinculación institucional con SERNAC
          </p>
        </footer>
      </div>
    </div>
  )
}
