import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ChipGroup } from '@/components/ui/ChipGroup'
import { Dialog } from '@/components/ui/Dialog'
import { TextField } from '@/components/ui/TextField'
import type { UsuarioInterno } from './escenario'

type NuevoUsuarioDialogProps = {
  onClose: () => void
  /** Correos ya usados: el correo de cada usuario es único. */
  correos: string[]
  onCreate: (usuario: Omit<UsuarioInterno, 'id'>) => void
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Alta de un supervisor o funcionario, con validación de nombre y correo. */
export function NuevoUsuarioDialog({
  onClose,
  correos,
  onCreate,
}: NuevoUsuarioDialogProps) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [perfil, setPerfil] = useState<UsuarioInterno['perfil'][]>([
    'funcionario',
  ])
  const [intento, setIntento] = useState(false)

  const errores = {
    nombre:
      nombre.trim().split(/\s+/).filter(Boolean).length < 2
        ? 'Escriba nombre y apellido.'
        : '',
    correo: !CORREO.test(correo.trim())
      ? 'Escriba un correo completo, por ejemplo nombre@unidad.test.'
      : correos.includes(correo.trim().toLowerCase())
        ? 'Ya existe un usuario con ese correo.'
        : '',
  }
  const mostrar = (campo: keyof typeof errores) =>
    intento ? errores[campo] || undefined : undefined

  function crear() {
    setIntento(true)
    if (errores.nombre || errores.correo) return
    onCreate({
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      perfil: perfil[0],
      activo: true,
      casos: perfil[0] === 'funcionario' ? 0 : undefined,
    })
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Nuevo usuario"
      description="Le llegará un correo para crear su contraseña"
      onSubmit={crear}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="ink">
            Crear usuario
          </Button>
        </>
      }
    >
      {intento && (errores.nombre || errores.correo) && (
        <p
          role="alert"
          className="rounded-md bg-white px-3.5 py-2.5 text-caption font-medium text-danger shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--color-danger)_30%,transparent)]"
        >
          Revise los campos marcados antes de crear el usuario.
        </p>
      )}
      <TextField
        label="Nombre y apellido"
        value={nombre}
        onValueChange={setNombre}
        required
        error={mostrar('nombre')}
      />
      <TextField
        label="Correo"
        value={correo}
        onValueChange={setCorreo}
        placeholder="nombre@unidad.test"
        required
        error={mostrar('correo')}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-caption text-ink-muted">Perfil</span>
        <ChipGroup
          label="Perfil"
          options={[
            { value: 'supervisor', label: 'Supervisor' },
            { value: 'funcionario', label: 'Funcionario' },
          ]}
          value={perfil}
          onChange={setPerfil}
        />
        <span className="text-caption text-ink-muted">
          {perfil[0] === 'funcionario'
            ? 'Solo verá los casos que se le asignen.'
            : 'Podrá revisar, asignar y administrar usuarios.'}
        </span>
      </div>
    </Dialog>
  )
}
