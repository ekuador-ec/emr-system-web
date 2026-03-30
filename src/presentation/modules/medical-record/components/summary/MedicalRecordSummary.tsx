import { useAuth } from '@/presentation/modules/auth/hooks/useAuth';
import { useMedicalRecordByPatient, useCreateMedicalRecord, useUpdateMedicalRecordStatus } from '@/presentation/modules/medical-record/hooks/useMedicalRecord';
import { canEditMedicalRecord, canChangeMedicalRecordStatus } from '@/presentation/core/security/medicalRecordPermissions';
import { usePatientStore } from '@/presentation/modules/patient/stores/usePatientStore';
import { useToastStore } from '@/presentation/modules/shared/components/Toaster';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import '@/presentation/modules/shared/components/ui/webcomponents/wcButton';

interface MedicalRecordSummaryProps {
  patientId: string;
}

export function MedicalRecordSummary({ patientId }: MedicalRecordSummaryProps) {
  const { user } = useAuth();
  const { data: medicalRecord, isLoading } = useMedicalRecordByPatient(patientId);
  const { mutate: createMedicalRecord, isPending: isCreating } = useCreateMedicalRecord();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMedicalRecordStatus();
  const { setSelectedPatientId } = usePatientStore();
  const { addToast } = useToastStore();

  const canEdit = canEditMedicalRecord(user?.role);
  const canAdmin = canChangeMedicalRecordStatus(user?.role);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md, 8px)",
          padding: "var(--space-8)",
          textAlign: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        Cargando historia clinica...
      </div>
    );
  }

  if (!medicalRecord) {
    if (canEdit) {
      return (
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md, 8px)",
            padding: "var(--space-8)",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: 0, marginBottom: "var(--space-2)", color: "var(--color-text)" }}>
            No se encontro Historia Clinica
          </h3>
          <p style={{ margin: 0, marginBottom: "var(--space-4)", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            Este paciente aun no tiene una historia clinica registrada.
          </p>
          <wc-button
            variant="primary"
            disabled={isCreating}
            onClick={() => createMedicalRecord(patientId)}
          >
            <Icon name="icon-plus" size={16} />
            {isCreating ? "Creando..." : "Crear Historia Clinica"}
          </wc-button>
        </div>
      );
    }
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md, 8px)",
          padding: "var(--space-8)",
          textAlign: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        No hay historia clinica disponible.
      </div>
    );
  }

  const handleToggleStatus = () => {
    updateStatus(
      { id: medicalRecord.id, isActive: !medicalRecord.isActive },
      {
        onSuccess: () => {
          addToast({
            type: "success",
            message: `Historia clinica ${!medicalRecord.isActive ? "activada" : "archivada"} exitosamente`,
          });
        },
        onError: (err) => {
          addToast({
            type: "error",
            message: err instanceof Error ? err.message : "Error al cambiar estado",
          });
        },
      }
    );
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md, 8px)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "var(--space-5) var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
              <h2 style={{ margin: 0, fontWeight: 700, color: "var(--color-text)" }}>Historia Clinica</h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: medicalRecord.isActive ? "var(--color-success-bg, rgba(34,197,94,0.1))" : "var(--color-danger-bg, rgba(239,68,68,0.1))",
                  color: medicalRecord.isActive ? "var(--color-success, #16a34a)" : "var(--color-danger, #dc2626)",
                }}
              >
                {medicalRecord.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span>
                Nro. Historia: <strong style={{ fontFamily: "monospace", color: "var(--color-text)" }}>{medicalRecord.patientIdNumber || patientId}</strong>
              </span>
            </div>
          </div>

          {canAdmin && (
            <wc-button
              variant={medicalRecord.isActive ? "danger" : "primary"}
              disabled={isUpdating}
              onClick={handleToggleStatus}
            >
              <Icon name={medicalRecord.isActive ? "icon-archive" : "icon-check"} size={16} />
              {medicalRecord.isActive ? "Archivar HC" : "Activar HC"}
            </wc-button>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-4) var(--space-6)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4)",
          fontSize: "0.8rem",
          color: "var(--color-text-secondary)",
          backgroundColor: "var(--color-bg)",
        }}
      >
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
            <Icon name="icon-calendar" size={12} />
            Creada
          </span>
          <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
            {new Date(medicalRecord.createdAt).toLocaleDateString()}
          </span>
          {medicalRecord.createdByName && (
            <span style={{ display: "block", fontSize: "0.75rem" }}>
              por {medicalRecord.createdByName}
            </span>
          )}
        </div>
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
            <Icon name="icon-calendar" size={12} />
            Ultima edicion
          </span>
          <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
            {new Date(medicalRecord.updatedAt).toLocaleDateString()}
          </span>
          {medicalRecord.updatedByName && (
            <span style={{ display: "block", fontSize: "0.75rem" }}>
              por {medicalRecord.updatedByName}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Paciente
          </span>
          <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1.1rem' }}>
            {medicalRecord.patientName || 'Paciente'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            <span><strong style={{ fontWeight: 500 }}>Cédula:</strong> {medicalRecord.patientIdNumber || 'N/A'}</span>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <span style={{ textTransform: 'capitalize' }}><strong style={{ fontWeight: 500 }}>Género:</strong> {medicalRecord.patientGender || 'N/A'}</span>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <span><strong style={{ fontWeight: 500 }}>Sangre:</strong> {medicalRecord.patientBloodType || 'N/A'}</span>
          </div>
        </div>
        <wc-button
          variant="terciary"
          onClick={() => setSelectedPatientId(patientId)}
        >
          <Icon name="icon-user" size={16} />
          Ver Detalle del Paciente
        </wc-button>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.75rem', lineHeight: '1', fontWeight: 700, color: 'var(--color-primary)' }}>
              {medicalRecord.evolutionCount}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
              Evoluciones
            </span>
          </div>
          
          <div style={{ height: '40px', width: '1px', backgroundColor: 'var(--color-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
               <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                 <span style={{ position: 'absolute', left: '10px', color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: 600, pointerEvents: 'none', zIndex: 1 }}>DE:</span>
                 <input 
                   type="date" 
                   title="Fecha Inicio"
                   style={{
                     padding: 'var(--space-2) var(--space-3)',
                     paddingLeft: '32px',
                     borderRadius: 'var(--radius-md, 8px)',
                     border: '1px solid var(--color-border)',
                     backgroundColor: 'var(--color-surface)',
                     fontSize: '0.875rem',
                     color: 'var(--color-text)',
                     outline: 'none',
                     cursor: 'text'
                   }}
                 />
               </div>
               <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>-</span>
               <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                 <span style={{ position: 'absolute', left: '10px', color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: 600, pointerEvents: 'none', zIndex: 1 }}>A:</span>
                 <input 
                   type="date" 
                   title="Fecha Fin"
                   style={{
                     padding: 'var(--space-2) var(--space-3)',
                     paddingLeft: '28px',
                     borderRadius: 'var(--radius-md, 8px)',
                     border: '1px solid var(--color-border)',
                     backgroundColor: 'var(--color-surface)',
                     fontSize: '0.875rem',
                     color: 'var(--color-text)',
                     outline: 'none',
                     cursor: 'text'
                   }}
                 />
               </div>
             </div>

             <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--color-border)', margin: '0 var(--space-1)' }} />

             <div style={{ position: 'relative' }}>
               <Icon name="icon-calendar" size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
               <select 
                 style={{
                   padding: 'var(--space-2) var(--space-3)',
                   paddingLeft: 'var(--space-8)',
                   borderRadius: 'var(--radius-md, 8px)',
                   border: '1px solid var(--color-border)',
                   backgroundColor: 'var(--color-surface)',
                   fontSize: '0.875rem',
                   color: 'var(--color-text)',
                   outline: 'none',
                   cursor: 'pointer',
                   appearance: 'none',
                   paddingRight: 'var(--space-8)'
                 }}
                 defaultValue=""
               >
                 <option value="" disabled>Todos los años</option>
                 <option value="2026">2026</option>
                 <option value="2025">2025</option>
                 <option value="2024">2024</option>
                 <option value="2023">2023</option>
               </select>
               <Icon name="icon-chevron-down" size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
             </div>

             <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--color-border)', margin: '0 var(--space-1)' }} />

             <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
               <wc-button variant="primary">
                 Buscar
               </wc-button>
               <wc-button variant="terciary">
                 Limpiar
               </wc-button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
