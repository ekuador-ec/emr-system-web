import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/presentation/pages/LoginPage'
import { UpdatePasswordPage } from '@/presentation/pages/UpdatePasswordPage'
import { DashboardPage } from '@/presentation/pages/DashboardPage'
import { UsersManagementPage } from '@/presentation/pages/UsersManagementPage'
import { ProtectedRoute } from '@/presentation/components/ProtectedRoute'
import { AppLayout } from '@/presentation/layouts/AppLayout'

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <UsersManagementPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
