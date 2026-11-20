import { PageHeading } from '@/components/layout/PageHeading'
import { ReclamoForm } from '@/features/reclamos/registro/ReclamoForm'

export function ClienteNuevoReclamoPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 compact:gap-5">
      <PageHeading
        title="Nuevo reclamo"
        subtitle="Cuéntanos qué ocurrió y qué solución solicitas"
      />
      <ReclamoForm />
    </div>
  )
}
