import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppShell } from '@/components/layout/AppShell'
import { ReclamosPage } from '@/pages/ReclamosPage'
import { NuevoReclamoPage } from '@/pages/NuevoReclamoPage'
import { LoginPage } from '@/pages/LoginPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { InicioPage } from '@/pages/supervisor/InicioPage'
import { BandejaPage } from '@/pages/supervisor/BandejaPage'
import { EquipoPage } from '@/pages/supervisor/EquipoPage'
import { ReclamoDetallePage } from '@/pages/supervisor/ReclamoDetallePage'
import { IndicadoresPage } from '@/pages/supervisor/IndicadoresPage'
import { UsuariosPage } from '@/pages/supervisor/UsuariosPage'
import { ConfiguracionPage } from '@/pages/supervisor/ConfiguracionPage'
import { MisCasosPage } from '@/pages/funcionario/MisCasosPage'
import { CasoPage } from '@/pages/funcionario/CasoPage'
import { CerradosPage } from '@/pages/funcionario/CerradosPage'
import { ReclamosDemoProvider } from '@/features/reclamos/demo/ReclamosDemoProvider'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/portal"
            element={
              <PlaceholderPage title="Portal del consumidor" fullScreen />
            }
          />
          <Route
            element={
              <ReclamosDemoProvider>
                <AppLayout />
              </ReclamosDemoProvider>
            }
          >
            <Route path="/supervisor" element={<InicioPage />} />
            <Route path="/supervisor/bandeja" element={<BandejaPage />} />
            <Route path="/supervisor/equipo" element={<EquipoPage />} />
            <Route
              path="/supervisor/indicadores"
              element={<IndicadoresPage />}
            />
            <Route path="/supervisor/usuarios" element={<UsuariosPage />} />
            <Route
              path="/supervisor/configuracion"
              element={<ConfiguracionPage />}
            />
            <Route path="/funcionario" element={<MisCasosPage />} />
            <Route
              path="/funcionario/casos/:reclamoId"
              element={<CasoPage />}
            />
            <Route path="/funcionario/cerrados" element={<CerradosPage />} />

            <Route path="/reclamos" element={<ReclamosPage />} />
            <Route path="/reclamos/nuevo" element={<NuevoReclamoPage />} />
            <Route
              path="/reclamos/:reclamoId"
              element={<ReclamoDetallePage />}
            />

            {/* Rutas anteriores a la separación por perfil */}
            <Route
              path="/dashboard"
              element={<Navigate to="/supervisor" replace />}
            />
            <Route
              path="/indicadores"
              element={<Navigate to="/supervisor/indicadores" replace />}
            />
            <Route
              path="/asignaciones"
              element={<Navigate to="/supervisor/equipo" replace />}
            />
            <Route
              path="/configuracion"
              element={<Navigate to="/supervisor/configuracion" replace />}
            />
            <Route
              path="*"
              element={<PlaceholderPage title="Página no encontrada" />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
