import type { ReactNode } from 'react'

type PageHeadingProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeading({ title, subtitle, action }: PageHeadingProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
      <div className="flex flex-wrap items-baseline gap-x-4">
        <h1 className="text-display compact:text-[1.625rem] compact:leading-8">
          {title}
        </h1>
        {subtitle && <p className="text-caption text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
