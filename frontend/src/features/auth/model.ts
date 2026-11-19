import { USUARIOS } from '@/features/perfiles/perfiles'

export type Rol = 'cliente' | 'supervisor' | 'funcionario'

export type Usuario = {
  id: string
  nombre: string
  email: string
  rol: Rol
  responsableId?: string
}

export type Cuenta = Usuario & { password: string }

export const ROLES: Record<Rol, { nombre: string; descripcion: string }> = {
  cliente: {
    nombre: 'Cliente',
    descripcion: 'Ingresa y consulta tus reclamos',
  },
  supervisor: {
    nombre: 'Supervisor',
    descripcion: 'Supervisa los casos y al equipo',
  },
  funcionario: {
    nombre: 'Funcionario',
    descripcion: 'Gestiona tus casos asignados',
  },
}

export const CUENTAS_EJEMPLO: Cuenta[] = [
  {
    id: 'cliente-fernanda',
    nombre: 'Fernanda Castillo',
    email: 'cliente@demo.local',
    password: 'Reclamos2026!',
    rol: 'cliente',
  },
  {
    id: 'cliente-valentina',
    nombre: 'Valentina Pérez',
    email: 'valentina@demo.local',
    password: 'Reclamos2026!',
    rol: 'cliente',
  },
  {
    id: 'cliente-matias',
    nombre: 'Matías González',
    email: 'cliente2@demo.local',
    password: 'Reclamos2026!',
    rol: 'cliente',
  },
  {
    id: 'supervisor-andrea',
    nombre: USUARIOS.supervisor.nombre,
    email: 'supervisor@demo.local',
    password: 'Reclamos2026!',
    rol: 'supervisor',
  },
  {
    id: 'funcionario-camila',
    nombre: USUARIOS.funcionario.nombre,
    email: 'funcionario@demo.local',
    password: 'Reclamos2026!',
    rol: 'funcionario',
    responsableId: 'camila-rojas',
  },
]

export function inicioPorRol(rol: Rol) {
  return rol === 'cliente' ? '/portal' : USUARIOS[rol].inicio
}

export function emailValido(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function usuarioPublico(cuenta: Usuario): Usuario {
  return {
    id: cuenta.id,
    nombre: cuenta.nombre,
    email: cuenta.email,
    rol: cuenta.rol,
    responsableId: cuenta.responsableId,
  }
}
