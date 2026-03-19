import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/presentation/modules/auth/pages/LoginPage'
import { UpdatePasswordPage } from '@/presentation/modules/auth/pages/UpdatePasswordPage'
import { DashboardPage } from '@/presentation/modules/dashboard/pages/DashboardPage'
import { UsersManagementPage } from '@/presentation/modules/users/pages/UsersManagementPage'
import { PatientsPage } from '@/presentation/modules/patient/pages/PatientsPage'
import { ProtectedRoute } from '@/presentation/modules/auth/components/ProtectedRoute'
import { AppLayout } from '@/presentation/modules/shared/layouts/AppLayout'

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

      <Route
        path="/pacientes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PatientsPage />
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
