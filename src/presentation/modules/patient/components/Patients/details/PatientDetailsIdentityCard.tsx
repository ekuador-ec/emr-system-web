import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import {
  formatBirthDate,
  formatPatientAge,
  formatPatientFullName,
  formatPatientInitials,
  formatShortDate,
  GENDER_LABELS,
} from "@/presentation/modules/patient/utils/patientFormatters";

interface PatientDetailsIdentityCardProps {
  patient: Patient;
  onEdit: () => void;
  onClose: () => void;
}

export function PatientDetailsIdentityCard({
  patient,
  onEdit,
  onClose,
}: PatientDetailsIdentityCardProps) {
  const navigate = useNavigate();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const fullName = formatPatientFullName(patient);
  const age = formatPatientAge(patient.birthDate);
  const birthDateFormatted = formatBirthDate(patient.birthDate);
  const isTemporal = patient.idNumberType === "temporal";

  return (
    <aside
      className={`patient-detail-identity ${
        isMobileExpanded ? "is-mobile-expanded" : ""
      }`}
    >
      <div className="patient-detail-identity__inner" data-gender={patient.gender}>
        <div className="patient-detail-identity__hero">
          <div className="patient-detail-identity__avatar" aria-hidden="true">
            <span className="patient-detail-identity__avatar-text">
              {formatPatientInitials(patient)}
            </span>
          </div>

          <div className="patient-detail-identity__hero-text">
            <h2 id="patient-drawer-title" className="patient-detail-identity__name">
              {fullName}
            </h2>
            <span
              className={`patient-detail-identity__status ${
                patient.isActive
                  ? "patient-detail-identity__status--active"
                  : "patient-detail-identity__status--inactive"
              }`}
            >
              <span className="patient-detail-identity__dot" aria-hidden="true" />
              {patient.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          <button
            type="button"
            className={`patient-detail-identity__toggle ${
              isMobileExpanded ? "patient-detail-identity__toggle--open" : ""
            }`}
            onClick={() => setIsMobileExpanded((v) => !v)}
            aria-expanded={isMobileExpanded}
            aria-label={isMobileExpanded ? "Ocultar detalles" : "Mostrar detalles"}
          >
            <Icon name="icon-chevron-down" size={16} />
          </button>
        </div>

        <div
          className={`patient-detail-identity__expandable ${
            isMobileExpanded ? "is-open" : ""
          }`}
        >
          <dl className="patient-detail-identity__stats">
            <div className="patient-detail-identity__stat patient-detail-identity__stat--full">
              <dt className="patient-detail-identity__stat-label">
                <Icon name="icon-id-card-solid" size={11} />
                {isTemporal ? "Identificación" : "Cédula"}
              </dt>
              <dd className="patient-detail-identity__stat-value">
                {isTemporal ? (
                  <span className="patient-detail-identity__badge patient-detail-identity__badge--warning">
                    <Icon name="icon-alert-circle" size={12} />
                    ID Temporal
                  </span>
                ) : (
                  patient.idNumber
                )}
              </dd>
            </div>

            <div className="patient-detail-identity__stat">
              <dt className="patient-detail-identity__stat-label">
                <Icon name="icon-user-solid" size={11} />
                Sexo
              </dt>
              <dd className="patient-detail-identity__stat-value">
                {GENDER_LABELS[patient.gender] || patient.gender}
              </dd>
            </div>

            <div className="patient-detail-identity__stat">
              <dt className="patient-detail-identity__stat-label">
                <Icon name="icon-droplet-solid" size={11} />
                Sangre
              </dt>
              <dd className="patient-detail-identity__stat-value">
                {patient.bloodType || (
                  <span className="patient-detail-identity__stat-value--muted">N/R</span>
                )}
              </dd>
            </div>

            <div className="patient-detail-identity__stat">
              <dt className="patient-detail-identity__stat-label">
                <Icon name="icon-calendar-solid" size={11} />
                Edad
              </dt>
              <dd className="patient-detail-identity__stat-value">
                {age || (
                  <span className="patient-detail-identity__stat-value--muted">N/R</span>
                )}
              </dd>
            </div>

            <div className="patient-detail-identity__stat">
              <dt className="patient-detail-identity__stat-label">
                <Icon name="icon-phone-solid" size={11} />
                Teléfono
              </dt>
              <dd className="patient-detail-identity__stat-value">
                {patient.phone || (
                  <span className="patient-detail-identity__stat-value--muted">N/R</span>
                )}
              </dd>
            </div>

            {birthDateFormatted ? (
              <div className="patient-detail-identity__stat patient-detail-identity__stat--full">
                <dt className="patient-detail-identity__stat-label">
                  <Icon name="icon-calendar-solid" size={11} />
                  Nacimiento
                </dt>
                <dd className="patient-detail-identity__stat-value">{birthDateFormatted}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="patient-detail-identity__actions">
          <WcButton
            variant="terciary"
            className="patient-detail-identity__btn-primary"
            onClick={() => {
              navigate(`/pacientes/${patient.id}/historia`);
              onClose();
            }}
          >
            <Icon name="icon-open-folder" size={14} />
            Ver HCI
          </WcButton>
          <WcButton
            variant="primary"
            className="patient-detail-identity__btn-secondary"
            onClick={onEdit}
          >
            <Icon name="icon-edit" size={14} />
            Editar
          </WcButton>
        </div>
      </div>

      <div className="patient-detail-identity__meta">
        <span className="patient-detail-identity__meta-label">Registro</span>
        <span className="patient-detail-identity__meta-value">
          Creado el {formatShortDate(patient.createdAt) || "N/R"}
        </span>
        {patient.updatedAt && patient.updatedAt !== patient.createdAt ? (
          <span className="patient-detail-identity__meta-value">
            Actualizado el {formatShortDate(patient.updatedAt)}
          </span>
        ) : null}
      </div>
    </aside>
  );
}
