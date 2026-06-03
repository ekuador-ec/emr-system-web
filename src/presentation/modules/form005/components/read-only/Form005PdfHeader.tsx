import { useState } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import type { Form005Document } from "@/domain/modules/form005/models/Form005Document";
import type { MedicalRecord } from "@/domain/modules/medical-record/models/MedicalRecord";
import type { OrganizationConfig } from "@/domain/modules/medical-record/models/OrganizationConfig";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import {
  EVOLUTION_STATUS_LABELS,
  formatLongDateTime,
} from "@/presentation/modules/evolution/utils/evolutionLabels";

interface Form005PdfHeaderProps {
  document005: Form005Document;
  patient: Patient;
  medicalRecord: MedicalRecord;
  orgConfig: OrganizationConfig | null | undefined;
}

function shortRecordNumber(uuid: string | undefined | null): string {
  if (!uuid) return "—";
  return uuid.slice(0, 8).toUpperCase();
}

function toUpperOrFallback(value: string | null | undefined, fallback = "—"): string {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed.toUpperCase() : fallback;
}

export function Form005PdfHeader({
  document005,
  patient,
  medicalRecord,
  orgConfig,
}: Form005PdfHeaderProps) {
  const env = (import.meta as ImportMeta).env;
  const companyType = (env.VITE_COMPANY_TYPE ?? "").trim();
  const companyName = (env.VITE_COMPANY_NAME ?? "").trim();
  const companyLogoUrl = (env.VITE_COMPANY_LOGO_URL ?? "").trim();
  const [logoFailed, setLogoFailed] = useState(false);

  const institutionHeading = [companyType, companyName]
    .filter((part) => part.length > 0)
    .join(" ")
    .toUpperCase();

  const institutionSystem = toUpperOrFallback(orgConfig?.institutionName);
  const operationalUnit = toUpperOrFallback(orgConfig?.operationalUnit);
  const operationalUnitCode = (orgConfig?.operationalUnitCode ?? "").trim() || "—";
  const provinceCode = (orgConfig?.provinceCode ?? "").trim() || "—";
  const cantonCode = (orgConfig?.cantonCode ?? "").trim() || "—";
  const parishCode = (orgConfig?.parishCode ?? "").trim() || "—";
  const hciNumber = patient.idNumber || shortRecordNumber(medicalRecord.id);
  const documentNumber = shortRecordNumber(document005.id);

  const hasLogo = companyLogoUrl.length > 0 && !logoFailed;

  return (
    <header className="em-pdf-header">
      <div className="em-pdf-header__top">
        <div className="em-pdf-header__logo" aria-hidden="true">
          {hasLogo ? (
            <img
              src={companyLogoUrl}
              alt={institutionHeading || "Institución"}
              className="em-pdf-header__logo-img"
              onError={() => setLogoFailed(true)}
              loading="lazy"
            />
          ) : (
            <Icon name="icon-building" size={36} />
          )}
        </div>
        <div className="em-pdf-header__identity">
          {institutionHeading ? (
            <span className="em-pdf-header__institution-name">{institutionHeading}</span>
          ) : (
            <span className="em-pdf-header__institution-name em-pdf-header__institution-name--missing">
              CONFIGURAR INSTITUCIÓN
            </span>
          )}
          <span className="em-pdf-header__form-id">
            Formulario HCU-form-005 · Evolución y Prescripciones
          </span>
        </div>
        <div className="em-pdf-header__doc-info">
          <span>
            <strong>N° Documento</strong> · {documentNumber}
          </span>
          <span>
            Estado: <strong>{EVOLUTION_STATUS_LABELS[document005.status]}</strong>
          </span>
          <span>Generado: {formatLongDateTime(new Date().toISOString())}</span>
        </div>
      </div>

      <div
        className="em-pdf-header__hci"
        style={{
          gridTemplateColumns:
            "minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.6fr) minmax(0, 0.6fr) minmax(0, 0.6fr) minmax(0, 1.2fr)",
        }}
      >
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Institución del Sistema</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--upper">
            {institutionSystem}
          </span>
        </div>
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Unidad Operativa</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--upper">
            {operationalUnit}
          </span>
        </div>
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Cod. UO</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--mono">
            {operationalUnitCode}
          </span>
        </div>
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Cod. Provincia</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--mono">
            {provinceCode}
          </span>
        </div>
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Cod. Cantón</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--mono">
            {cantonCode}
          </span>
        </div>
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Cod. Parroquia</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--mono">
            {parishCode}
          </span>
        </div>
        <div className="em-pdf-header__hci-cell em-pdf-header__hci-cell--featured">
          <span className="em-pdf-header__hci-label">N° Historia Clínica</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--hci">
            {hciNumber}
          </span>
        </div>
      </div>

      <div
        className="em-pdf-header__hci"
        style={{
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 1fr)",
          marginTop: "var(--space-2)",
        }}
      >
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Paciente</span>
          <span className="em-pdf-header__hci-value em-pdf-header__hci-value--upper">
            {`${patient.firstName} ${patient.lastName} ${patient.secondLastName ?? ""}`
              .trim()
              .toUpperCase()}
          </span>
        </div>
        <div className="em-pdf-header__hci-cell">
          <span className="em-pdf-header__hci-label">Sexo</span>
          <span className="em-pdf-header__hci-value">
            {patient.gender === "FEMENINO" ? "F" : patient.gender === "MASCULINO" ? "M" : "—"}
          </span>
        </div>
      </div>
    </header>
  );
}
