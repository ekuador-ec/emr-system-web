import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import '@/presentation/modules/shared/components/ui/webcomponents/wcButton';

interface MedicalRecordEvolutionsListProps {
  medicalRecordId: string;
}

export function MedicalRecordEvolutionsList({ medicalRecordId: _medicalRecordId }: MedicalRecordEvolutionsListProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md, 8px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "var(--space-4) var(--space-6)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Icon name="icon-clipboard" size={20} />
          Evoluciones Medicas
        </h3>
        <wc-button
          variant="primary"
          disabled
          title="Proximamente"
          style={{ opacity: 0.5 }}
        >
          <Icon name="icon-plus" size={16} />
          Nueva Evolucion
        </wc-button>
      </div>

      <div
        style={{
          padding: "var(--space-10) var(--space-6)",
          textAlign: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto var(--space-4)",
            borderRadius: "50%",
            backgroundColor: "var(--color-bg)",
            border: "2px dashed var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="icon-clipboard" size={24} />
        </div>
        <p style={{ margin: 0, marginBottom: "var(--space-1)", fontWeight: 500, color: "var(--color-text)" }}>
          Sin evoluciones registradas
        </p>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          Las evoluciones medicas de este paciente se mostraran aqui.
        </p>
      </div>
    </div>
  );
}
