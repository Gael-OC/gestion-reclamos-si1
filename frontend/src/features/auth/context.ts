import { createContext, useContext } from 'react'
import type { Usuario } from './model'

type ResultadoAcceso =
  { ok: true; usuario: Usuario } | { ok: false; error: string }

type Auth = {
  usuario: Usuario | null
  iniciarSesion: (email: string, password: string) => Promise<ResultadoAcceso>
  registrarCliente: (
    nombre: string,
    email: string,
    password: string,
  ) => Promise<ResultadoAcceso>
  cerrarSesion: () => void
}

export const AuthContext = createContext<Auth | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('Se requiere el proveedor de sesión')
  return value
}
