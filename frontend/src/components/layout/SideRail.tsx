import { useId } from 'react'
import { NavLink } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { Bell, LogOut, type LucideIcon } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** true para que solo se active en la ruta exacta. */
  end?: boolean
  /** Cifra sobre el ícono (pendientes de esa sección). */
  badge?: number
}

type SideRailProps = {
  items: NavItem[]
  /** Nombre de quien usa la aplicación, para el avatar. */
  usuario: string
  /** Cierra la sesión y vuelve al inicio de sesión. */
  onSalir: () => void
}

const tooltip =
  'pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-x-1.5 -translate-y-1/2 rounded-[10px] bg-ink px-2.5 py-1.5 text-caption whitespace-nowrap text-on-ink opacity-0 shadow-ink transition-[opacity,translate] duration-300 ease-spring group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 lg:block'

/**
 * Riel de navegación: isla de vidrio vertical en escritorio y barra flotante
 * inferior en pantallas angostas. El ítem activo es un círculo de vidrio que
 * se desliza con resorte. El tooltip aparece por encima de las islas.
 */
export function SideRail({ items, usuario, onSalir }: SideRailProps) {
  const id = useId()
  const reduce = useReducedMotion()

  return (
    // El contenedor posiciona y eleva el riel (z-40) por encima de las islas,
    // para que su tooltip no quede por debajo de ellas.
    <div className="fixed inset-x-4 bottom-4 z-40 lg:relative lg:inset-auto lg:self-center">
      <nav
        aria-label="Navegación principal"
        className={cn(
          'glass-panel flex gap-2 rounded-full p-2',
          'justify-around lg:flex-col lg:justify-start lg:gap-4 lg:px-2 lg:py-3',
        )}
      >
        <ul className="flex w-full justify-around gap-1 lg:flex-col lg:gap-2">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                aria-label={
                  item.badge ? `${item.label}, ${item.badge}` : item.label
                }
                className="group relative grid size-12 place-items-center rounded-full text-ink-muted transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={`rail-${id}`}
                        className="absolute inset-0 rounded-full bg-glass-strong shadow-tile ring-1 ring-glass-rim"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : {
                                type: 'spring',
                                stiffness: 380,
                                damping: 28,
                              }
                        }
                      />
                    )}
                    <item.icon
                      size={18}
                      strokeWidth={1.6}
                      aria-hidden
                      className="relative transition-transform duration-300 ease-spring group-hover:scale-110"
                    />
                    {item.badge !== undefined && (
                      <span
                        aria-hidden
                        className="absolute top-0.5 -right-0.5 grid h-[18px] min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[0.6875rem] leading-none font-semibold text-on-ink shadow-[0_0_0_2px_var(--color-glass-strong)]"
                      >
                        {item.badge}
                      </span>
                    )}
                    <span aria-hidden className={tooltip}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden flex-col items-center gap-3 border-t border-glass-shade pt-3 lg:flex">
          <button
            type="button"
            aria-label="Notificaciones"
            className="group relative grid size-12 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors hover:text-ink"
          >
            <Bell size={18} strokeWidth={1.6} aria-hidden />
            <span className="absolute top-3 right-3 size-[7px] rounded-full bg-danger shadow-[0_0_0_2px_var(--color-glass-strong)]" />
            <span aria-hidden className={tooltip}>
              Notificaciones
            </span>
          </button>
          <Avatar name={usuario} size={40} />
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={onSalir}
            className="group relative grid size-12 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors hover:bg-glass-tile hover:text-danger"
          >
            <LogOut size={18} strokeWidth={1.6} aria-hidden />
            <span aria-hidden className={tooltip}>
              Cerrar sesión
            </span>
          </button>
        </div>
      </nav>
    </div>
  )
}
