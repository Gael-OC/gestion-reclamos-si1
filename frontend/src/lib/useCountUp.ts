import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const format = new Intl.NumberFormat('es-CL')

/** Cuenta desde 0 hasta `value` al montar (para cifras dentro de SVG). */
export function useCountUp(value: number, duration = 1200) {
  const reduce = useReducedMotion()
  const [current, setCurrent] = useState(reduce ? value : 0)

  useEffect(() => {
    if (reduce) return
    let frame = 0
    let start: number | undefined
    const step = (time: number) => {
      start ??= time
      const progress = Math.min(1, (time - start) / duration)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCurrent(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reduce])

  return format.format(reduce ? value : current)
}
