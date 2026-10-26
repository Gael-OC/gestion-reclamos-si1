import type { NuevoReclamoDatos } from '../listado/model'

export function validarNuevoReclamo(datos: NuevoReclamoDatos) {
  const errores: Partial<Record<keyof NuevoReclamoDatos, string>> = {}
  if (!datos.asunto.trim())
    errores.asunto = 'Escriba un asunto para el reclamo.'
  if (!datos.empresa.trim()) errores.empresa = 'Indique la empresa involucrada.'
  if (!datos.mercado) errores.mercado = 'Seleccione un mercado.'
  if (!datos.comuna) errores.comuna = 'Seleccione una comuna.'
  if (!datos.descripcion.trim()) errores.descripcion = 'Describa lo ocurrido.'
  return errores
}
