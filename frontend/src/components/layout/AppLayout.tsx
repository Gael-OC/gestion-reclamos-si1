import { Outlet, useNavigate } from 'react-router'
import { SideRail } from '@/components/layout/SideRail'
import { TopBar } from '@/components/layout/TopBar'
import { NAV, type Perfil } from '@/features/perfiles/perfiles'
import type { PerfilContext } from '@/features/perfiles/usePerfil'
import { useAuth } from '@/features/auth/context'

export function AppLayout() {
  const navigate = useNavigate()
  const { usuario, cerrarSesion } = useAuth()
  const perfil: Perfil =
    usuario?.rol === 'funcionario' ? 'funcionario' : 'supervisor'

  function buscar(texto: string) {
    const params = new URLSearchParams()
    if (texto) params.set('buscar', texto)
    if (perfil === 'funcionario') params.set('alcance', 'mios')
    const query = params.toString()
    navigate(query ? `/reclamos?${query}` : '/reclamos')
  }

  return (
    <div className="flex min-h-dvh gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:px-10 lg:py-8 xl:px-16 tall:h-dvh tall:py-10 compact:gap-5 compact:py-5">
      <SideRail
        items={NAV[perfil]}
        usuario={usuario?.nombre ?? ''}
        onSalir={cerrarSesion}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-6 compact:gap-5">
        <TopBar onBuscar={buscar} />
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet context={{ perfil } satisfies PerfilContext} />
        </main>
      </div>
    </div>
  )
}
