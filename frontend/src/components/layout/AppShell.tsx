import { Outlet } from 'react-router'
import { Backdrop } from '@/components/layout/Backdrop'

/** Layout principal: el fondo 3D queda fijo detrás de todas las vistas. */
export function AppShell() {
  return (
    <>
      <Backdrop />
      <Outlet />
    </>
  )
}
