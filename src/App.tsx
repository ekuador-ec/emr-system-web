import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/presentation/modules/auth/pages/LoginPage";
import { UpdatePasswordPage } from "@/presentation/modules/auth/pages/UpdatePasswordPage";
import { DashboardPage } from "@/presentation/modules/dashboard/pages/DashboardPage";
import { UsersManagementPage } from "@/presentation/modules/users/pages/UsersManagementPage";
import { PatientsPage } from "@/presentation/modules/patient/pages/PatientsPage";
import { MedicalRecordPage } from "@/presentation/modules/medical-record/pages/MedicalRecordPage";
import { MedicalRecordsPage } from "@/presentation/modules/medical-record/pages/MedicalRecordsPage";
import { EvolutionWorkspacePage } from "@/presentation/modules/evolution/pages/EvolutionWorkspacePage";
import { Form005WorkspacePage } from "@/presentation/modules/form005/pages/Form005WorkspacePage";
import { DocumentsPage } from "@/presentation/modules/document/pages/DocumentsPage";
import { MessagesPage } from "@/presentation/modules/messaging/pages/MessagesPage";
import { AiAssistantPage } from "@/presentation/modules/ai/pages/AiAssistantPage";
import { ProtectedRoute } from "@/presentation/modules/auth/components/ProtectedRoute";
import { AppLayout } from "@/presentation/modules/shared/layouts/AppLayout";

const ReportsPage = lazy(() =>
  import("@/presentation/modules/reports/pages/ReportsPage").then((module) => ({
    default: module.ReportsPage,
  })),
);

function ReportsPageFallback() {
  return (
    <div
      style={{
        padding: "var(--space-8)",
        maxWidth: "1280px",
        margin: "0 auto",
        color: "var(--color-text-secondary)",
      }}
    >
      Cargando reportes...
    </div>
  );
}

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
    path: "/pacientes/:patientId/historia/documentos/form005/:documentId",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Form005WorkspacePage />
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
    path: "/documentos",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <DocumentsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/evoluciones",
    element: <Navigate to="/documentos" replace />,
  },
  {
    path: "/mensajes",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <MessagesPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reportes",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Suspense fallback={<ReportsPageFallback />}>
            <ReportsPage />
          </Suspense>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/asistente-ia",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <AiAssistantPage />
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
