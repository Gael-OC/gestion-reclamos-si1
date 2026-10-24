import { Component, lazy, Suspense, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'

// three.js se carga aparte para no inflar la carga inicial de la aplicación.
const BackdropScene = lazy(() => import('./BackdropScene'))

type BoundaryState = { failed: boolean }

/** Si el navegador no tiene WebGL, queda solo el cielo en CSS del body. */
class SceneBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Fondo vivo del sistema: escena 3D de vidrio esmerilado fija detrás de toda
 * la aplicación. Se usa una sola vez, en el layout principal.
 */
export function Backdrop() {
  const still = useReducedMotion() ?? false

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <SceneBoundary>
        <Suspense fallback={null}>
          <BackdropScene still={still} />
        </Suspense>
      </SceneBoundary>
    </div>
  )
}
