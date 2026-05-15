import { useEffect, useMemo, useRef, useState } from "react";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import { WcFormStepSection } from "@/presentation/modules/shared/components/ui/webcomponents/Sections/WcFormStepSection";
import type { AntecedentTypeEnum } from "@/domain/modules/catalog/models/Catalog";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import { PatientDetailsField } from "./details/PatientDetailsField";
import { PatientDetailsGrid } from "./details/PatientDetailsGrid";
import { PatientDetailsIdentityCard } from "./details/PatientDetailsIdentityCard";
import { PatientClinicalAntecedentReadCard } from "./details/PatientClinicalAntecedentReadCard";
import { PatientEmergencyContactReadCard } from "./details/PatientEmergencyContactReadCard";
import { PatientAntecedentTypeFilterChips } from "./details/PatientAntecedentTypeFilterChips";
import {
  CULTURAL_GROUP_LABELS,
  EDUCATION_LEVEL_LABELS,
  formatBirthDate,
  formatPatientAge,
  GENDER_LABELS,
  HEALTH_INSURANCE_LABELS,
  INFORMATION_SOURCE_LABELS,
  MARITAL_STATUS_LABELS,
} from "@/presentation/modules/patient/utils/patientFormatters";
import "./PatientDetailsDrawer.css";

const TABS: Array<{ id: number; title: string; icon: string }> = [
  { id: 0, title: "Antecedentes", icon: "icon-medical-history" },
  { id: 1, title: "Básica", icon: "icon-card-info" },
  { id: 2, title: "Demografía", icon: "icon-demography" },
  { id: 3, title: "Ubicación", icon: "icon-map-pin" },
  { id: 4, title: "Laboral", icon: "icon-briefcase" },
  { id: 5, title: "Contactos", icon: "icon-phone" },
  { id: 6, title: "Fuente Info", icon: "icon-user-voice" },
];

