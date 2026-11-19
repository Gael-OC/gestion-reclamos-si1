import type { Estado } from '@/features/reclamos/estados'

/** Pasos del funcionario en el BPMN (actividades 7 a 11). */
export const PASOS = [
  'Analizar',
  'Pedir a la empresa',
  'Registrar respuesta',
  'Informar resultado',
  'Cerrar',
] as const

export type Accion = 'analizar' | 'solicitar' | 'respuesta' | 'resultado'

export type ProximoPaso = {
  /** Índice en PASOS del paso actual (5 si terminó). */
  indice: number
  titulo: string
  texto: string
  accion: Accion | null
  boton: string
}

/**
 * Qué toca hacer según el estado del caso. Es una guía de la interfaz: las
 * transiciones válidas las controlará el backend.
 */
export function proximoPaso(
  estado: Estado,
  respuestaEmpresa: boolean,
  empresa: string,
): ProximoPaso {
  if (estado === 'cerrado' || estado === 'anulado')
    return {
      indice: PASOS.length,
      titulo: 'Caso cerrado',
      texto: 'El resultado ya está visible en el portal del consumidor.',
      accion: null,
      boton: '',
    }
  if (estado === 'asignado' || estado === 'ingresado')
    return {
      indice: 0,
      titulo: 'Analice el caso',
      texto:
        'Revise los antecedentes y deje una nota para el equipo. El caso pasará a En gestión.',
      accion: 'analizar',
      boton: 'Registrar análisis',
    }
  if (estado === 'esperando_empresa')
    return {
      indice: 2,
      titulo: `Registre la respuesta de ${empresa}`,
      texto:
        'Anote lo que respondió la empresa, o que no respondió a tiempo, para seguir con el caso.',
      accion: 'respuesta',
      boton: 'Registrar respuesta',
    }
  if (respuestaEmpresa)
    return {
      indice: 3,
      titulo: 'Informe el resultado al consumidor',
      texto:
        'La empresa ya respondió. Registre el resultado y cierre el caso para cumplir el plazo.',
      accion: 'resultado',
      boton: 'Informar resultado',
    }
  return {
    indice: 1,
    titulo: `Pida una respuesta a ${empresa}`,
    texto:
      'Indique qué necesita saber y hasta cuándo. El caso pasará a Esperando respuesta de empresa.',
    accion: 'solicitar',
    boton: 'Pedir respuesta',
  }
}
