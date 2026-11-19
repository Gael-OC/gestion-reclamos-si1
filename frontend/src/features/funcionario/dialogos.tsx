import { useState } from 'react'
import { CircleCheck, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ChipGroup } from '@/components/ui/ChipGroup'
import { Dialog } from '@/components/ui/Dialog'
import { Switch } from '@/components/ui/Switch'
import { TextField } from '@/components/ui/TextField'
import { fechaLarga, hoy, sumarDias } from '@/lib/fechas'
import { RESULTADOS, type Resultado } from './escenario'

type Base = { onClose: () => void; folio: string }

const pie = (onClose: () => void, accion: string) => (
  <>
    <Button onClick={onClose}>Cancelar</Button>
    <Button type="submit" variant="ink">
      {accion}
    </Button>
  </>
)

const TIPOS_GESTION = [
  { value: 'llamada', label: 'Llamada' },
  { value: 'correo', label: 'Correo' },
  { value: 'documentos', label: 'Revisión de documentos' },
  { value: 'otra', label: 'Otra' },
]

/** Registrar una gestión o una nota interna (actividad 7). */
export function GestionDialog({
  onClose,
  folio,
  modo,
  onSave,
}: Base & {
  modo: 'analisis' | 'nota'
  onSave: (datos: { texto: string; visible: boolean; tipo: string }) => void
}) {
  const [tipo, setTipo] = useState([
    modo === 'analisis' ? 'documentos' : 'llamada',
  ])
  const [texto, setTexto] = useState('')
  const [visible, setVisible] = useState(false)
  const [intento, setIntento] = useState(false)
  const error =
    texto.trim().length < 10
      ? 'Escriba al menos una frase con lo que hizo.'
      : undefined

  return (
    <Dialog
      open
      onClose={onClose}
      title={modo === 'analisis' ? 'Registrar análisis' : 'Agregar nota'}
      description={`Caso ${folio}`}
      onSubmit={() => {
        setIntento(true)
        if (!error)
          onSave({
            texto: texto.trim(),
            visible,
            tipo: TIPOS_GESTION.find((t) => t.value === tipo[0])?.label ?? '',
          })
      }}
      footer={pie(onClose, 'Guardar')}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-caption text-ink-muted">Qué hizo</span>
        <ChipGroup
          label="Tipo de gestión"
          options={TIPOS_GESTION}
          value={tipo}
          onChange={setTipo}
        />
      </div>
      <TextField
        label="Detalle"
        value={texto}
        onValueChange={setTexto}
        multiline
        required
        placeholder={
          modo === 'analisis'
            ? 'Por ejemplo: la boleta y la garantía están vigentes; corresponde pedir respuesta a la empresa.'
            : 'Por ejemplo: llamé a la consumidora y prefiere la devolución del dinero.'
        }
        error={intento ? error : undefined}
      />
      <div className="flex items-center gap-3">
        <Switch
          checked={visible}
          onChange={setVisible}
          labelledBy="visible-consumidor"
        />
        <span id="visible-consumidor">
          <span className="font-medium">Visible para el consumidor</span>{' '}
          <span className="text-caption text-ink-muted">
            {visible
              ? 'La verá en el portal'
              : 'Apagado: queda como nota interna'}
          </span>
        </span>
      </div>
    </Dialog>
  )
}

const FECHA = /^(\d{2})-(\d{2})-(\d{4})$/

function leerFecha(valor: string) {
  const match = FECHA.exec(valor.trim())
  if (!match) return null
  const [, d, m, a] = match.map(Number)
  const fecha = new Date(a, m - 1, d)
  return fecha.getDate() === d && fecha.getMonth() === m - 1 ? fecha : null
}

/** Pedir respuesta a la empresa (actividad 8), con fecha coherente. */
export function SolicitudDialog({
  onClose,
  folio,
  empresa,
  onSave,
}: Base & {
  empresa: string
  onSave: (datos: { hasta: string; texto: string }) => void
}) {
  const [hasta, setHasta] = useState(fechaLarga(sumarDias(hoy(), 7)))
  const [texto, setTexto] = useState('')
  const [intento, setIntento] = useState(false)
  const fecha = leerFecha(hasta)
  const errores = {
    hasta: !fecha
      ? 'Escriba la fecha como dd-mm-aaaa.'
      : fecha < hoy()
        ? `La fecha no puede ser anterior a hoy (${fechaLarga(hoy())}).`
        : undefined,
    texto:
      texto.trim().length < 10
        ? 'Explique qué necesita saber de la empresa.'
        : undefined,
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Pedir respuesta a la empresa"
      description={`${empresa} · caso ${folio}. Se envía por correo; aquí queda el registro.`}
      onSubmit={() => {
        setIntento(true)
        if (!errores.hasta && !errores.texto)
          onSave({ hasta: hasta.trim(), texto: texto.trim() })
      }}
      footer={pie(onClose, 'Registrar solicitud')}
    >
      <TextField
        label="Responder antes del"
        value={hasta}
        onValueChange={setHasta}
        required
        hint="dd-mm-aaaa"
        error={intento ? errores.hasta : undefined}
      />
      <TextField
        label="Qué se le pide"
        value={texto}
        onValueChange={setTexto}
        multiline
        required
        placeholder="Por ejemplo: informar si procede la devolución del dinero por falla dentro de la garantía."
        error={intento ? errores.texto : undefined}
      />
    </Dialog>
  )
}