export function PatientDetailsDrawer() {
  const { selectedPatientId, setSelectedPatientId, setEditingPatientId } =
    usePatientStore();
  const { data: patient, isLoading, isError } = usePatient(selectedPatientId || "");
  const drawerRef = useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [antecedentTypeFilter, setAntecedentTypeFilter] =
    useState<AntecedentTypeEnum | null>(null);
  const [showInactiveAntecedents, setShowInactiveAntecedents] = useState(false);

  useEffect(() => {
    if (!selectedPatientId) return;
    setCurrentTab(0);
    setAntecedentTypeFilter(null);
    setShowInactiveAntecedents(false);
  }, [selectedPatientId]);

  useEffect(() => {
    if (!selectedPatientId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPatientId(null);
        return;
      }
      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    if (drawerRef.current) drawerRef.current.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPatientId, setSelectedPatientId]);

  if (!selectedPatientId) return null;

  const handleEdit = () => {
    if (!patient) return;
    setEditingPatientId(patient.id);
    setSelectedPatientId(null);
  };

  return (
    <div
      className="patient-drawer__overlay"
      onClick={() => setSelectedPatientId(null)}
      role="dialog"
      aria-label="Detalle del paciente"
      aria-labelledby="patient-drawer-title"
      aria-busy={isLoading}
    >
      <div
        className="patient-drawer__panel"
        onClick={(e) => e.stopPropagation()}
        ref={drawerRef}
        tabIndex={-1}
      >
        <div className="patient-drawer__close-bar">
          <WcButtonIcon
            variant="ghost"
            shape="circle"
            size="sm"
            icon="icon-x-solid"
            onClick={() => setSelectedPatientId(null)}
            aria-label="Cerrar detalle del paciente"
          />
        </div>

        {isLoading ? (
          <DrawerLoading />
        ) : isError || !patient ? (
          <DrawerError />
        ) : (
          <div className="patient-drawer__layout">
            <PatientDetailsIdentityCard
              patient={patient}
              onEdit={handleEdit}
              onClose={() => setSelectedPatientId(null)}
            />

            <div className="patient-drawer__content">
              <DrawerTabs
                patient={patient}
                currentTab={currentTab}
                onChangeTab={setCurrentTab}
                antecedentTypeFilter={antecedentTypeFilter}
                onChangeAntecedentTypeFilter={setAntecedentTypeFilter}
                showInactiveAntecedents={showInactiveAntecedents}
                onToggleInactiveAntecedents={() =>
                  setShowInactiveAntecedents((v) => !v)
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DrawerLoading() {
  return (
    <div className="patient-drawer__loading">
      <div className="patient-drawer__skeleton patient-drawer__skeleton--avatar" />
      <div className="patient-drawer__skeleton patient-drawer__skeleton--title" />
      <div className="patient-drawer__skeleton patient-drawer__skeleton--subtitle" />
      <div className="patient-drawer__skeleton patient-drawer__skeleton--card" />
      <div className="patient-drawer__skeleton patient-drawer__skeleton--card" />
    </div>
  );
}

function DrawerError() {
  return (
    <div className="patient-drawer__error">
      <Icon name="icon-warning-solid" size={24} className="patient-drawer__error-icon" />
      <p className="patient-drawer__error-msg">
        Error al cargar la información del paciente.
      </p>
    </div>
  );
}

interface DrawerTabsProps {
  patient: Patient;
  currentTab: number;
  onChangeTab: (index: number) => void;
  antecedentTypeFilter: AntecedentTypeEnum | null;
  onChangeAntecedentTypeFilter: (type: AntecedentTypeEnum | null) => void;
  showInactiveAntecedents: boolean;
  onToggleInactiveAntecedents: () => void;
}

function DrawerTabs({
  patient,
  currentTab,
  onChangeTab,
  antecedentTypeFilter,
  onChangeAntecedentTypeFilter,
  showInactiveAntecedents,
  onToggleInactiveAntecedents,
}: DrawerTabsProps) {
  const tabsData = useMemo(() => {
    return TABS.map((tab) => ({
      name: tab.title,
      icon: <Icon name={tab.icon} size={16} />,
      content: renderTabContent(tab.id, patient, {
        antecedentTypeFilter,
        onChangeAntecedentTypeFilter,
        showInactiveAntecedents,
        onToggleInactiveAntecedents,
      }),
    }));
  }, [
    patient,
    antecedentTypeFilter,
    onChangeAntecedentTypeFilter,
    showInactiveAntecedents,
    onToggleInactiveAntecedents,
  ]);

  return (
    <div className="patient-drawer__tabs">
      <WcTabsFolder
        tabs={tabsData}
        activeIndex={currentTab}
        onChange={onChangeTab}
      />
    </div>
  );
}

interface RenderTabContentOptions {
  antecedentTypeFilter: AntecedentTypeEnum | null;
  onChangeAntecedentTypeFilter: (type: AntecedentTypeEnum | null) => void;
  showInactiveAntecedents: boolean;
  onToggleInactiveAntecedents: () => void;
}

function renderTabContent(
  tabId: number,
  patient: Patient,
  options: RenderTabContentOptions,
) {
  switch (tabId) {
    case 0:
      return <AntecedentsTab patient={patient} options={options} />;
    case 1:
      return <BasicTab patient={patient} />;
    case 2:
      return <DemographyTab patient={patient} />;
    case 3:
      return <LocationTab patient={patient} />;
    case 4:
      return <LaborTab patient={patient} />;
    case 5:
      return <ContactsTab patient={patient} />;
    case 6:
      return <InfoSourceTab patient={patient} />;
    default:
      return null;
  }
}

function TabHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="patient-detail-tab-header">
      <div className="patient-detail-tab-header__main">
        <h3 className="patient-detail-tab-header__title">{title}</h3>
        {description ? (
          <div className="patient-detail-tab-header__info">
            <button
              type="button"
              className="patient-detail-tab-header__info-btn"
              aria-label={`Más información sobre ${title}`}
            >
              <Icon name="icon-info-circle" size={14} />
            </button>
            <div className="patient-detail-tab-header__info-popover">
              <p>{description}</p>
            </div>
          </div>
        ) : null}
      </div>
      {action ? <div className="patient-detail-tab-header__action">{action}</div> : null}
    </div>
  );
}

function BasicTab({ patient }: { patient: Patient }) {
  const age = formatPatientAge(patient.birthDate);
  const birth = formatBirthDate(patient.birthDate);

  return (
    <div className="patient-detail-tab">
      <TabHeader
        title="Información básica"
        description="Datos de identidad y contacto principal del paciente."
      />

      <WcFormStepSection step={1} title="Identificación">
        <PatientDetailsGrid columns={4}>
          <PatientDetailsField
            label={patient.idNumberType === "temporal" ? "ID Temporal" : "Cédula"}
            value={patient.idNumber}
            emphasis="strong"
          />
          <PatientDetailsField label="Primer Nombre" value={patient.firstName} emphasis="strong" />
          <PatientDetailsField label="Segundo Nombre" value={patient.middleName} />
          <PatientDetailsField label="Apellido Paterno" value={patient.lastName} emphasis="strong" />
          <PatientDetailsField label="Apellido Materno" value={patient.secondLastName} />
          <PatientDetailsField
            label="Género"
            value={GENDER_LABELS[patient.gender] || patient.gender}
          />
          <PatientDetailsField
            label="Tipo de Sangre"
            value={patient.bloodType}
            emphasis={patient.bloodType ? "strong" : "default"}
          />
          <PatientDetailsField
            label="Fecha de Nacimiento"
            value={birth || null}
            icon="icon-calendar-solid"
          />
          <PatientDetailsField label="Edad" value={age || null} />
          <PatientDetailsField
            label="Lugar de Nacimiento"
            value={patient.birthPlace}
            fullWidth
          />
        </PatientDetailsGrid>
      </WcFormStepSection>

      <WcFormStepSection step={2} title="Contacto principal">
        <PatientDetailsGrid columns={2}>
          <PatientDetailsField
            label="Email"
            value={patient.email}
            icon="icon-email-solid"
          />
          <PatientDetailsField
            label="Teléfono"
            value={patient.phone}
            icon="icon-phone-solid"
          />
        </PatientDetailsGrid>
      </WcFormStepSection>
    </div>
  );
}

function DemographyTab({ patient }: { patient: Patient }) {
  const culturalLabel = patient.culturalGroup
    ? CULTURAL_GROUP_LABELS[patient.culturalGroup]
    : null;
  const culturalDisplay =
    patient.culturalGroup === "OTRO" && patient.culturalGroupOther?.trim()
      ? `${culturalLabel} · ${patient.culturalGroupOther}`
      : culturalLabel;

  return (
    <div className="patient-detail-tab">
      <TabHeader
        title="Demografía"
        description="Información demográfica y cobertura del paciente."
      />

      <WcFormStepSection step={1} title="Identidad social">
        <PatientDetailsGrid columns={2}>
          <PatientDetailsField label="Nacionalidad" value={patient.nationality} />
          <PatientDetailsField
            label="Estado Civil"
            value={
              patient.maritalStatus
                ? MARITAL_STATUS_LABELS[patient.maritalStatus]
                : null
            }
          />
        </PatientDetailsGrid>
      </WcFormStepSection>

      <WcFormStepSection step={2} title="Educación y cobertura">
        <PatientDetailsGrid columns={2}>
          <PatientDetailsField
            label="Nivel de Instrucción"
            value={
              patient.educationLevel
                ? EDUCATION_LEVEL_LABELS[patient.educationLevel]
                : null
            }
          />
          <PatientDetailsField
            label="Seguro de Salud"
            value={
              patient.healthInsurance
                ? HEALTH_INSURANCE_LABELS[patient.healthInsurance]
                : null
            }
          />
        </PatientDetailsGrid>
      </WcFormStepSection>

      <WcFormStepSection step={3} title="Pertenencia cultural">
        <PatientDetailsGrid columns={2}>
          <PatientDetailsField label="Grupo Cultural" value={culturalDisplay} />
        </PatientDetailsGrid>
      </WcFormStepSection>
    </div>
  );
}

function LocationTab({ patient }: { patient: Patient }) {
  const geo = patient.geographicLocation;
  const geoDisplay = geo ? (
    <span>
      <strong>{geo.province}</strong>
      {" · "}
      {geo.canton}
      {" · "}
      {geo.parish}
      <span className="patient-detail-field__suffix">DPA {geo.dpaCode}</span>
    </span>
  ) : null;

  return (
    <div className="patient-detail-tab">
      <TabHeader
        title="Ubicación"
        description="Lugar de residencia del paciente."
      />

      <WcFormStepSection step={1} title="Ubicación geográfica">
        <PatientDetailsGrid columns={1}>
          <PatientDetailsField
            label="Provincia, Cantón y Parroquia"
            value={geoDisplay}
            icon="icon-map-pin-solid"
            fullWidth
          />
        </PatientDetailsGrid>
      </WcFormStepSection>

      <WcFormStepSection step={2} title="Domicilio">
        <PatientDetailsGrid columns={2}>
          <PatientDetailsField
            label="Dirección Domicilio"
            value={patient.homeAddress}
            icon="icon-home-solid"
            fullWidth
            multiline
          />
          <PatientDetailsField label="Barrio / Sector" value={patient.neighborhood} />
        </PatientDetailsGrid>
      </WcFormStepSection>
    </div>
  );
}

function LaborTab({ patient }: { patient: Patient }) {
  const works = patient.currentlyWorks;

  return (
    <div className="patient-detail-tab">
      <TabHeader
        title="Información laboral"
        description="Situación laboral y datos de la empresa."
      />

      <div className="patient-detail-work-status">
        <Icon name="icon-info-circle" size={14} />
        <span className="patient-detail-work-status__label">¿Trabaja actualmente?</span>
        <span
          className={`patient-detail-work-status__value ${
            works
              ? "patient-detail-work-status__value--yes"
              : "patient-detail-work-status__value--no"
          }`}
        >
          {works ? "Sí" : "No"}
        </span>
      </div>

      {works ? (
        <WcFormStepSection step={1} title="Datos laborales">
          <PatientDetailsGrid columns={3}>
            <PatientDetailsField label="Ocupación" value={patient.occupation?.name} />
            <PatientDetailsField label="Empresa" value={patient.companyName} />
            <PatientDetailsField label="Cargo" value={patient.companyPosition} />
            <PatientDetailsField
              label="Teléfono de Empresa"
              value={patient.companyPhone}
              icon="icon-phone-solid"
            />
            <PatientDetailsField
              label="Dirección de Empresa"
              value={patient.companyAddress}
              icon="icon-location-solid"
              fullWidth
            />
          </PatientDetailsGrid>
        </WcFormStepSection>
      ) : (
        <div className="patient-detail-empty-state">
          <Icon name="icon-briefcase" size={28} />
          <p className="patient-detail-empty-state__title">Sin información laboral</p>
          <span className="patient-detail-empty-state__description">
            El paciente no registra actividad laboral activa.
          </span>
        </div>
      )}
    </div>
  );
}

function ContactsTab({ patient }: { patient: Patient }) {
  const contacts = patient.emergencyContacts || [];

  return (
    <div className="patient-detail-tab">
      <TabHeader
        title="Contactos de emergencia"
        description="Personas a contactar en caso de emergencia."
      />

      {contacts.length === 0 ? (
        <div className="patient-detail-empty-state">
          <Icon name="icon-users" size={28} />
          <p className="patient-detail-empty-state__title">Sin contactos registrados</p>
          <span className="patient-detail-empty-state__description">
            El paciente no tiene contactos de emergencia registrados.
          </span>
        </div>
      ) : (
        <div className="patient-detail-contact-grid">
          {contacts.map((contact, index) => (
            <PatientEmergencyContactReadCard
              key={contact.id || index}
              contact={contact}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InfoSourceTab({ patient }: { patient: Patient }) {
  const sourceLabel = patient.infoSourceType
    ? INFORMATION_SOURCE_LABELS[patient.infoSourceType]
    : null;
  const sourceDisplay =
    patient.infoSourceType === "OTRO" && patient.infoSourceOther?.trim()
      ? `${sourceLabel} · ${patient.infoSourceOther}`
      : sourceLabel;

  const showInformant =
    patient.infoSourceType &&
    patient.infoSourceType !== "PACIENTE" &&
    patient.infoSourceType !== "HISTORIA_CLINICA";

  return (
    <div className="patient-detail-tab">
      <TabHeader
        title="Fuente de información"
        description="Origen de los datos clínicos registrados."
      />

      <WcFormStepSection step={1} title="Origen">
        <PatientDetailsGrid columns={2}>
          <PatientDetailsField label="Fuente" value={sourceDisplay} emphasis="strong" />
        </PatientDetailsGrid>
      </WcFormStepSection>

      {showInformant ? (
        <WcFormStepSection step={2} title="Detalle del informante">
          <PatientDetailsGrid columns={2}>
            <PatientDetailsField
              label="Nombre del Informante"
              value={patient.infoSourceName}
            />
            <PatientDetailsField
              label="Teléfono del Informante"
              value={patient.infoSourcePhone}
              icon="icon-phone-solid"
            />
            <PatientDetailsField
              label="Observaciones"
              value={patient.infoSourceObservations}
              fullWidth
              multiline
            />
          </PatientDetailsGrid>
        </WcFormStepSection>
      ) : patient.infoSourceObservations?.trim() ? (
        <WcFormStepSection step={2} title="Observaciones">
          <PatientDetailsGrid columns={1}>
            <PatientDetailsField
              label="Observaciones"
              value={patient.infoSourceObservations}
              fullWidth
              multiline
            />
          </PatientDetailsGrid>
        </WcFormStepSection>
      ) : null}
    </div>
  );
}

function AntecedentsTab({
  patient,
  options,
}: {
  patient: Patient;
  options: RenderTabContentOptions;
}) {
  const antecedents = patient.clinicalAntecedents || [];
  const inactiveCount = antecedents.filter((a) => !a.isActive).length;

  const visibleAntecedents = useMemo(() => {
    return antecedents.filter((a) => {
      if (!options.showInactiveAntecedents && !a.isActive) return false;
      if (options.antecedentTypeFilter && a.antecedentType !== options.antecedentTypeFilter)
        return false;
      return true;
    });
  }, [
    antecedents,
    options.showInactiveAntecedents,
    options.antecedentTypeFilter,
  ]);

  return (
    <div className="patient-detail-tab">
      <TabHeader
        title="Antecedentes clínicos"
        description="Información médica relevante para la toma de decisiones."
        action={
          inactiveCount > 0 ? (
            <button
              type="button"
              className="patient-detail-toggle-inactive"
              onClick={options.onToggleInactiveAntecedents}
              aria-pressed={options.showInactiveAntecedents}
            >
              <Icon
                name={options.showInactiveAntecedents ? "icon-eye-off" : "icon-eye"}
                size={14}
              />
              {options.showInactiveAntecedents
                ? `Ocultar inactivos (${inactiveCount})`
                : `Mostrar inactivos (${inactiveCount})`}
            </button>
          ) : null
        }
      />

      {antecedents.length === 0 ? (
        <div className="patient-detail-empty-state">
          <Icon name="icon-medical-history" size={28} />
          <p className="patient-detail-empty-state__title">Sin antecedentes registrados</p>
          <span className="patient-detail-empty-state__description">
            El paciente no tiene antecedentes clínicos registrados.
          </span>
        </div>
      ) : (
        <>
          <PatientAntecedentTypeFilterChips
            antecedents={antecedents.filter(
              (a) => options.showInactiveAntecedents || a.isActive,
            )}
            activeType={options.antecedentTypeFilter}
            onChange={options.onChangeAntecedentTypeFilter}
          />

          {visibleAntecedents.length === 0 ? (
            <div className="patient-detail-empty-state patient-detail-empty-state--soft">
              <Icon name="icon-filters" size={24} />
              <p className="patient-detail-empty-state__title">
                Sin antecedentes para el filtro actual
              </p>
            </div>
          ) : (
            <div className="patient-detail-antecedent-grid">
              {visibleAntecedents.map((antecedent, index) => (
                <PatientClinicalAntecedentReadCard
                  key={antecedent.id || index}
                  antecedent={antecedent}
                  index={index}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
