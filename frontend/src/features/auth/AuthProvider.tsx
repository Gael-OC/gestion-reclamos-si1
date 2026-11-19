import { useState, type ReactNode } from 'react'
import { AuthContext } from './context'
import { CUENTAS_EJEMPLO, usuarioPublico, type Usuario } from './model'
import {
  crearCredencial,
  guardarCuentaLocal,
  leerCuentasLocales,
  verificarCredencial,
  type CuentaLocal,
} from './cuentasLocales'

const SESSION_KEY = 'reclamos.sesion.frontend.v1'

function leerSesion() {
  try {
    const id = sessionStorage.getItem(SESSION_KEY)
    const cuenta = [...CUENTAS_EJEMPLO, ...leerCuentasLocales()].find(
      (item) => item.id === id,
    )
    return cuenta ? usuarioPublico(cuenta) : null
  } catch {
    return null
  }
}

function guardarSesion(usuario: Usuario | null) {
  try {
    if (usuario) sessionStorage.setItem(SESSION_KEY, usuario.id)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    return
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesion)

  async function iniciarSesion(email: string, password: string) {
    const correo = email.trim().toLowerCase()
    const ejemplo = CUENTAS_EJEMPLO.find((item) => item.email === correo)
    const local = leerCuentasLocales().find((item) => item.email === correo)
    let valida = ejemplo?.password === password
    try {
      if (!ejemplo && local)
        valida = await verificarCredencial(password, local.credencial)
    } catch {
      return {
        ok: false as const,
        error: 'No se pudo verificar el acceso. Inténtalo nuevamente.',
      }
    }
    const cuenta = ejemplo ?? local
    if (!cuenta || !valida) {
      return {
        ok: false as const,
        error: 'El correo o la contraseña no coinciden.',
      }
    }
    const siguiente = usuarioPublico(cuenta)
    guardarSesion(siguiente)
    setUsuario(siguiente)
    return { ok: true as const, usuario: siguiente }
  }

  async function registrarCliente(
    nombre: string,
    email: string,
    password: string,
  ) {
    const correo = email.trim().toLowerCase()
    if (
      [...CUENTAS_EJEMPLO, ...leerCuentasLocales()].some(
        (item) => item.email === correo,
      )
    ) {
      return {
        ok: false as const,
        error: 'Este correo ya tiene una cuenta. Inicia sesión para continuar.',
      }
    }
    let cuenta: CuentaLocal
    try {
      cuenta = {
        id: `cliente-${crypto.randomUUID()}`,
        nombre: nombre.trim(),
        email: correo,
        credencial: await crearCredencial(password),
        rol: 'cliente',
      }
      if (!guardarCuentaLocal(cuenta))
        return {
          ok: false as const,
          error:
            'Este correo ya tiene una cuenta. Inicia sesión para continuar.',
        }
    } catch {
      return {
        ok: false as const,
        error:
          'No se pudo guardar la cuenta en este navegador. Comprueba que el almacenamiento esté habilitado.',
      }
    }
    const siguiente = usuarioPublico(cuenta)
    guardarSesion(siguiente)
    setUsuario(siguiente)
    return { ok: true as const, usuario: siguiente }
  }

  function cerrarSesion() {
    guardarSesion(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{ usuario, iniciarSesion, registrarCliente, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  )
}
