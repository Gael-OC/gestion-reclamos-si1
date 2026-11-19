import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'
import { EQUIPO, type Funcionario } from './escenario'

type AsignarDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  /** Quien tiene hoy los casos; no aparece como destino. */
  desdeId?: string | null
  /** Si se mueven varios casos: máximo y cantidad inicial. */
  cantidad?: { max: number; inicial: number }
  /** Carga actual de cada persona (para reflejar cambios de la demo). */
  equipo?: Funcionario[]
  onConfirm: (destino: Funcionario, cantidad: number) => void
}

/**
 * Elegir a quién asignar o reasignar. Ordena por menor carga (KPI 5) y
 * muestra cómo queda la carga de la persona elegida.
 */
export function AsignarDialog({
  open,
  onClose,
  title,
  description,
  desdeId,
  cantidad,
  equipo = EQUIPO,
  onConfirm,
}: AsignarDialogProps) {
  const opciones = equipo
    .filter((persona) => persona.id !== desdeId)
    .sort((a, b) => a.activos - b.activos)
  const [destinoId, setDestinoId] = useState(opciones[0]?.id)
  const [n, setN] = useState(cantidad?.inicial ?? 1)
  const destino = opciones.find((persona) => persona.id === destinoId)
  const max = Math.max(...equipo.map((persona) => persona.activos), 1)

  function confirmar() {
    if (!destino) return
    onConfirm(destino, n)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      onSubmit={confirmar}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="ink" disabled={!destino}>
            {cantidad
              ? `Reasignar ${n} ${n === 1 ? 'caso' : 'casos'}`
              : `Asignar a ${destino?.nombre.split(' ')[0] ?? ''}`}
          </Button>
        </>
      }
    >
      {cantidad && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-label">Cuántos casos</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-glass-shade p-1">
            <IconButton
              icon={Minus}
              label="Uno menos"
              size="sm"
              disabled={n <= 1}
              onClick={() => setN(Math.max(1, n - 1))}
            />
            <strong className="min-w-9 text-center text-title font-medium">
              {n}
            </strong>
            <IconButton
              icon={Plus}
              label="Uno más"
              size="sm"
              disabled={n >= cantidad.max}
              onClick={() => setN(Math.min(cantidad.max, n + 1))}
            />
          </span>
        </div>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-label">
          A quién{' '}
          <span className="text-caption font-normal text-ink-muted">
            · primero quienes tienen menos casos
          </span>
        </legend>
        {opciones.map((persona) => {
          const on = persona.id === destinoId
          return (
            <button
              key={persona.id}
              type="button"
              aria-pressed={on}
              onClick={() => setDestinoId(persona.id)}
              className={cn(
                'grid w-full cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_7rem] items-center gap-3 rounded-md border-[1.5px] bg-white/80 px-3 py-2 text-left transition-[border-color,box-shadow]',
                on
                  ? 'border-brand shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)]'
                  : 'border-glass-shade hover:border-brand/40',
              )}
            >
              <Avatar name={persona.nombre} size={36} />
              <span>
                <span className="block font-medium">{persona.nombre}</span>
                <span className="text-caption text-ink-muted">
                  {persona.vencidos}{' '}
                  {persona.vencidos === 1 ? 'vencido' : 'vencidos'}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-right text-caption text-ink-muted">
                  {persona.activos}
                  {on && (
                    <>
                      {' → '}
                      <strong className="font-medium text-ink">
                        {persona.activos + n}
                      </strong>
                    </>
                  )}{' '}
                  casos
                </span>
                <span className="h-1.5 rounded-full bg-glass-shade">
                  <span
                    className="block h-full rounded-full bg-linear-to-r from-brand-glow to-brand"
                    style={{
                      width: `${Math.min(100, ((persona.activos + (on ? n : 0)) / max) * 100)}%`,
                    }}
                  />
                </span>
              </span>
            </button>
          )
        })}
      </fieldset>
    </Dialog>
  )
}
