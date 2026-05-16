import { usePresenceTracker } from "@/presentation/modules/users/hooks/usePresenceTracker";
import { useUserStore } from "@/presentation/modules/users/stores/useUserStore";
import { useAdminUsers } from "@/presentation/modules/users/hooks/useAdminUsers";
import { InviteUserModal } from "@/presentation/modules/users/components/InviteUserModal";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/presentation/modules/shared/components/Toaster";
import { Sidebar } from "@/presentation/modules/shared/components/Sidebar";
import { ActiveUsersFloat } from "@/presentation/modules/users/components/ActiveUsersFloat";
import { FloatingProfileHub } from "@/presentation/modules/shared/components/FloatingProfileHub";
import {
  FloatingQuickActions,
  type QuickActionsModule,
} from "@/presentation/modules/shared/components/FloatingQuickActions";
import { useNotificationSubscription } from "@/presentation/modules/notifications/hooks/useNotificationSubscription";
import { usePatientSubscription } from "@/presentation/modules/patient/hooks/usePatientSubscription";
import { useEvolutionSubscription } from "@/presentation/modules/evolution/hooks/useEvolutionSubscription";
import { useEvolutionUIStore } from "@/presentation/modules/evolution/stores/useEvolutionUIStore";
import { EvolutionReadOnlyModal } from "@/presentation/modules/evolution/components/read-only/EvolutionReadOnlyModal";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { PatientCreateModal } from "@/presentation/modules/patient/components/Patients/PatientCreateModal";
import { PatientQuickSearchModal } from "@/presentation/modules/patient/components/Patients/PatientQuickSearchModal";
import "./AppLayout.css";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { setInviteModalOpen, isInviteModalOpen } = useUserStore();
  const { loadUsers, inviteUser, isInviting, isActivated: isUsersLoaded } = useAdminUsers();

  const {
    isCreateModalOpen,
    setCreateModalOpen,
    editingPatientId,
    setEditingPatientId,
    isQuickSearchModalOpen,
    setQuickSearchModalOpen,
    onCreateSuccess,
    setCreateSuccessHandler,
  } = usePatientStore();

  const { readOnlyTarget, closeReadOnlyEvolution } = useEvolutionUIStore();

  usePresenceTracker(user?.id);
  useNotificationSubscription(user?.id);
  usePatientSubscription();
  useEvolutionSubscription();

  const quickActionsModules: QuickActionsModule[] = [
    {
      module: "Pacientes",
      icon: "icon-patient",
      actions: [
        {
          label: "Buscar paciente",
          icon: "icon-search-solid",
          onClick: () => setQuickSearchModalOpen(true),
        },
        {
          label: "Registrar nuevo",
          icon: "icon-user-plus",
          onClick: () => {
            setCreateSuccessHandler(null);
            setCreateModalOpen(true);
          },
        },
      ],
    },
    {
      module: "Usuarios",
      icon: "icon-users",
      actions: [
        {
          label: "Cargar usuarios",
          icon: "icon-hospital-user",
          onClick: () => {
            loadUsers();
            navigate("/admin/users");
          },
        },
        {
          label: "Invitar usuario",
          icon: "icon-user-plus",
          onClick: () => {
            setInviteModalOpen(true);
          },
        },
      ],
    },
    {
      module: "Historias clínicas",
      icon: "icon-clinical-history",
      actions: [],
      disabled: true,
    },
    {
      module: "Evoluciones médicas",
      icon: "icon-medical-evolution",
      actions: [],
      disabled: true,
    },
  ];

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main-column">
        <main className="app-main-content">{children}</main>
      </div>

      <FloatingProfileHub />
      <FloatingQuickActions modules={quickActionsModules} />
      <ActiveUsersFloat />
      <Toaster />

      {isCreateModalOpen && (
        <PatientCreateModal
          patientId={editingPatientId}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingPatientId(null);
            setCreateSuccessHandler(null);
          }}
          onCreated={onCreateSuccess ?? undefined}
        />
      )}

      <PatientQuickSearchModal
        isOpen={isQuickSearchModalOpen}
        onClose={() => setQuickSearchModalOpen(false)}
      />

      <EvolutionReadOnlyModal
        isOpen={readOnlyTarget !== null}
        patientId={readOnlyTarget?.patientId ?? null}
        evolutionId={readOnlyTarget?.evolutionId ?? null}
        onClose={closeReadOnlyEvolution}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={async (payload) => {
          await inviteUser(payload);
          if (!isUsersLoaded) loadUsers();
        }}
        isInviting={isInviting}
      />
    </div>
  );
}
