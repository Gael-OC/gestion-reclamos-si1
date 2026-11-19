import { LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { IconButton } from '@/components/ui/IconButton'
import { useAuth } from './context'
import { ROLES } from './model'

export function SessionControl({ compacto = false }: { compacto?: boolean }) {
  const { usuario, cerrarSesion } = useAuth()
  if (!usuario) return null
  return (
    <div className="flex min-w-0 items-center gap-3">
      {!compacto && (
        <div className="hidden min-w-0 text-right xl:block">
          <p className="max-w-40 truncate text-label font-medium">
            {usuario.nombre}
          </p>
          <p className="text-caption text-ink-muted">
            {ROLES[usuario.rol].nombre}
          </p>
        </div>
      )}
      {!compacto && (
        <span className="hidden sm:inline-flex">
          <Avatar name={usuario.nombre} size={34} />
        </span>
      )}
      <IconButton
        icon={LogOut}
        label="Cerrar sesión"
        variant="ghost"
        onClick={cerrarSesion}
      />
    </div>
  )
}
