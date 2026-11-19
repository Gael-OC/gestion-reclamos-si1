import { useRef, useState, type FormEvent } from 'react'
import { CircleCheck, Paperclip, Send, X } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { useMisReclamos } from './useMisReclamos'
import type { AdjuntoCliente } from './model'

export function AportarAntecedentes({ reclamoId }: { reclamoId: string }) {
  const { aportarAntecedentes } = useMisReclamos()
  const [texto, setTexto] = useState('')
  const [archivos, setArchivos] = useState<AdjuntoCliente[]>([])
  const [error, setError] = useState('')
  const [errorArchivos, setErrorArchivos] = useState('')
  const [enviado, setEnviado] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  function seleccionar(files: FileList | null) {
    if (!files?.length) return
    const nuevos = [...files]
    if (input.current) input.current.value = ''
    if (archivos.length + nuevos.length > 3) {
      setErrorArchivos('Puedes agregar hasta 3 archivos.')
      return
    }
    if (nuevos.some((file) => !/\.(pdf|png|jpe?g)$/i.test(file.name))) {
      setErrorArchivos('Selecciona archivos PDF, JPG o PNG.')
      return
    }
    if (nuevos.some((file) => file.size > 5 * 1024 * 1024 || file.size === 0)) {
      setErrorArchivos('Cada archivo debe contener datos y pesar hasta 5 MB.')
      return
    }
    setArchivos((prev) => [
      ...prev,
      ...nuevos.map((file) => ({
        nombre: file.name,
        tamano: file.size,
        tipo: file.type,
      })),
    ])
    setErrorArchivos('')
    if (input.current) input.current.value = ''
  }

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (errorArchivos) {
      input.current?.focus()
      return
    }
    if (texto.trim().length < 10) {
      setError('Describe los antecedentes con al menos 10 caracteres.')
      document.getElementById('antecedentes-texto')?.focus()
      return
    }
    if (!aportarAntecedentes(reclamoId, texto, archivos)) {
      setError('No fue posible agregar antecedentes a este caso.')
      return
    }
    setTexto('')
    setArchivos([])
    setError('')
    setErrorArchivos('')
    setEnviado(true)
    if (input.current) input.current.value = ''
  }

  return (
    <Glass
      title="Aportar antecedentes"
      subtitle="Agrega información que ayude a revisar tu caso"
    >
      {enviado && (
        <p
          role="status"
          className="mb-5 flex items-start gap-2 rounded-md bg-glass-strong p-4 text-body text-success"
        >
          <CircleCheck size={19} className="mt-0.5 shrink-0" aria-hidden />
          Los antecedentes se agregaron al seguimiento y quedan pendientes de
          revisión.
        </p>
      )}
      <form noValidate onSubmit={enviar} className="space-y-4">
        <TextField
          id="antecedentes-texto"
          label="Información adicional"
          value={texto}
          onValueChange={(value) => {
            setTexto(value)
            setError('')
            setEnviado(false)
          }}
          multiline
          required
          maxLength={2000}
          placeholder="Explica los antecedentes o la información solicitada."
          hint={`${texto.length.toLocaleString('es-CL')} / 2.000 caracteres`}
          error={error}
        />
        <div>
          <label
            htmlFor="antecedentes-archivos"
            className="mb-1.5 block text-caption text-ink-muted"
          >
            Documentos de respaldo (opcional)
          </label>
          <input
            ref={input}
            id="antecedentes-archivos"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(event) => seleccionar(event.target.files)}
            aria-invalid={errorArchivos ? true : undefined}
            aria-describedby="antecedentes-archivos-ayuda"
            className="block w-full rounded-md border border-glass-rim bg-glass-strong p-3 text-caption text-ink-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:text-caption file:font-medium file:text-ink"
          />
          <p
            id="antecedentes-archivos-ayuda"
            className={`mt-2 text-caption ${errorArchivos ? 'text-danger' : 'text-ink-muted'}`}
          >
            {errorArchivos ||
              'Hasta 3 archivos PDF, JPG o PNG de 5 MB cada uno. Se conservan solo sus nombres durante esta sesión.'}
          </p>
          {archivos.length > 0 && (
            <ul className="mt-3 space-y-2" aria-label="Archivos seleccionados">
              {archivos.map((file, index) => (
                <li
                  key={`${file.nombre}-${index}`}
                  className="glass-tile flex min-w-0 items-center gap-2 rounded-sm px-3 py-1"
                >
                  <Paperclip
                    size={15}
                    className="shrink-0 text-brand"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-caption">
                    {file.nombre}
                  </span>
                  <IconButton
                    icon={X}
                    size="sm"
                    variant="ghost"
                    label={`Quitar ${file.nombre}`}
                    onClick={() => {
                      setArchivos((prev) => prev.filter((_, i) => i !== index))
                      setErrorArchivos('')
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end border-t border-glass-shade pt-4">
          <Button variant="ink" type="submit" icon={Send}>
            Agregar antecedentes
          </Button>
        </div>
      </form>
    </Glass>
  )
}
