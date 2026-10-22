import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PlaceholderPage title="Login" />} />
        <Route
          path="/dashboard"
          element={<PlaceholderPage title="Dashboard" />}
        />
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
        <Route
          path="*"
          element={<PlaceholderPage title="Página no encontrada" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
