import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Glass } from '@/components/ui/Glass'

const campo =
  'flex h-11 items-center rounded-full border-[1.5px] border-dashed border-ink-muted/40 px-4 text-caption text-ink-muted'

/**
 * Espacio reservado: el login lo diseña la otra integrante de frontend.
 * Mientras tanto, muestra a dónde lleva cada perfil después de ingresar.
 */
export function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 py-12">
      <Glass className="flex w-full max-w-md flex-col gap-4 rounded-xl p-8">
        <span className="self-start rounded-full bg-brand-mist px-3 py-1 text-caption font-semibold text-brand">
          Espacio reservado
        </span>
        <div>
          <h1 className="text-display">Inicio de sesión</h1>
          <p className="mt-1 text-caption text-ink-muted">
            Pantalla a cargo de la otra integrante de frontend.
          </p>
        </div>
        <div aria-hidden className="flex flex-col gap-3">
          <span className={campo}>Correo</span>
          <span className={campo}>Contraseña</span>
        </div>
        <div className="flex flex-col gap-2 border-t border-glass-shade pt-4">
          <p className="text-caption text-ink-muted">
            Entrar a la demo según el perfil:
          </p>
          <Link
            to="/supervisor"
            className="flex h-12 items-center justify-between rounded-full bg-ink px-5 font-medium text-on-ink shadow-ink hover:bg-ink-soft"
          >
            Supervisor o administrador
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            to="/funcionario"
            className="glass-strong flex h-12 items-center justify-between rounded-full px-5 font-medium"
          >
            Funcionario
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            to="/portal"
            className="flex h-12 items-center justify-between rounded-full border-[1.5px] border-dashed border-ink-muted/40 px-5 text-ink-muted"
          >
            Consumidor <span className="text-caption">Portal</span>
          </Link>
        </div>
        <p className="text-center text-caption text-ink-muted">
          Prototipo académico ficticio — UCN 2026. Sin relación institucional
          con SERNAC.
        </p>
      </Glass>
    </div>
  )
}
