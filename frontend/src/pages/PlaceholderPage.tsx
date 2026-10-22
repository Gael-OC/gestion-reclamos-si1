type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p>Vista pendiente de diseño.</p>
      <p className="text-muted text-sm">
        Prototipo académico ficticio — UCN 2026. Sin relación institucional con
        SERNAC.
      </p>
    </main>
  )
}
