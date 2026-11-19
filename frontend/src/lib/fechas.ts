/*
 * Fechas de la demo. Las vistas por perfil usan la fecha de hoy como corte:
 * los plazos se guardan en días relativos y aquí se convierten a fechas.
 */

const MS_DIA = 24 * 60 * 60 * 1000

export function hoy() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function sumarDias(base: Date, dias: number) {
  return new Date(base.getTime() + dias * MS_DIA)
}

/** dd-mm-aaaa, el formato del sistema de diseño. */
export function fechaLarga(fecha: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(fecha)
    .replaceAll('/', '-')
}

/** dd-mm, para listas e historiales. */
export function fechaCorta(fecha: Date) {
  return fechaLarga(fecha).slice(0, 5)
}

/** Fecha a `dias` de hoy (negativo hacia atrás), en formato dd-mm. */
export function diaRelativo(dias: number) {
  return fechaCorta(sumarDias(hoy(), dias))
}

export function nombreMes(fecha: Date) {
  return new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(fecha)
}

/** Rótulos cortos ("Jul", "Ago"…) de los últimos `n` meses, el actual al final. */
export function mesesRecientes(n: number) {
  const base = hoy()
  return Array.from({ length: n }, (_, index) => {
    const fecha = new Date(
      base.getFullYear(),
      base.getMonth() - (n - 1 - index),
    )
    const corto = new Intl.DateTimeFormat('es-CL', { month: 'short' })
      .format(fecha)
      .replace('.', '')
      .slice(0, 3)
    return corto.charAt(0).toUpperCase() + corto.slice(1)
  })
}

export function mesActual() {
  return nombreMes(hoy())
}

export function mesAnterior() {
  const base = hoy()
  return nombreMes(new Date(base.getFullYear(), base.getMonth() - 1))
}

export function saludo() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}
