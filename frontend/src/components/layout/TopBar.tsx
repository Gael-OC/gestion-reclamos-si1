import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { fechaLarga, hoy } from '@/lib/fechas'
import { useLocation } from 'react-router'
import { SessionControl } from '@/features/auth/SessionControl'

type TopBarProps = {
  onBuscar: (texto: string) => void
}

export function TopBar({ onBuscar }: TopBarProps) {
  const { pathname } = useLocation()
  const [texto, setTexto] = useState('')

  function enviar(event: FormEvent) {
    event.preventDefault()
    onBuscar(texto.trim())
  }

  return (
    <Glass
      role="banner"
      padding="none"
      className="flex shrink-0 items-center gap-3 rounded-full py-2 pr-2 pl-5 sm:gap-4 sm:pl-7"
    >
      <span className="text-title font-semibold whitespace-nowrap">
        Gestión de Reclamos
      </span>
      <div className="flex-1" />
      {pathname !== '/reclamos' && (
        <form role="search" onSubmit={enviar} className="hidden xl:block">
          <label className="flex h-11 w-80 items-center gap-2.5 rounded-full border border-glass-rim bg-glass-strong px-4 text-ink-muted shadow-tile transition-[box-shadow,background-color] focus-within:bg-white focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_18%,transparent)]">
            <Search size={16} strokeWidth={1.6} aria-hidden />
            <span className="sr-only">Buscar reclamo</span>
            <input
              type="search"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder="Buscar folio, empresa o asunto"
              className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-muted focus-visible:shadow-none [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
        </form>
      )}
      <span className="pill pill-neutral hidden h-11 px-4 font-mono text-id sm:inline-flex">
        {fechaLarga(hoy())}
      </span>
      <div className="lg:hidden">
        <SessionControl compacto />
      </div>
    </Glass>
  )
}
