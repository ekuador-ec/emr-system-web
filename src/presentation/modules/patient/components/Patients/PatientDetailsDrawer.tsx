import { useNavigate } from 'react-router-dom';
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import "./PatientDetailsDrawer.css";

export function PatientDetailsDrawer() {
  const navigate = useNavigate();
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
            Detalles del Paciente
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
                      <h3 className="drawer-patient-name" style={{ margin: 0 }}>
                        {patient.firstName} {patient.middleName || ""} {patient.lastName} {patient.secondLastName || ""}
                      </h3>
                      {patient.idNumberType === 'temporal' && (
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: "var(--font-weight-semibold)",
                            color: "var(--color-warning)",
                            backgroundColor: "var(--color-warning-light)",
                            border: "1px solid var(--color-warning)",
                            borderRadius: "var(--radius-sm)",
                            padding: "2px 8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ID Pendiente
                        </span>
                      )}
                    </div>
                    <div className="drawer-patient-meta">
                      {patient.idNumberType === 'temporal'
                        ? 'Sin cedula registrada'
                        : `Cedula/ID: ${patient.idNumber}`
                      } | {patient.gender} | Grupo Sanguineo: {patient.bloodType || "No registrado"}
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
          <div className="drawer-footer" style={{ flexDirection: 'row', gap: 'var(--space-2)' }}>
             <button 
              type="button" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#312e81', borderColor: '#312e81' }}
              onClick={() => {
                navigate(`/pacientes/${patient.id}/historia`);
                setSelectedPatientId(null);
              }}
             >
                <Icon name="icon-folder" size={18} />
                Ir a Historia Clínica
             </button>
             <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => {
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
