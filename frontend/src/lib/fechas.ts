const MS_DIA = 24 * 60 * 60 * 1000

export function hoy() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function fechaISO(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

export function sumarDias(base: Date, dias: number) {
  return new Date(base.getTime() + dias * MS_DIA)
}

export function fechaLarga(fecha: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(fecha)
    .replaceAll('/', '-')
}

export function fechaCorta(fecha: Date) {
  return fechaLarga(fecha).slice(0, 5)
}

export function diaRelativo(dias: number) {
  return fechaCorta(sumarDias(hoy(), dias))
}

export function nombreMes(fecha: Date) {
  return new Intl.DateTimeFormat('es-CL', { month: 'long' }).format(fecha)
}

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
