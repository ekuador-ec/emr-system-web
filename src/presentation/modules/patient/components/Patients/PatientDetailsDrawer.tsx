import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import "./PatientDetailsDrawer.css";

export function PatientDetailsDrawer() {
  const navigate = useNavigate();
  const { selectedPatientId, setSelectedPatientId, setEditingPatientId } = usePatientStore();
  const { data: patient, isLoading, isError } = usePatient(selectedPatientId || "");
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPatientId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPatientId(null);
        return;
      }
      
      if (e.key === 'Tab') {
        if (!drawerRef.current) return;
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    document.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus drawer to trap focus inside initially
    if (drawerRef.current) {
      drawerRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPatientId, setSelectedPatientId]);

  if (!selectedPatientId) return null;

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
        <div className="patient-drawer__header">
          <div className="patient-drawer__header-actions">
            <WcButtonIcon
              variant="ghost"
              shape="circle"
              size="sm"
              icon="close"
              className="drawer-header__close"
              onClick={() => setSelectedPatientId(null)}
              aria-label="Cerrar detalle del paciente"
            />
          </div>
        </div>

        <div className="patient-drawer__body">
          {isLoading ? (
            <div className="patient-drawer__loading">
              <div className="patient-drawer__skeleton patient-drawer__skeleton--avatar"></div>
              <div className="patient-drawer__skeleton patient-drawer__skeleton--title"></div>
              <div className="patient-drawer__skeleton patient-drawer__skeleton--subtitle"></div>
              <div className="patient-drawer__skeleton patient-drawer__skeleton--card"></div>
              <div className="patient-drawer__skeleton patient-drawer__skeleton--card"></div>
            </div>
          ) : isError || !patient ? (
            <div className="patient-drawer__error">
              <Icon name="icon-alert-triangle" size={24} className="patient-drawer__error-icon" />
              <p className="patient-drawer__error-msg">Error al cargar la información del paciente.</p>
            </div>
          ) : (
            <div className="patient-drawer__content">
              {/* Hero Section */}
              <section className="patient-drawer__hero">
                <div className="patient-drawer__avatar">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
                <div className="patient-drawer__hero-info">
                  <h2 id="patient-drawer-title" className="patient-drawer__name">
                    {patient.firstName} {patient.middleName || ""} {patient.lastName} {patient.secondLastName || ""}
                  </h2>
                  <div className="patient-drawer__meta">
                    {patient.idNumberType === 'temporal' ? (
                      <span className="patient-drawer__badge patient-drawer__badge--warning">ID Pendiente</span>
                    ) : (
                      <span className="patient-drawer__meta-text">Cédula: {patient.idNumber}</span>
                    )}
                    <span className="patient-drawer__meta-separator">·</span>
                    <span className="patient-drawer__meta-text">{patient.gender}</span>
                    <span className="patient-drawer__meta-separator">·</span>
                    <span className="patient-drawer__meta-text">{patient.bloodType || "Sangre N/R"}</span>
                  </div>
                </div>
              </section>

              {/* Cards / Sections */}
              <section className="patient-drawer__section">
                <div className="patient-drawer__section-header">
                  <h3 className="patient-drawer__section-title">Contacto</h3>
                  <div className="patient-drawer__section-line"></div>
                </div>
                <div className="patient-drawer__card">
                  <div className="patient-drawer__field">
                    <Icon name="icon-mail" size={14} className="patient-drawer__field-icon" />
                    <div className="patient-drawer__field-content">
                      <span className="patient-drawer__field-label">Email</span>
                      <span className="patient-drawer__field-value">{patient.email || "N/A"}</span>
                    </div>
                  </div>
                  <div className="patient-drawer__field">
                    <Icon name="icon-phone" size={14} className="patient-drawer__field-icon" />
                    <div className="patient-drawer__field-content">
                      <span className="patient-drawer__field-label">Teléfono</span>
                      <span className="patient-drawer__field-value">{patient.phone || "N/A"}</span>
                    </div>
                  </div>
                  <div className="patient-drawer__field">
                    <Icon name="icon-map-pin" size={14} className="patient-drawer__field-icon" />
                    <div className="patient-drawer__field-content">
                      <span className="patient-drawer__field-label">Dirección</span>
                      <span className="patient-drawer__field-value">{patient.homeAddress}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="patient-drawer__section">
                <div className="patient-drawer__section-header">
                  <h3 className="patient-drawer__section-title">Información Personal</h3>
                  <div className="patient-drawer__section-line"></div>
                </div>
                <div className="patient-drawer__card patient-drawer__card--grid">
                  <div className="patient-drawer__field">
                    <div className="patient-drawer__field-content">
                      <span className="patient-drawer__field-label">Nacimiento</span>
                      <span className="patient-drawer__field-value">{patient.birthDate}</span>
                    </div>
                  </div>
                  <div className="patient-drawer__field">
                    <div className="patient-drawer__field-content">
                      <span className="patient-drawer__field-label">Nacionalidad</span>
                      <span className="patient-drawer__field-value">{patient.nationality || "N/A"}</span>
                    </div>
                  </div>
                  <div className="patient-drawer__field">
                    <div className="patient-drawer__field-content">
                      <span className="patient-drawer__field-label">Estado Civil</span>
                      <span className="patient-drawer__field-value">{patient.maritalStatus || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </section>

              {patient.emergencyContacts && patient.emergencyContacts.length > 0 && (
                <section className="patient-drawer__section">
                  <div className="patient-drawer__section-header">
                    <h3 className="patient-drawer__section-title">Contactos de Emergencia</h3>
                    <div className="patient-drawer__section-line"></div>
                  </div>
                  <div className="patient-drawer__list">
                    {patient.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="patient-drawer__list-item">
                        <div className="patient-drawer__list-header">
                          <span className="patient-drawer__field-value patient-drawer__field-value--bold">{contact.name}</span>
                          <span className="patient-drawer__field-label">{contact.kinship}</span>
                        </div>
                        <div className="patient-drawer__field-inline">
                          <Icon name="icon-phone" size={12} className="patient-drawer__field-icon" />
                          <span className="patient-drawer__field-value">{contact.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {patient.clinicalAntecedents && patient.clinicalAntecedents.length > 0 && (
                <section className="patient-drawer__section">
                  <div className="patient-drawer__section-header">
                    <h3 className="patient-drawer__section-title">Antecedentes Clínicos</h3>
                    <div className="patient-drawer__section-line"></div>
                  </div>
                  <div className="patient-drawer__list">
                    {patient.clinicalAntecedents.map((ant, idx) => (
                      <div key={idx} className="patient-drawer__list-item">
                        <div className="patient-drawer__list-header">
                          <span className="patient-drawer__field-value patient-drawer__field-value--bold" style={{ textTransform: 'capitalize' }}>
                            {ant.antecedentType}
                          </span>
                          <span className="patient-drawer__field-label">{ant.diagnosisDate}</span>
                        </div>
                        {ant.description && (
                          <div className="patient-drawer__field-value patient-drawer__field-value--multiline">
                            {ant.description}
                          </div>
                        )}
                        {ant.treatment && (
                          <div className="patient-drawer__field-value patient-drawer__field-value--muted">
                            Tratamiento: {ant.treatment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {patient && (
          <div className="patient-drawer__footer">
            <WcButton
              variant="danger"
              className="drawer-footer__btn-edit"
              onClick={() => {
                setEditingPatientId(patient.id);
                setSelectedPatientId(null);
              }}
            >
              Editar
            </WcButton>
            <WcButton
              variant="terciary"
              className="drawer-footer__btn-history"
              onClick={() => {
                navigate(`/pacientes/${patient.id}/historia`);
                setSelectedPatientId(null);
              }}
            >
              Ir a Historia
            </WcButton>
          </div>
        )}
      </div>
    </div>
  );
}
