import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/presentation/modules/auth/pages/LoginPage";
import { UpdatePasswordPage } from "@/presentation/modules/auth/pages/UpdatePasswordPage";
import { DashboardPage } from "@/presentation/modules/dashboard/pages/DashboardPage";
import { UsersManagementPage } from "@/presentation/modules/users/pages/UsersManagementPage";
import { PatientsPage } from "@/presentation/modules/patient/pages/PatientsPage";
import { MedicalRecordPage } from "@/presentation/modules/medical-record/pages/MedicalRecordPage";
import { MedicalRecordsPage } from "@/presentation/modules/medical-record/pages/MedicalRecordsPage";
import { EvolutionWorkspacePage } from "@/presentation/modules/evolution/pages/EvolutionWorkspacePage";
import { EvolutionsPage } from "@/presentation/modules/evolution/pages/EvolutionsPage";
import { ProtectedRoute } from "@/presentation/modules/auth/components/ProtectedRoute";
import { AppLayout } from "@/presentation/modules/shared/layouts/AppLayout";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/update-password",
    element: <UpdatePasswordPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/pacientes",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <PatientsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/pacientes/:patientId/historia",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <MedicalRecordPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/pacientes/:patientId/historia/evoluciones/:evolutionId",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <EvolutionWorkspacePage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/historias-clinicas",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <MedicalRecordsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/evoluciones",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <EvolutionsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AppLayout>
          <UsersManagementPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
