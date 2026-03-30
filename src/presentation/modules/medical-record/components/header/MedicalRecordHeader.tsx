import { useNavigate } from 'react-router-dom';
import { useOrganizationConfig } from '@/presentation/modules/medical-record/hooks/useOrganizationConfig';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import '@/presentation/modules/shared/components/ui/webcomponents/wcButton';

export function MedicalRecordHeader() {
  const navigate = useNavigate();
  const { data: config, isLoading } = useOrganizationConfig();

  if (isLoading) {
    return (
      <div
        style={{
          height: "96px",
          width: "100%",
          backgroundColor: "var(--color-bg)",
          borderRadius: "var(--radius-md, 8px)",
          marginBottom: "var(--space-6)",
        }}
      />
    );
  }

  if (!config) return null;

  return (
    <header
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-5) var(--space-6)",
        marginBottom: "var(--space-6)",
        borderRadius: "var(--radius-md, 8px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)" }}>
          <wc-button
            variant="terciary"
            onClick={() => navigate(-1 as any)}
            title="Volver"
          >
            <Icon name="icon-arrow-left" size={18} />
            Volver
          </wc-button>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, color: "var(--color-text)" }}>
              {config.institutionName}
            </h2>
            <p style={{ margin: 0, marginTop: "2px", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              {config.operationalUnit}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, auto)",
            gap: "var(--space-4)",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-bg)",
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-md, 8px)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <span style={{ display: "block", fontWeight: 600, marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
              Cod. UO
            </span>
            <span style={{ fontFamily: "monospace", color: "var(--color-text)" }}>{config.operationalUnitCode}</span>
          </div>
          <div>
            <span style={{ display: "block", fontWeight: 600, marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
              Prov.
            </span>
            <span style={{ fontFamily: "monospace", color: "var(--color-text)" }}>{config.provinceCode}</span>
          </div>
          <div>
            <span style={{ display: "block", fontWeight: 600, marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
              Canton
            </span>
            <span style={{ fontFamily: "monospace", color: "var(--color-text)" }}>{config.cantonCode}</span>
          </div>
          <div>
            <span style={{ display: "block", fontWeight: 600, marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem" }}>
              Parroquia
            </span>
            <span style={{ fontFamily: "monospace", color: "var(--color-text)" }}>{config.parishCode}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
