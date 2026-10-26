/** Decoración estática compartida: degradados CSS, sin WebGL ni bucle de render. */
export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <span className="backdrop-orb backdrop-orb-marino" />
      <span className="backdrop-orb backdrop-orb-pizarra" />
      <span className="backdrop-ring" />
      <span className="backdrop-orb backdrop-orb-perla" />
      <span className="backdrop-orb backdrop-orb-acero" />
    </div>
  )
}
