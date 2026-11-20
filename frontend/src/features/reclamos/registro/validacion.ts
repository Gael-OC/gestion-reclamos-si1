import type { NuevoReclamoDatos } from '../listado/model'

export function validarNuevoReclamo(datos: NuevoReclamoDatos) {
  const errores: Partial<Record<keyof NuevoReclamoDatos, string>> = {}
  if (!datos.asunto.trim())
    errores.asunto = 'Escribe un asunto para el reclamo.'
  if (!datos.empresa.trim()) errores.empresa = 'Indique la empresa involucrada.'
  if (!datos.mercado) errores.mercado = 'Selecciona un mercado.'
  if (!datos.comuna) errores.comuna = 'Selecciona una comuna.'
  if (!datos.descripcion.trim()) errores.descripcion = 'Describe lo ocurrido.'
  return errores
}
