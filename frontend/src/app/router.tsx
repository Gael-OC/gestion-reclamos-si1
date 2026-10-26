import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { IndicadoresPage } from '@/pages/IndicadoresPage'
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
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/reclamos"
              element={<PlaceholderPage title="Listado de reclamos" />}
            />
            <Route
              path="/reclamos/nuevo"
              element={<PlaceholderPage title="Registro de reclamo" />}
            />
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
