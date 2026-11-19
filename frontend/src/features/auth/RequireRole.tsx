import { Navigate, Outlet } from 'react-router'
import { useAuth } from './context'
import { inicioPorRol, type Rol } from './model'

export function RequireRole({ roles }: { roles: Rol[] }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (!roles.includes(usuario.rol))
    return <Navigate to={inicioPorRol(usuario.rol)} replace />
  return <Outlet />
}

export function InicioPorSesion() {
  const { usuario } = useAuth()
  return (
    <Navigate to={usuario ? inicioPorRol(usuario.rol) : '/login'} replace />
  )
}
