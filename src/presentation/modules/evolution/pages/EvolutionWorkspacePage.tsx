import { useEffect, useState } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UpdateEvolutionDraftSchema, 
  CloseEvolutionStrictSchema, 
  type UpdateEvolutionDraftFormValues 
} from '../schemas/evolution.schema';
import { useEvolution, useUpdateEvolution, useCloseEvolution } from '../hooks/useEvolutions';
import { useEvolutionUIStore } from '../stores/useEvolutionUIStore';
import { Icon } from '@/presentation/modules/shared/components/Sidebar/icons/Icon';
import WcButton from '@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton';

import { TabMotivo } from '../components/form/TabMotivo';
import { TabSignosVitales } from '../components/form/TabSignosVitales';
import { TabExamen } from '../components/form/TabExamen';
import { TabDiagnostico } from '../components/form/TabDiagnostico';
import { TabAlta } from '../components/form/TabAlta';
import { useToastStore } from '@/presentation/modules/shared/components/Toaster';
import { useConfirmDialog } from '@/presentation/modules/shared/components/ui/useConfirmDialog';

export function EvolutionWorkspacePage() {
  const { patientId, evolutionId } = useParams<{ patientId: string; evolutionId: string }>();
  const navigate = useNavigate();
  
  const { data: evolution, isLoading } = useEvolution(evolutionId || '');
  const updateEvolution = useUpdateEvolution();
  const closeEvolution = useCloseEvolution();
  const { activeTab, setActiveTab, nextTab, prevTab, reset } = useEvolutionUIStore();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();

  const [validationErrors, setValidationErrors] = useState<Record<string, { tabIndex: number; messages: string[] }>>({});

  // Helper to map field to tab
  const mapZodPathToTab = (path: (string | number)[]): { tabName: string, tabIndex: number } => {
    if (!path || path.length === 0) return { tabName: 'General', tabIndex: 0 };
    const field = String(path[0]);
    
    if (['attentionDate', 'attentionTime', 'clinicalCause', 'clinicalCauseDescription', 'notifyPolice', 'eventDateTime', 'eventLocation', 'eventAddress', 'requiresPoliceCustody', 'alcoholicBreath', 'alcocheckValue', 'accidentType', 'violenceType', 'intoxicationType', 'eventObservations'].includes(field)) {
      return { tabName: 'Motivo y Evento', tabIndex: 0 };
    }
    
    if (['bpRight', 'bpLeft', 'heartRate', 'respiratoryRate', 'temperature', 'bmi', 'weight', 'height', 'rightPupilReaction', 'leftPupilReaction', 'capillaryRefillTime', 'oxygenSaturation', 'glasgowOcular', 'glasgowVerbal', 'glasgowMotor', 'glasgowTotal'].includes(field)) {
      return { tabName: 'Signos Vitales', tabIndex: 1 };
    }

    if (['systemsReview', 'physicalExams', 'injuries', 'gestations', 'parturitions', 'abortions', 'cesareans', 'lastMenstruationDate', 'gestationalWeeks', 'fetalMovement', 'fetalHeartRate', 'rupturedMembranes', 'rupturedTime', 'uterineHeight', 'presentation', 'dilation', 'effacement', 'plane', 'usefulPelvis', 'vaginalBleeding', 'contractions'].includes(field)) {
      return { tabName: 'Examen Físico', tabIndex: 2 };
    }

    if (['diagnoses'].includes(field)) {
      return { tabName: 'Diagnóstico', tabIndex: 3 };
    }

    if (['discharges', 'incapacityDays', 'referralService', 'referralFacility', 'deathInEmergency', 'deathCause'].includes(field)) {
      return { tabName: 'Alta Médica', tabIndex: 4 };
    }

    return { tabName: 'General', tabIndex: 0 };
  };

  // We use the relaxed schema for the default resolver (draft saving)
  const methods = useForm<UpdateEvolutionDraftFormValues>({
    resolver: zodResolver(UpdateEvolutionDraftSchema),
    defaultValues: {
      medicalRecordId: '',
      notifyPolice: false,
      requiresPoliceCustody: false,
      alcoholicBreath: false,
      deathInEmergency: false,
      systemsReview: [],
      physicalExams: [],
      injuries: [],
      diagnoses: [],
      discharges: []
    }
  });

  // Load data when available
  useEffect(() => {
    if (evolution) {
      methods.reset({
        ...evolution,
        systemsReview: evolution.systemsReview || [],
        physicalExams: evolution.physicalExams || [],
        injuries: evolution.injuries || [],
        diagnoses: evolution.diagnoses || [],
        discharges: evolution.discharges || []
      });
    }
    return () => reset(); // Reset UI store on unmount
  }, [evolution, methods, reset]);

  const isClosed = evolution?.status === 'CERRADA';
  const isDirty = methods.formState.isDirty;

  // Intercept React Router navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !isClosed && currentLocation.pathname !== nextLocation.pathname
  );

  // Intercept Browser Close/Refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isClosed) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome to show prompt
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isClosed]);

  const handleGoBack = () => {
    navigate(`/pacientes/${patientId}/historia`);
  };

  const handleSaveDraft = async (data: UpdateEvolutionDraftFormValues) => {
    try {
      setValidationErrors({});
      // @ts-ignore
      await updateEvolution.mutateAsync({ 
        id: evolutionId!, 
        payload: { ...data, status: evolution?.status === 'ABIERTA' ? 'EN_PROCESO' : evolution?.status } 
      });
      methods.reset(data); // reset dirty state
      addToast({ type: "success", message: "Borrador guardado temporalmente." });
    } catch (error) {
      console.error('Failed to save draft', error);
      addToast({ type: "error", message: "Ocurrió un error al guardar el borrador." });
    }
  };

  const handleCloseEvolution = async () => {
    const data = methods.getValues();
    
    // Strict validation
    const result = CloseEvolutionStrictSchema.safeParse(data);
    
    if (!result.success) {
      const groupedErrors: Record<string, { tabIndex: number; messages: string[] }> = {};
      
      result.error.issues.forEach((issue) => {
        const pathStr = issue.path.map(String);
        const { tabName, tabIndex } = mapZodPathToTab(pathStr);
        if (!groupedErrors[tabName]) {
          groupedErrors[tabName] = { tabIndex, messages: [] };
        }
        // Avoid duplicate messages in the same tab
        if (!groupedErrors[tabName].messages.includes(issue.message)) {
          groupedErrors[tabName].messages.push(issue.message);
        }
      });
      
      setValidationErrors(groupedErrors);
      addToast({ type: "error", message: "No se puede cerrar la evolución. Hay campos obligatorios faltantes o inválidos." });
      return;
    }

    if (!data.notifyPolice) {
      const confirmPolice = await confirm({
        title: "Atención",
        message: "No ha seleccionado notificar a la policía. ¿Está seguro de continuar?",
        confirmText: "Continuar",
        cancelText: "Cancelar",
        type: "warning"
      });
      if (!confirmPolice) return;
    }

    const confirmClose = await confirm({
      title: "Firmar y Cerrar Evolución",
      message: "¿Está seguro de firmar y cerrar esta evolución? Una vez cerrada, NO podrá ser modificada por ningún usuario.",
      confirmText: "Cerrar Evolución",
      cancelText: "Cancelar",
      type: "danger"
    });
    if (!confirmClose) return;

    try {
      setValidationErrors({});
      // 1. Save all data first
      // @ts-ignore
      await updateEvolution.mutateAsync({ id: evolutionId!, payload: data });
      // 2. Trigger the close procedure (signatures, status change)
      await closeEvolution.mutateAsync(evolutionId!);
      addToast({ type: "success", message: "Evolución médica firmada y cerrada exitosamente." });
      navigate(`/pacientes/${patientId}/historia`);
    } catch (error) {
      console.error('Failed to close evolution', error);
      addToast({ type: "error", message: "Ocurrió un error al cerrar la evolución." });
    }
  };

  if (isLoading) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Cargando evolución...</div>;
  }

  if (!evolution) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}>Evolución no encontrada.</div>;
  }

  const tabs = [
    { label: "Motivo y Evento", icon: "icon-clipboard" },
    { label: "Signos Vitales", icon: "icon-heart" },
    { label: "Examen Físico", icon: "icon-user" },
    { label: "Diagnóstico", icon: "icon-search" },
    { label: "Alta Médica", icon: "icon-check" }
  ];

  return (
    <div style={{ padding: "var(--space-6) var(--space-8)", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <button 
            onClick={handleGoBack}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: 'var(--space-2)' }}
          >
            <Icon name="icon-chevron-left" size={16} /> Volver a Historia Clínica
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <h1 style={{ margin: 0 }}>Evolución Médica</h1>
            <span style={{ 
              fontSize: "0.875rem", 
              padding: "4px 12px", 
              borderRadius: "16px", 
              backgroundColor: isClosed ? 'var(--color-success-light)' : evolution.status === 'EN_PROCESO' ? 'var(--color-primary-light)' : 'var(--color-warning-light)',
              color: isClosed ? 'var(--color-success)' : evolution.status === 'EN_PROCESO' ? 'var(--color-primary)' : 'var(--color-warning)',
              fontWeight: 600
            }}>
              {evolution.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {!isClosed && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <WcButton variant="secondary" onClick={methods.handleSubmit(handleSaveDraft)} disabled={updateEvolution.isPending}>
              <Icon name="icon-save" size={16} />
              {updateEvolution.isPending ? 'Guardando...' : 'Guardar Temporalmente'}
            </WcButton>
            <WcButton variant="primary" onClick={handleCloseEvolution} disabled={closeEvolution.isPending || updateEvolution.isPending}>
              <Icon name="icon-check" size={16} />
              {closeEvolution.isPending ? 'Cerrando...' : 'Firmar y Cerrar Evolución'}
            </WcButton>
          </div>
        )}
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <div style={{ backgroundColor: 'var(--color-danger-light)', border: '1px solid var(--color-danger)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          <h4 style={{ color: 'var(--color-danger)', margin: '0 0 var(--space-4) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="icon-alert-circle" size={16} />
            Errores de validación (Requeridos para cerrar)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {Object.entries(validationErrors).map(([tabName, data], i) => (
              <div key={i} style={{ paddingLeft: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-1)' }}>
                  <strong style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{tabName}</strong>
                  <button 
                    onClick={() => setActiveTab(data.tabIndex)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    Ir a la pestaña
                  </button>
                </div>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', color: 'var(--color-danger)' }}>
                  {data.messages.map((err, j) => (
                    <li key={j} style={{ fontSize: '0.875rem' }}>{err}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        display: 'flex',
        minHeight: '600px',
        opacity: isClosed ? 0.8 : 1,
        pointerEvents: isClosed ? 'none' : 'auto'
      }}>
        
        {/* Sidebar Tabs */}
        <div style={{ 
          width: '240px', 
          borderRight: '1px solid var(--color-border)', 
          backgroundColor: 'var(--color-bg)',
          padding: 'var(--space-4)',
          pointerEvents: 'auto' // Allow changing tabs even if closed
        }}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                border: 'none',
                background: activeTab === index ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === index ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === index ? 600 : 400,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 'var(--space-1)',
                transition: 'all 0.2s'
              }}
            >
              <Icon name={tab.icon as any} size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <FormProvider {...methods}>
            <form id="evolution-form" onSubmit={(e) => e.preventDefault()} style={{ flex: 1 }}>
              
              {activeTab === 0 && <TabMotivo />}
              {activeTab === 1 && <TabSignosVitales />}
              {activeTab === 2 && <TabExamen />}
              {activeTab === 3 && <TabDiagnostico />}
              {activeTab === 4 && <TabAlta />}

            </form>
          </FormProvider>

          {/* Footer Navigation */}
          <div style={{ 
            marginTop: 'var(--space-6)', 
            paddingTop: 'var(--space-6)', 
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            pointerEvents: 'auto'
          }}>
            <WcButton variant="secondary" onClick={prevTab} disabled={activeTab === 0}>
              Anterior
            </WcButton>
            
            {activeTab < tabs.length - 1 && (
              <WcButton variant="primary" onClick={nextTab}>
                Siguiente
              </WcButton>
            )}
          </div>
        </div>
      </div>
      {DialogComponent}

      {/* Unsaved Changes Blocker Modal */}
      {blocker.state === "blocked" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "450px", overflow: "hidden", border: "1px solid var(--color-border)",
            animation: "dialogIn 0.2s ease-out forwards"
          }}>
            <div style={{ padding: "var(--space-6)", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-warning-light)", color: "var(--color-warning)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4)" }}>
                <Icon name="icon-alert-triangle" size={24} />
              </div>
              <h3 style={{ margin: "0 0 var(--space-2) 0", fontSize: "1.125rem", color: "var(--color-text)", fontWeight: 600 }}>Cambios sin guardar</h3>
              <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                Tienes cambios en la evolución que no han sido guardados. ¿Qué deseas hacer?
              </p>
            </div>
            <div style={{ padding: "var(--space-4) var(--space-6)", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column", gap: "var(--space-3)", borderTop: "1px solid var(--color-border)" }}>
              <WcButton 
                variant="primary" 
                disabled={updateEvolution.isPending}
                onClick={async () => {
                  await handleSaveDraft(methods.getValues());
                  blocker.proceed();
                }}
              >
                {updateEvolution.isPending ? 'Guardando y saliendo...' : 'Guardar temporalmente y salir'}
              </WcButton>
              <WcButton 
                variant="danger" 
                disabled={updateEvolution.isPending}
                onClick={() => blocker.proceed()}
              >
                Salir sin guardar (perder cambios)
              </WcButton>
              <WcButton 
                variant="secondary" 
                disabled={updateEvolution.isPending}
                onClick={() => blocker.reset?.()}
              >
                Cancelar y quedarme aquí
              </WcButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
