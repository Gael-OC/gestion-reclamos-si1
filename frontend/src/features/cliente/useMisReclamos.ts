import { useAuth } from '@/features/auth/context'
import { useReclamosDemo } from '@/features/reclamos/demo/context'
import { estaActivo, requiereAntecedentes, reclamosDeCliente } from './model'

export function useMisReclamos() {
  const { usuario } = useAuth()
  const {
    reclamos,
    historicoCliente,
    seguimiento,
    aportarAntecedentes,
    detalle,
  } = useReclamosDemo()
  const propios =
    usuario?.rol === 'cliente'
      ? reclamosDeCliente([...reclamos, ...historicoCliente], usuario.id)
      : []
  return {
    reclamos: propios,
    activos: propios.filter(estaActivo),
    cerrados: propios.filter((row) => row.estado === 'cerrado'),
    pendientes: propios.filter((row) =>
      requiereAntecedentes(row, seguimiento(row)),
    ),
    seguimiento,
    detalle,
    aportarAntecedentes,
  }
}
