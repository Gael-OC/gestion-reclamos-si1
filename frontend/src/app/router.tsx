import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppShell } from '@/components/layout/AppShell'
import { ReclamosPage } from '@/pages/ReclamosPage'
import { NuevoReclamoPage } from '@/pages/NuevoReclamoPage'
import { LoginPage } from '@/pages/LoginPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { ReclamosDemoProvider } from '@/features/reclamos/demo/ReclamosDemoProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { InicioPorSesion, RequireRole } from '@/features/auth/RequireRole'
import { ClienteLayout } from '@/features/cliente/ClienteLayout'
import { RegistroClientePage } from '@/pages/RegistroClientePage'
import { RecuperarAccesoPage } from '@/pages/RecuperarAccesoPage'
import { ClienteInicioPage } from '@/pages/ClienteInicioPage'
import { ClienteReclamosPage } from '@/pages/ClienteReclamosPage'
import { ClienteNuevoReclamoPage } from '@/pages/ClienteNuevoReclamoPage'
import { ClienteDetallePage } from '@/pages/ClienteDetallePage'
import { ClienteCuentaPage } from '@/pages/ClienteCuentaPage'

const InicioPage = lazy(() =>
  import('@/pages/supervisor/InicioPage').then((m) => ({
    default: m.InicioPage,
  })),
)
const BandejaPage = lazy(() =>
  import('@/pages/supervisor/BandejaPage').then((m) => ({
    default: m.BandejaPage,
  })),
)
const EquipoPage = lazy(() =>
  import('@/pages/supervisor/EquipoPage').then((m) => ({
    default: m.EquipoPage,
  })),
)
const ReclamoDetallePage = lazy(() =>
  import('@/pages/supervisor/ReclamoDetallePage').then((m) => ({
    default: m.ReclamoDetallePage,
  })),
)
const IndicadoresPage = lazy(() =>
  import('@/pages/supervisor/IndicadoresPage').then((m) => ({
    default: m.IndicadoresPage,
  })),
)
const UsuariosPage = lazy(() =>
  import('@/pages/supervisor/UsuariosPage').then((m) => ({
    default: m.UsuariosPage,
  })),
)
const ConfiguracionPage = lazy(() =>
  import('@/pages/supervisor/ConfiguracionPage').then((m) => ({
    default: m.ConfiguracionPage,
  })),
)
const MisCasosPage = lazy(() =>
  import('@/pages/funcionario/MisCasosPage').then((m) => ({
    default: m.MisCasosPage,
  })),
)
const CasoPage = lazy(() =>
  import('@/pages/funcionario/CasoPage').then((m) => ({ default: m.CasoPage })),
)
const CerradosPage = lazy(() =>
  import('@/pages/funcionario/CerradosPage').then((m) => ({
    default: m.CerradosPage,
  })),
)

function PortalAnterior() {
  const { pathname, search, hash } = useLocation()
  return (
    <Navigate
      to={`${pathname.replace(/^\/cliente(?=\/|$)/, '/portal')}${search}${hash}`}
      replace
    />
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReclamosDemoProvider>
          <Suspense
            fallback={
              <div
                role="status"
                className="grid min-h-dvh place-items-center text-body text-ink-muted"
              >
                Cargando vista…
              </div>
            }
          >
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<InicioPorSesion />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroClientePage />} />
                <Route
                  path="/recuperar-acceso"
                  element={<RecuperarAccesoPage />}
                />
                <Route element={<RequireRole roles={['cliente']} />}>
                  <Route path="/portal" element={<ClienteLayout />}>
                    <Route index element={<ClienteInicioPage />} />
                    <Route path="reclamos" element={<ClienteReclamosPage />} />
                    <Route
                      path="reclamos/nuevo"
                      element={<ClienteNuevoReclamoPage />}
                    />
                    <Route
                      path="reclamos/:reclamoId"
                      element={<ClienteDetallePage />}
                    />
                    <Route path="perfil" element={<ClienteCuentaPage />} />
                    <Route
                      path="*"
                      element={<PlaceholderPage title="Página no encontrada" />}
                    />
                  </Route>
                  <Route path="/cliente/*" element={<PortalAnterior />} />
                </Route>
                <Route
                  element={
                    <RequireRole roles={['supervisor', 'funcionario']} />
                  }
                >
                  <Route element={<AppLayout />}>
                    <Route element={<RequireRole roles={['supervisor']} />}>
                      <Route path="/supervisor" element={<InicioPage />} />
                      <Route
                        path="/supervisor/bandeja"
                        element={<BandejaPage />}
                      />
                      <Route
                        path="/supervisor/equipo"
                        element={<EquipoPage />}
                      />
                      <Route
                        path="/supervisor/indicadores"
                        element={<IndicadoresPage />}
                      />
                      <Route
                        path="/supervisor/usuarios"
                        element={<UsuariosPage />}
                      />
                      <Route
                        path="/supervisor/configuracion"
                        element={<ConfiguracionPage />}
                      />
                    </Route>
                    <Route element={<RequireRole roles={['funcionario']} />}>
                      <Route path="/funcionario" element={<MisCasosPage />} />
                      <Route
                        path="/funcionario/casos/:reclamoId"
                        element={<CasoPage />}
                      />
                      <Route
                        path="/funcionario/cerrados"
                        element={<CerradosPage />}
                      />
                    </Route>

                    <Route path="/reclamos" element={<ReclamosPage />} />
                    <Route element={<RequireRole roles={['supervisor']} />}>
                      <Route
                        path="/reclamos/nuevo"
                        element={<NuevoReclamoPage />}
                      />
                      <Route
                        path="/reclamos/:reclamoId"
                        element={<ReclamoDetallePage />}
                      />
                      <Route
                        path="/dashboard"
                        element={<Navigate to="/supervisor" replace />}
                      />
                      <Route
                        path="/indicadores"
                        element={
                          <Navigate to="/supervisor/indicadores" replace />
                        }
                      />
                      <Route
                        path="/asignaciones"
                        element={<Navigate to="/supervisor/equipo" replace />}
                      />
                      <Route
                        path="/configuracion"
                        element={
                          <Navigate to="/supervisor/configuracion" replace />
                        }
                      />
                    </Route>
                  </Route>
                </Route>
                <Route path="*" element={<InicioPorSesion />} />
              </Route>
            </Routes>
          </Suspense>
        </ReclamosDemoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
