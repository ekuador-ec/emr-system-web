import { useParams, useNavigate } from 'react-router-dom';
import { useEvolutionsByMedicalRecord, useCreateEvolution } from '@/presentation/modules/evolution/hooks/useEvolutions';
import { useEvolutionUIStore } from '@/presentation/modules/evolution/stores/useEvolutionUIStore';
import type { CreateEvolutionPayload } from '@/domain/modules/evolution/models/Evolution';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import WcButton from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton';
import WcButtonIcon from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon';
import { useToastStore } from '@/presentation/modules/shared/components/Toaster';
import { useConfirmDialog } from '@/presentation/modules/shared/components/ui/useConfirmDialog';

interface MedicalRecordEvolutionsListProps {
  medicalRecordId: string;
}

export function MedicalRecordEvolutionsList({ medicalRecordId }: MedicalRecordEvolutionsListProps) {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const { data: evolutions, isLoading } = useEvolutionsByMedicalRecord(medicalRecordId);
  const createEvolution = useCreateEvolution();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();
  const openReadOnlyEvolution = useEvolutionUIStore(
    (state) => state.openReadOnlyEvolution,
  );

  const handleNewEvolution = async () => {
    const isConfirmed = await confirm({
      title: "Nueva Evolución Médica",
      message: "¿Desea abrir una nueva evolución médica? Se creará un borrador que podrá pausar y continuar luego.",
      confirmText: "Crear Evolución",
      type: "primary"
    });
    if (!isConfirmed) return;

    try {
      const payload: CreateEvolutionPayload = {
        medicalRecordId,
        notifyPolice: false,
        requiresPoliceCustody: false,
        alcoholicBreath: false,
        deathInEmergency: false,
        attentionDate: new Date().toISOString().split('T')[0],
        attentionTime: new Date().toTimeString().split(':')[0] + ':' + new Date().toTimeString().split(':')[1],
      };
      
      const newEvolution = await createEvolution.mutateAsync(payload);
      addToast({ type: "success", message: "Borrador de evolución creado exitosamente." });
      navigate(`/pacientes/${patientId}/historia/evoluciones/${newEvolution.id}`);
    } catch (error) {
      console.error('Failed to create new evolution', error);
      addToast({ type: "error", message: "Ocurrió un error al crear la evolución médica." });
    }
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
          Evoluciones Médicas
        </h3>
        <WcButton
          variant="primary"
          onClick={handleNewEvolution}
          disabled={createEvolution.isPending}
        >
          <Icon name="icon-plus" size={16} />
          {createEvolution.isPending ? 'Creando...' : 'Nueva Evolución'}
        </WcButton>
      </div>

      <div style={{ padding: "var(--space-6)" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--color-text-secondary)" }}>
            Cargando evoluciones...
          </div>
        ) : !evolutions || evolutions.length === 0 ? (
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
              Las evoluciones médicas de este paciente se mostrarán aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {evolutions.map((ev) => (
              <div 
                key={ev.id} 
                onClick={() => navigate(`/pacientes/${patientId}/historia/evoluciones/${ev.id}`)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'var(--color-bg)',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      Evolución {ev.attentionDate} {ev.attentionTime}
                    </span>
                    <span style={{ 
                      fontSize: "0.75rem", 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      backgroundColor: ev.status === 'CERRADA' ? 'var(--color-success-light)' : ev.status === 'EN_PROCESO' ? 'var(--color-primary-light)' : 'var(--color-warning-light)',
                      color: ev.status === 'CERRADA' ? 'var(--color-success)' : ev.status === 'EN_PROCESO' ? 'var(--color-primary)' : 'var(--color-warning)',
                      fontWeight: 600
                    }}>
                      {ev.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {ev.openedByName ? `Dr. ${ev.openedByName}` : 'Médico Tratante'}
                    {ev.clinicalCause && ` • ${ev.clinicalCause}`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <WcButtonIcon
                    variant="terciary"
                    shape="square"
                    size="sm"
                    icon="icon-eye"
                    title="Ver detalle (solo lectura)"
                    aria-label="Ver detalle (solo lectura)"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!patientId) return;
                      openReadOnlyEvolution({ patientId, evolutionId: ev.id });
                    }}
                  />
                  <Icon name="icon-chevron-right" size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {DialogComponent}
    </div>
  );
}