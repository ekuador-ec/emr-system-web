import { useState } from "react";
import { useMedicalRecordStore } from "@/presentation/modules/medical-record/stores/useMedicalRecordStore";
import { useMedicalRecords } from "@/presentation/modules/medical-record/hooks/useMedicalRecord";
import { MedicalRecordsList } from "@/presentation/modules/medical-record/components/list/MedicalRecordsList";
import { MedicalRecordsSearchFilters } from "@/presentation/modules/medical-record/components/list/MedicalRecordsSearchFilters";
import { OrganizationConfigModal } from "@/presentation/modules/medical-record/components/list/OrganizationConfigModal";
import { MedicalRecordDetailsModal } from "@/presentation/modules/medical-record/components/list/MedicalRecordDetailsModal";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { canChangeMedicalRecordStatus } from "@/presentation/core/security/medicalRecordPermissions";
import type { MedicalRecordListItem } from "@/domain/modules/medical-record/models/MedicalRecord";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import "@/presentation/modules/shared/components/ui/webcomponents/wcButton";

export function MedicalRecordsPage() {
  const { filters } = useMedicalRecordStore();
  const { data: records, isLoading, isError, error } = useMedicalRecords(filters);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordListItem | null>(null);
  const { user } = useAuth();
  
  const canAdmin = canChangeMedicalRecordStatus(user?.role);

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "var(--space-1)" }}>Historias Clinicas</h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Consulta y administra las historias clinicas del sistema.
          </p>
        </div>
        {canAdmin && (
          <wc-button
            variant="terciary"
            onClick={() => setIsConfigOpen(true)}
          >
            <Icon name="icon-settings" size={20} />
            Configurar Encabezado
          </wc-button>
        )}
      </div>

      <MedicalRecordsSearchFilters />

      <div style={{ marginTop: "var(--space-6)" }}>
        {isLoading ? (
          <div className="card" style={{ padding: "var(--space-8)", textAlign: "center" }}>
            Cargando historias clinicas...
          </div>
        ) : isError ? (
          <div className="card" style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}>
            Error al cargar historias: {error.message}
          </div>
        ) : (
          <MedicalRecordsList 
            result={records} 
            onSelectRecord={(record) => setSelectedRecord(record)}
          />
        )}
      </div>

      <OrganizationConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

      <MedicalRecordDetailsModal
        record={selectedRecord}
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
      />
      
      <PatientDetailsDrawer />
    </div>
  );
}
