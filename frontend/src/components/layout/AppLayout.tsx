import { Outlet } from 'react-router'
import { SideRail } from '@/components/layout/SideRail'
import { TopBar } from '@/components/layout/TopBar'

/**
 * Layout de las vistas internas: riel a la izquierda, barra superior y el
 * contenido. En escritorio con alto suficiente ("tall") todo cabe en la
 * ventana; en pantallas más bajas o angostas la página se desplaza.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:px-10 lg:py-8 xl:px-16 tall:h-dvh tall:py-10 compact:gap-5 compact:py-5">
      <SideRail />
      <div className="flex min-w-0 flex-1 flex-col gap-6 compact:gap-5">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
