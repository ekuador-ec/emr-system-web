import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import "./PatientDetailsDrawer.css";

export function PatientDetailsDrawer() {
  const { selectedPatientId, setSelectedPatientId, setEditingPatientId } = usePatientStore();
  const { data: patient, isLoading, isError } = usePatient(selectedPatientId || "");

  if (!selectedPatientId) return null;

  return (
    <div
      className="drawer-overlay"
      onClick={() => setSelectedPatientId(null)}
    >
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>
            Historia Clinica del Paciente
          </h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setSelectedPatientId(null)}
            style={{ padding: "var(--space-2)" }}
          >
            <Icon name="icon-x" size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {isLoading ? (
            <div className="drawer-loading">
              <Icon name="icon-loader" size={24} className="spin" />
              <p>Cargando informacion...</p>
            </div>
          ) : isError || !patient ? (
            <div className="drawer-error">
              <p>Error al cargar la informacion del paciente.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

              <section>
                <div className="drawer-patient-info">
                  <div className="drawer-patient-avatar">
                    {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="drawer-patient-name">
                      {patient.firstName} {patient.middleName || ""} {patient.lastName} {patient.secondLastName || ""}
                    </h3>
                    <div className="drawer-patient-meta">
                      Cedula/ID: {patient.idNumber} | {patient.gender} | Grupo Sanguineo: {patient.bloodType || "No registrado"}
                    </div>
                  </div>
                </div>
              </section>

              <div className="drawer-card-grid">
                <section className="card" style={{ padding: "var(--space-4)" }}>
                  <h4 className="drawer-section-title">Contacto</h4>
                  <div className="drawer-detail-list">
                    <div><strong>Email:</strong> {patient.email || "N/A"}</div>
                    <div><strong>Telefono:</strong> {patient.phone || "N/A"}</div>
                    <div><strong>Direccion:</strong> {patient.homeAddress}</div>
                  </div>
                </section>

                <section className="card" style={{ padding: "var(--space-4)" }}>
                  <h4 className="drawer-section-title">Demografia</h4>
                  <div className="drawer-detail-list">
                    <div><strong>Nacimiento:</strong> {patient.birthDate}</div>
                    <div><strong>Nacionalidad:</strong> {patient.nationality || "N/A"}</div>
                    <div><strong>Estado Civil:</strong> {patient.maritalStatus || "N/A"}</div>
                  </div>
                </section>
              </div>

              {patient.emergencyContacts && patient.emergencyContacts.length > 0 && (
                <section>
                  <h4 className="drawer-subsection-title">Contactos de Emergencia</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {patient.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="drawer-contact-item">
                        <div className="drawer-contact-name">{contact.name} ({contact.kinship})</div>
                        <div className="drawer-contact-phone"><Icon name="icon-phone" size={12} /> {contact.phone}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {patient.clinicalAntecedents && patient.clinicalAntecedents.length > 0 && (
                <section>
                  <h4 className="drawer-subsection-title">Antecedentes Clinicos</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {patient.clinicalAntecedents.map((ant, idx) => (
                      <div key={idx} className="drawer-antecedent-item">
                        <div className="drawer-antecedent-header">
                          <strong className="drawer-antecedent-type">{ant.antecedentType}</strong>
                          <span className="drawer-antecedent-date">{ant.diagnosisDate}</span>
                        </div>
                        {ant.description && <div className="drawer-antecedent-desc">{ant.description}</div>}
                        {ant.treatment && <div className="drawer-antecedent-treatment">Tratamiento: {ant.treatment}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>

        {patient && (
          <div className="drawer-footer">
             <button type="button" className="btn-secondary" onClick={() => {
                setEditingPatientId(patient.id);
                setSelectedPatientId(null);
             }}>
                Editar Paciente
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
