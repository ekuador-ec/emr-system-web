import { useState } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { formatShortDate } from "@/presentation/modules/evolution/utils/evolutionLabels";
import type { MedicalPrescription } from "@/domain/modules/prescription/models/MedicalPrescription";
import type { MedicalRecord } from "@/domain/modules/medical-record/models/MedicalRecord";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import "./PrescriptionReadOnlyView.css";

export type PrescriptionPrintLayout = "side" | "stacked";

interface PrescriptionReadOnlyViewProps {
  prescription: MedicalPrescription;
  patient: Patient;
  medicalRecord: MedicalRecord | null | undefined;
  printLayout?: PrescriptionPrintLayout;
}

function computeAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? `${age} años` : "—";
}

function shortId(uuid: string | null | undefined): string {
  if (!uuid) return "—";
  return uuid.slice(0, 8).toUpperCase();
}

function PrescriptionHeader({
  prescription,
  patient,
  medicalRecord,
}: PrescriptionReadOnlyViewProps) {
  const env = (import.meta as ImportMeta).env;
  const companyType = (env.VITE_COMPANY_TYPE ?? "").trim();
  const companyName = (env.VITE_COMPANY_NAME ?? "").trim();
  const companyLogoUrl = (env.VITE_COMPANY_LOGO_URL ?? "").trim();
  const [logoFailed, setLogoFailed] = useState(false);
  const hasLogo = companyLogoUrl.length > 0 && !logoFailed;

  const patientName = `${patient.firstName} ${patient.lastName} ${patient.secondLastName ?? ""}`
    .trim()
    .toUpperCase();
  const hciNumber = patient.idNumber || shortId(medicalRecord?.id);
  const numberLabel = prescription.prescriptionNumber ?? "BORRADOR";
  const validityLabel = prescription.validityDate
    ? formatShortDate(prescription.validityDate)
    : "—";

  return (
    <div className="rx-header">
      <div className="rx-header__brand">
        <div className="rx-header__logo" aria-hidden="true">
          {hasLogo ? (
            <img
              src={companyLogoUrl}
              alt={companyName || "Institución"}
              onError={() => setLogoFailed(true)}
              loading="lazy"
            />
          ) : (
            <Icon name="icon-building" size={32} />
          )}
        </div>
        <div className="rx-header__institution">
          {companyName ? <span className="rx-header__company">{companyName.toUpperCase()}</span> : null}
          {companyType ? <span className="rx-header__company-type">{companyType.toUpperCase()}</span> : null}
        </div>
        <div className="rx-header__number">
          <span className="rx-header__number-label">N° Receta</span>
          <span className="rx-header__number-value">{numberLabel}</span>
          <span className="rx-header__number-validity">Vigencia: {validityLabel}</span>
        </div>
      </div>

      <div className="rx-header__grid">
        <div className="rx-header__cell">
          <span className="rx-header__label">Fecha</span>
          <span className="rx-header__value">{formatShortDate(prescription.issueDate)}</span>
        </div>
        <div className="rx-header__cell">
          <span className="rx-header__label">N° HCl</span>
          <span className="rx-header__value">{hciNumber}</span>
        </div>
        <div className="rx-header__cell">
          <span className="rx-header__label">Paciente</span>
          <span className="rx-header__value">{patientName || "—"}</span>
        </div>
        <div className="rx-header__cell">
          <span className="rx-header__label">Edad</span>
          <span className="rx-header__value">{computeAge(patient.birthDate)}</span>
        </div>
        <div className="rx-header__cell rx-header__cell--full">
          <span className="rx-header__label">CIE-10</span>
          {prescription.diagnoses.length > 0 ? (
            <ul className="rx-cie10-list">
              {prescription.diagnoses.map((diagnosis) => (
                <li key={diagnosis.cie10Code}>
                  <strong>{diagnosis.cie10Code}</strong> {diagnosis.cie10Description}
                </li>
              ))}
            </ul>
          ) : (
            <span className="rx-header__value">—</span>
          )}
        </div>
        <div className="rx-header__cell rx-header__cell--full">
          <span className="rx-header__label">Alergias</span>
          <span className="rx-header__value">{prescription.allergies?.trim() || "No refiere"}</span>
        </div>
      </div>
    </div>
  );
}

function PrescriptionSignature({ prescription }: { prescription: MedicalPrescription }) {
  return (
    <div className="rx-signature">
      <div className="rx-signature__line" />
      <span className="rx-signature__name">{prescription.createdByName ?? "—"}</span>
      {prescription.createdBySpecialty ? (
        <span className="rx-signature__detail">{prescription.createdBySpecialty}</span>
      ) : null}
      {prescription.createdByProfessionalCode ? (
        <span className="rx-signature__detail">Cód. {prescription.createdByProfessionalCode}</span>
      ) : null}
      <span className="rx-signature__hint">Firma y sello</span>
    </div>
  );
}

export function PrescriptionReadOnlyView(props: PrescriptionReadOnlyViewProps) {
  const { prescription, printLayout = "side" } = props;
  const rp = prescription.rpText?.trim();
  const indications = prescription.indicationsText?.trim();

  return (
    <div className="rx-print-root" data-print-layout={printLayout}>
      <article className="rx-sheet">
        <section className="rx-half">
          <PrescriptionHeader {...props} />
          <h2 className="rx-half__title">Prescripción Médica (Rp).</h2>
          <div className={`rx-half__body ${rp ? "" : "rx-half__body--empty"}`}>
            {rp || "Sin prescripción registrada."}
          </div>
          <PrescriptionSignature prescription={prescription} />
        </section>

        <div className="rx-divider" aria-hidden="true" />

        <section className="rx-half">
          <PrescriptionHeader {...props} />
          <h2 className="rx-half__title">Indicaciones</h2>
          <div className={`rx-half__body ${indications ? "" : "rx-half__body--empty"}`}>
            {indications || "Sin indicaciones registradas."}
          </div>
          <PrescriptionSignature prescription={prescription} />
        </section>
      </article>
    </div>
  );
}
