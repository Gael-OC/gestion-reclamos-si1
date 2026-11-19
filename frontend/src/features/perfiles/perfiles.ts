import {
  BriefcaseBusiness,
  ListChecks,
  ChartColumn,
  ChartPie,
  CircleCheck,
  FileSearch,
  Inbox,
  SlidersHorizontal,
  UserPlus,
  Users,
} from 'lucide-react'
import type { NavItem } from '@/components/layout/SideRail'

/*
 * Perfiles internos de la demo. Mientras no exista el login, el perfil se
 * deduce de la ruta (/supervisor o /funcionario). El login de la compañera
 * deberá reemplazar esta deducción por el perfil del usuario autenticado.
 */
export type Perfil = 'supervisor' | 'funcionario'

export const USUARIOS: Record<
  Perfil,
  { nombre: string; rol: string; inicio: string }
> = {
  supervisor: {
    nombre: 'Andrea Fuentes',
    rol: 'Supervisora',
    inicio: '/supervisor',
  },
  funcionario: {
    nombre: 'Camila Rojas',
    rol: 'Funcionaria',
    inicio: '/funcionario',
  },
}

export const NAV: Record<Perfil, NavItem[]> = {
  supervisor: [
    { to: '/supervisor', label: 'Inicio', icon: ChartPie, end: true },
    { to: '/supervisor/bandeja', label: 'Bandeja', icon: Inbox, badge: 34 },
    { to: '/reclamos', label: 'Reclamos', icon: FileSearch },
    { to: '/supervisor/equipo', label: 'Equipo', icon: Users },
    { to: '/supervisor/indicadores', label: 'Indicadores', icon: ChartColumn },
    { to: '/supervisor/usuarios', label: 'Usuarios', icon: UserPlus },
    {
      to: '/supervisor/configuracion',
      label: 'Configuración',
      icon: SlidersHorizontal,
    },
  ],
  funcionario: [
    {
      to: '/funcionario',
      label: 'Mis casos',
      icon: BriefcaseBusiness,
      end: true,
      badge: 10,
    },
    {
      to: '/reclamos?alcance=mios',
      label: 'Todos mis casos',
      icon: ListChecks,
    },
    { to: '/funcionario/cerrados', label: 'Cerrados', icon: CircleCheck },
  ],
}

/**
 * Perfil indicado por la ruta; null en rutas compartidas como /reclamos,
 * salvo el listado de los casos propios (`alcance=mios`), que es del funcionario.
 */
export function perfilDeRuta(pathname: string, search = ''): Perfil | null {
  if (pathname.startsWith('/funcionario')) return 'funcionario'
  if (
    pathname === '/reclamos' &&
    new URLSearchParams(search).get('alcance') === 'mios'
  )
    return 'funcionario'
  if (pathname.startsWith('/supervisor')) return 'supervisor'
  return null
}
