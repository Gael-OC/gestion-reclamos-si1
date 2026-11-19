import { ArrowUpRight } from 'lucide-react'

export function InformacionSernac() {
  return (
    <div>
      <h2 className="text-[1.375rem] leading-7 font-medium tracking-tight">
        Sobre SERNAC
      </h2>
      <p className="mt-3 text-body leading-relaxed text-ink-muted">
        El Servicio Nacional del Consumidor (SERNAC) informa, educa y protege a
        las personas consumidoras en Chile.
      </p>
      <p className="mt-3 text-body leading-relaxed text-ink-muted">
        También fiscaliza a las empresas y orienta frente a problemas de
        consumo.
      </p>
      <a
        href="https://www.sernac.cl/portal/617/w3-article-21620.html"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-label font-medium text-brand underline-offset-4 hover:underline"
      >
        Conocer más en sernac.cl
        <ArrowUpRight size={16} aria-hidden />
      </a>
    </div>
  )
}
