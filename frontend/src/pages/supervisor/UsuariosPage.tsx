import { useState } from 'react'
import { CircleCheck, Plus, UserPlus } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Orb } from '@/components/ui/Orb'
import { Switch } from '@/components/ui/Switch'
import { PageHeading } from '@/components/layout/PageHeading'
import {
  CONSUMIDORES,
  USUARIOS_INTERNOS,
  type UsuarioInterno,
} from '@/features/supervision/escenario'
import { NuevoUsuarioDialog } from '@/features/supervision/NuevoUsuarioDialog'
import { cn } from '@/lib/cn'

/** Administrar usuarios internos: perfiles, altas y acceso activo. */
export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState(USUARIOS_INTERNOS)
  const [nuevo, setNuevo] = useState(false)
  const [aviso, setAviso] = useState('')
  const supervisores = usuarios.filter((u) => u.perfil === 'supervisor').length
  const funcionarios = usuarios.length - supervisores
  const activos = usuarios.filter((u) => u.activo).length

  function alternar(usuario: UsuarioInterno) {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuario.id ? { ...u, activo: !u.activo } : u)),
    )
    setAviso(
      `${usuario.nombre} ${usuario.activo ? 'ya no puede ingresar' : 'puede volver a ingresar'}. Su historial se mantiene.`,
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading
        title="Usuarios"
        subtitle="Accesos y perfiles del sistema"
        action={
          <Button variant="ink" icon={UserPlus} onClick={() => setNuevo(true)}>
            Nuevo usuario
          </Button>
        }
      />
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>
      {aviso && (
        <div className="glass-strong flex items-center gap-2.5 self-start rounded-full px-4 py-2 text-caption font-medium text-success">
          <CircleCheck size={16} aria-hidden /> {aviso}
        </div>
      )}

      <div className="grid flex-1 gap-6 *:min-w-0 lg:grid-cols-[minmax(15rem,0.8fr)_2.2fr] tall:min-h-0">
        <Glass
          title="Perfiles"
          subtitle="Cada perfil ve solo sus opciones"
          className="flex flex-col tall:min-h-0 compact:p-4"
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Orb size={5.5}>
              <span>
                <span className="block text-title">{supervisores}</span>
                <span className="text-caption text-ink-muted">
                  {supervisores === 1 ? 'Supervisora' : 'Supervisores'}
                </span>
              </span>
            </Orb>
            <Orb size={7}>
              <span>
                <span className="block text-metric">{funcionarios}</span>
                <span className="text-caption text-ink-muted">
                  Funcionarios
                </span>
              </span>
            </Orb>
            <Orb tone="marino" size={7}>
              <span>
                <span className="block text-metric">{CONSUMIDORES}</span>
                <span className="text-caption">Consumidores</span>
              </span>
            </Orb>
          </div>
          <p className="text-center text-caption text-ink-muted">
            Los consumidores crean su cuenta en el portal
          </p>
        </Glass>

        <Glass
          title="Equipo interno"
          subtitle={`${usuarios.length} personas · ${activos} con acceso activo`}
          className="flex flex-col tall:min-h-0 tall:overflow-y-auto compact:p-4"
        >
          <ul className="grid flex-1 content-start gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {usuarios.map((usuario) => (
              <li
                key={usuario.id}
                className={cn(
                  'glass-tile flex flex-col items-center gap-2 px-3 pt-4 pb-3.5 text-center',
                  !usuario.activo && 'opacity-70',
                )}
              >
                <Avatar
                  name={usuario.nombre}
                  size={50}
                  className={cn(!usuario.activo && 'grayscale')}
                />
                <span className="font-medium">{usuario.nombre}</span>
                <span className="max-w-full truncate text-caption text-ink-muted">
                  {usuario.correo}
                </span>
                <span
                  className={cn(
                    'pill',
                    usuario.perfil === 'supervisor'
                      ? 'pill-filled'
                      : usuario.activo
                        ? 'pill-neutral'
                        : 'pill-muted',
                  )}
                >
                  {usuario.perfil === 'supervisor'
                    ? 'Supervisión'
                    : `Funcionario · ${usuario.casos ? `${usuario.casos} casos` : 'sin casos'}`}
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <Switch
                    checked={usuario.activo}
                    onChange={() => alternar(usuario)}
                    label={`Acceso de ${usuario.nombre}`}
                  />
                  <span className="text-caption text-ink-muted">
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </span>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setNuevo(true)}
                className="flex h-full min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-ink-muted/40 px-3 py-4 text-center hover:bg-glass-tile"
              >
                <span className="grid size-12 place-items-center rounded-full bg-glass-strong shadow-tile">
                  <Plus size={20} strokeWidth={1.6} aria-hidden />
                </span>
                <span className="font-medium">Agregar persona</span>
                <span className="text-caption text-ink-muted">
                  Supervisor o funcionario
                </span>
              </button>
            </li>
          </ul>
        </Glass>
      </div>

      {nuevo && (
        <NuevoUsuarioDialog
          onClose={() => setNuevo(false)}
          correos={usuarios.map((u) => u.correo)}
          onCreate={(datos) => {
            setUsuarios((prev) => [
              ...prev,
              { ...datos, id: datos.correo.split('@')[0] },
            ])
            setAviso(
              `${datos.nombre} fue creado. Le llegará un correo para crear su contraseña.`,
            )
            setNuevo(false)
          }}
        />
      )}
    </div>
  )
}