/** Registrar la respuesta de la empresa o su ausencia (actividad 9). */
export function RespuestaDialog({
  onClose,
  folio,
  empresa,
  onSave,
}: Base & {
  empresa: string
  onSave: (datos: {
    respondio: boolean
    texto: string
    otraGestion: boolean
  }) => void
}) {
  const [respondio, setRespondio] = useState(['si'])
  const [texto, setTexto] = useState('')
  const [otra, setOtra] = useState(false)
  const [intento, setIntento] = useState(false)
  const si = respondio[0] === 'si'
  const error =
    si && texto.trim().length < 10
      ? 'Resuma lo que respondió la empresa.'
      : undefined

  return (
    <Dialog
      open
      onClose={onClose}
      title="Registrar la respuesta"
      description={`${empresa} · caso ${folio}`}
      onSubmit={() => {
        setIntento(true)
        if (!error)
          onSave({ respondio: si, texto: texto.trim(), otraGestion: otra })
      }}
      footer={pie(onClose, 'Guardar respuesta')}
    >
      <ChipGroup
        label="¿Respondió la empresa?"
        options={[
          { value: 'si', label: 'Respondió' },
          { value: 'no', label: 'No respondió a tiempo' },
        ]}
        value={respondio}
        onChange={setRespondio}
      />
      {si && (
        <TextField
          label="Qué respondió"
          value={texto}
          onValueChange={setTexto}
          multiline
          required
          placeholder="Por ejemplo: ofrece cambiar el producto, pero no devolver el dinero."
          error={intento ? error : undefined}
        />
      )}
      <label className="flex items-center gap-2.5 font-medium">
        <input
          type="checkbox"
          checked={otra}
          onChange={(event) => setOtra(event.target.checked)}
          className="size-4.5 accent-brand"
        />
        Hace falta otra gestión con la empresa
      </label>
      <p className="text-caption text-ink-muted">
        {otra
          ? 'El caso vuelve a En gestión para pedir una nueva respuesta.'
          : 'El caso vuelve a En gestión para informar el resultado.'}
      </p>
    </Dialog>
  )
}

/** Informar el resultado y cerrar (actividades 10 y 11). */
export function ResultadoDialog({
  onClose,
  folio,
  dias,
  onSave,
}: Base & {
  /** Días hasta la fecha límite al cerrar hoy. */
  dias: number
  onSave: (datos: { resultado: Resultado; mensaje: string }) => void
}) {
  const [resultado, setResultado] = useState<Resultado[]>([])
  const [mensaje, setMensaje] = useState('')
  const [intento, setIntento] = useState(false)
  const errores = {
    resultado: resultado.length === 0 ? 'Elija el resultado.' : undefined,
    mensaje:
      mensaje.trim().length < 20
        ? 'Explique el resultado y las alternativas que tiene el consumidor.'
        : undefined,
  }
  const enPlazo = dias >= 0
  const Icono = enPlazo ? CircleCheck : TriangleAlert

  return (
    <Dialog
      open
      onClose={onClose}
      title="Informar resultado y cerrar"
      description={`Caso ${folio} · el consumidor lo verá en el portal`}
      onSubmit={() => {
        setIntento(true)
        if (!errores.resultado && !errores.mensaje)
          onSave({ resultado: resultado[0], mensaje: mensaje.trim() })
      }}
      footer={pie(onClose, 'Publicar y cerrar')}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-caption text-ink-muted">Resultado *</span>
        <ChipGroup
          label="Resultado"
          options={(Object.keys(RESULTADOS) as Resultado[]).map((value) => ({
            value,
            label: RESULTADOS[value],
          }))}
          value={resultado}
          onChange={setResultado}
          invalid={intento && Boolean(errores.resultado)}
        />
        {intento && errores.resultado && (
          <p className="text-caption text-danger">{errores.resultado}</p>
        )}
      </div>
      <TextField
        label="Mensaje y alternativas"
        value={mensaje}
        onValueChange={setMensaje}
        multiline
        required
        placeholder="Por ejemplo: la empresa ofrece cambiar el producto. Si no está de acuerdo, puede seguir su reclamo por otras vías."
        error={intento ? errores.mensaje : undefined}
      />
      <div
        className={
          enPlazo
            ? 'flex items-center gap-3 rounded-md bg-[color-mix(in_srgb,var(--color-success)_8%,white)] px-4 py-2.5'
            : 'flex items-center gap-3 rounded-md bg-[color-mix(in_srgb,var(--color-danger)_8%,white)] px-4 py-2.5'
        }
      >
        <Icono
          size={20}
          className={enPlazo ? 'text-success' : 'text-danger'}
          aria-hidden
        />
        <span>
          <span className="block font-medium">
            Cierre hoy, {fechaLarga(hoy())}:{' '}
            {enPlazo ? 'dentro de plazo' : 'fuera de plazo'}
          </span>
          <span className="text-caption text-ink-muted">
            Cuenta para los KPI 1 y 3
          </span>
        </span>
      </div>
    </Dialog>
  )
}
