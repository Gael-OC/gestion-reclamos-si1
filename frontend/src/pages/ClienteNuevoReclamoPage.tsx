import { PageHeading } from '@/components/layout/PageHeading'
import { ReclamoForm } from '@/features/reclamos/registro/ReclamoForm'

export function ClienteNuevoReclamoPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Nuevo reclamo"
        subtitle="Cuéntanos qué ocurrió y qué solución solicitas"
      />
      <ReclamoForm cliente />
    </div>
  )
}
