import type { Usuario } from './model'

export type CuentaLocal = Usuario & {
  rol: 'cliente'
  credencial: { sal: string; hash: string }
}

const CUENTAS_KEY = 'reclamos.cuentas.frontend.v1'

export function leerCuentasLocales(): CuentaLocal[] {
  try {
    const datos: unknown = JSON.parse(localStorage.getItem(CUENTAS_KEY) ?? '[]')
    if (!Array.isArray(datos)) return []
    return datos.filter(
      (value): value is CuentaLocal =>
        value !== null &&
        typeof value === 'object' &&
        typeof value.id === 'string' &&
        value.id.startsWith('cliente-') &&
        typeof value.nombre === 'string' &&
        typeof value.email === 'string' &&
        value.rol === 'cliente' &&
        value.credencial !== null &&
        typeof value.credencial === 'object' &&
        typeof value.credencial.sal === 'string' &&
        /^[a-f0-9]{32}$/.test(value.credencial.sal) &&
        typeof value.credencial.hash === 'string' &&
        /^[a-f0-9]{64}$/.test(value.credencial.hash),
    )
  } catch {
    return []
  }
}

function hexadecimal(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

async function derivarPassword(password: string, sal: string) {
  const salt = new Uint8Array(
    sal.match(/.{2}/g)!.map((value) => parseInt(value, 16)),
  )
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    clave,
    256,
  )
  return hexadecimal(bits)
}

export async function crearCredencial(password: string) {
  const sal = hexadecimal(crypto.getRandomValues(new Uint8Array(16)).buffer)
  return { sal, hash: await derivarPassword(password, sal) }
}

export async function verificarCredencial(
  password: string,
  credencial: CuentaLocal['credencial'],
) {
  return (await derivarPassword(password, credencial.sal)) === credencial.hash
}

export function guardarCuentaLocal(cuenta: CuentaLocal) {
  const cuentas = leerCuentasLocales()
  if (cuentas.some((item) => item.email === cuenta.email)) return false
  localStorage.setItem(CUENTAS_KEY, JSON.stringify([...cuentas, cuenta]))
  return true
}
