import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { SideRail } from '@/components/layout/SideRail'
import { TopBar } from '@/components/layout/TopBar'
import {
  NAV,
  USUARIOS,
  perfilDeRuta,
  type Perfil,
} from '@/features/perfiles/perfiles'
import type { PerfilContext } from '@/features/perfiles/usePerfil'

/**
 * Layout de las vistas internas: riel a la izquierda, barra superior y el
 * contenido. En escritorio con alto suficiente ("tall") todo cabe en la
 * ventana; en pantallas más bajas o angostas la página se desplaza.
 *
 * El perfil sale de la ruta; en rutas compartidas (/reclamos) se mantiene el
 * último perfil visitado. El login deberá reemplazar esta deducción.
 */
export function AppLayout() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [ultimo, setUltimo] = useState<Perfil>('supervisor')
  const deRuta = perfilDeRuta(pathname, search)
  if (deRuta && deRuta !== ultimo) setUltimo(deRuta)
  const perfil = deRuta ?? ultimo

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
        usuario={USUARIOS[perfil].nombre}
        onSalir={() => navigate('/login')}
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
