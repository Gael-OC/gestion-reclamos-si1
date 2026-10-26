import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { IndicadoresPage } from '@/pages/IndicadoresPage'
import { ReclamosPage } from '@/pages/ReclamosPage'
import { NuevoReclamoPage } from '@/pages/NuevoReclamoPage'
import { ReclamosDemoProvider } from '@/features/reclamos/demo/ReclamosDemoProvider'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/login"
            element={<PlaceholderPage title="Login" fullScreen />}
          />
          <Route
            element={
              <ReclamosDemoProvider>
                <AppLayout />
              </ReclamosDemoProvider>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reclamos" element={<ReclamosPage />} />
            <Route path="/reclamos/nuevo" element={<NuevoReclamoPage />} />
            <Route
              path="/reclamos/:reclamoId"
              element={<PlaceholderPage title="Detalle de reclamo" />}
            />
            <Route
              path="/asignaciones"
              element={<PlaceholderPage title="Asignaciones" />}
            />
            <Route path="/indicadores" element={<IndicadoresPage />} />
            <Route
              path="/configuracion"
              element={<PlaceholderPage title="Configuración" />}
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
