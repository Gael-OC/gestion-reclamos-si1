import { PageHeading } from '@/components/layout/PageHeading'
import { ReclamoForm } from '@/features/reclamos/registro/ReclamoForm'

export function NuevoReclamoPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 compact:gap-3">
      <PageHeading title="Nuevo reclamo" />
      <ReclamoForm />
    </div>
  )
}
