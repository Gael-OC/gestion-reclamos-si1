import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleCheck,
  FileText,
  MapPin,
  Plus,
} from 'lucide-react'
import { Glass } from '@/components/ui/Glass'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { EstadoBadge } from '../EstadoBadge'
import { useReclamosDemo } from '../demo/context'
import { FECHA_REFERENCIA, MERCADOS } from '../listado/mockData'
import {
  fechaVisible,
  type NuevoReclamoDatos,
  type ReclamoListado,
} from '../listado/model'
import { validarNuevoReclamo } from './validacion'

const comunas = [
  'Coquimbo',
  'Illapel',
  'La Serena',
  'Monte Patria',
  'Ovalle',
  'Vicuña',
]
const vacio: NuevoReclamoDatos = {
  asunto: '',
  empresa: '',
  mercado: '',
  comuna: '',
  descripcion: '',
}
const avisoDatosFicticios =
  'Datos ficticios. Los registros se reinician al recargar la página.'

export function ReclamoForm() {
  const navigate = useNavigate()
  const { registrar } = useReclamosDemo()
  const [datos, setDatos] = useState<NuevoReclamoDatos>(vacio)
  const [errores, setErrores] = useState<
    Partial<Record<keyof NuevoReclamoDatos, string>>
  >({})
  const [registrado, setRegistrado] = useState<ReclamoListado | null>(null)
  const completos = Object.values(datos).filter((value) => value.trim()).length

  function cambiar(campo: keyof NuevoReclamoDatos, value: string) {
    setDatos((prev) => ({ ...prev, [campo]: value }))
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nuevosErrores = validarNuevoReclamo(datos)
    setErrores(nuevosErrores)
    const primero = Object.keys(nuevosErrores)[0]
    if (primero) {
      document.getElementById(`nuevo-${primero}`)?.focus()
      return
    }
    const limpios = {
      ...datos,
      asunto: datos.asunto.trim(),
      empresa: datos.empresa.trim(),
      descripcion: datos.descripcion.trim(),
    }
    setRegistrado(registrar(limpios))
  }

  if (registrado) {
    return (
      <div className="grid flex-1 place-items-center">
        <Glass className="w-full max-w-xl p-6 sm:p-8">
          <span className="glass-tile grid size-14 place-items-center rounded-full text-success">
            <CircleCheck size={28} strokeWidth={1.5} aria-hidden />
          </span>
          <h2 className="mt-5 text-display" role="status">
            Reclamo registrado
          </h2>
          <p className="mt-3 font-mono text-title">{registrado.id}</p>
          <p className="mt-2 break-words text-body text-ink-muted">
            {registrado.asunto}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <EstadoBadge estado="ingresado" />
            <span className="pill pill-neutral">Sin asignar</span>
          </div>
          <p className="mt-6 text-caption text-ink-muted">
            El caso se añadió al listado.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="ink"
              iconRight={ArrowUpRight}
              onClick={() => navigate(`/reclamos?buscar=${registrado.id}`)}
            >
              Ver reclamo
            </Button>
            <Button
              icon={Plus}
              onClick={() => {
                setDatos(vacio)
                setErrores({})
                setRegistrado(null)
              }}
            >
              Registrar otro
            </Button>
          </div>
          <p className="mt-6 border-t border-glass-shade pt-4 text-caption text-ink-muted">
            {avisoDatosFicticios}
          </p>
        </Glass>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={enviar}
      className="grid min-h-0 flex-1 gap-6 lg:grid-cols-3 tall:grid-rows-[minmax(0,1fr)] compact:gap-5"
    >
      <Glass
        title="Antecedentes del reclamo"
        subtitle="Complete los campos marcados con *"
        className="flex min-h-0 flex-col lg:col-span-2 compact:p-4"
      >
        <div className="min-h-0 flex-1 tall:overflow-y-auto tall:pr-1">
          {Object.values(errores).some(Boolean) && (
            <p role="alert" className="mb-4 text-caption text-danger">
              Revise los campos marcados para continuar.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="nuevo-asunto"
              label="Asunto"
              value={datos.asunto}
              onValueChange={(value) => cambiar('asunto', value)}
              placeholder="Por ejemplo, cobro duplicado en una compra"
              maxLength={120}
              required
              error={errores.asunto}
              className="sm:col-span-2"
            />
            <TextField
              id="nuevo-empresa"
              label="Empresa"
              value={datos.empresa}
              onValueChange={(value) => cambiar('empresa', value)}
              placeholder="Nombre de la empresa"
              maxLength={100}
              required
              error={errores.empresa}
            />
            <SelectField
              id="nuevo-comuna"
              label="Comuna"
              value={datos.comuna}
              onValueChange={(value) => cambiar('comuna', value)}
              options={[
                { value: '', label: 'Seleccione una comuna' },
                ...comunas.map((value) => ({ value, label: value })),
              ]}
              required
              error={errores.comuna}
            />
            <SelectField
              id="nuevo-mercado"
              label="Mercado"
              value={datos.mercado}
              onValueChange={(value) => cambiar('mercado', value)}
              options={[
                { value: '', label: 'Seleccione un mercado' },
                ...MERCADOS.map((value) => ({ value, label: value })),
              ]}
              required
              error={errores.mercado}
              className="sm:col-span-2"
            />
            <TextField
              id="nuevo-descripcion"
              label="Descripción"
              value={datos.descripcion}
              onValueChange={(value) => cambiar('descripcion', value)}
              placeholder="Describa lo ocurrido y qué solución solicita."
              multiline
              maxLength={2000}
              required
              error={errores.descripcion}
              hint={`${datos.descripcion.length.toLocaleString('es-CL')} / 2.000 caracteres`}
              className="sm:col-span-2"
            />
          </div>
        </div>
        <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-glass-shade pt-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/reclamos')}
          >
            Cancelar
          </Button>
          <Button variant="ink" icon={Plus} type="submit">
            Registrar reclamo
          </Button>
        </div>
      </Glass>

      <Glass className="flex min-w-0 flex-col gap-5 lg:min-h-0 compact:p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-title">Resumen del registro</h2>
          <span className="pill pill-neutral">{completos} / 5</span>
        </div>
        <div className="min-h-0 flex-1 space-y-5 tall:overflow-y-auto tall:pr-1">
          <div className="glass-tile rounded-md p-4">
            <span className="mb-3 inline-flex size-9 items-center justify-center rounded-full bg-glass-strong shadow-tile">
              <FileText size={18} strokeWidth={1.6} aria-hidden />
            </span>
            <p className="break-words text-title">
              {datos.asunto.trim() || 'Su nuevo reclamo'}
            </p>
            <p className="mt-2 flex items-start gap-2 break-words text-caption text-ink-muted">
              <Building2
                size={14}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0"
                aria-hidden
              />
              <span className="min-w-0 break-words">
                {datos.empresa.trim() || 'Empresa por completar'}
              </span>
            </p>
            <p className="mt-2 flex items-start gap-2 text-caption text-ink-muted">
              <MapPin
                size={14}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0"
                aria-hidden
              />
              {datos.comuna || 'Comuna por seleccionar'}
            </p>
            <p className="mt-2 text-caption text-ink-muted">
              {datos.mercado || 'Mercado por seleccionar'}
            </p>
          </div>
          <dl className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-caption text-ink-muted">Estado inicial</dt>
              <dd>
                <EstadoBadge estado="ingresado" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-caption text-ink-muted">Responsable</dt>
              <dd className="text-label">Sin asignar</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-caption text-ink-muted">Fecha de ingreso</dt>
              <dd className="flex items-center gap-1.5 text-label">
                <CalendarDays size={14} strokeWidth={1.6} aria-hidden />
                {fechaVisible(FECHA_REFERENCIA)}
              </dd>
            </div>
          </dl>
        </div>
        <p className="mt-auto border-t border-glass-shade pt-4 text-caption text-ink-muted">
          {avisoDatosFicticios}
        </p>
      </Glass>
    </form>
  )
}
