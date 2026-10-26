import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Devuelve 0 en el primer render y `value` en el siguiente cuadro, para que
 * NumberFlow anime la cifra desde cero al aparecer.
 */
export function useRevealValue(value: number) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value))
    return () => cancelAnimationFrame(frame)
  }, [value])

  return shown
}
