import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateEvolutionDraftSchema,
  CloseEvolutionStrictSchema,
  type UpdateEvolutionDraftFormValues,
} from "../schemas/evolution.schema";
import { useEvolution, useUpdateEvolution, useCloseEvolution } from "../hooks/useEvolutions";
import { useEvolutionUIStore } from "../stores/useEvolutionUIStore";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { UnsavedChangesModal } from "../components/UnsavedChangesModal";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";

import { TabAdmision } from "../components/form/TabAdmision";
import { TabMotivo } from "../components/form/TabMotivo";
import { TabEmergenciaObstetrica } from "../components/form/TabEmergenciaObstetrica";
import { TabSignosVitales } from "../components/form/TabSignosVitales";
import { TabExamen } from "../components/form/TabExamen";
import { TabDiagnostico } from "../components/form/TabDiagnostico";
import { TabAlta } from "../components/form/TabAlta";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";

const TABS = [
  { label: "Admisión", icon: "icon-hospital-user", name: "Registro de Admisión" },
  { label: "Motivo y Evento", icon: "icon-patient-list", name: "Motivo y Evento" },
  {
    label: "Emergencia Obstétrica",
    icon: "icon-mother-nurse",
    name: "Emergencia Obstétrica",
    onlyForFemale: true,
  },
  { label: "Signos Vitales", icon: "icon-ecg-heart", name: "Signos Vitales" },
  { label: "Examen Físico", icon: "icon-user-search", name: "Examen Físico" },
  { label: "Diagnóstico", icon: "icon-diagnostic-medical", name: "Diagnóstico" },
  { label: "Alta Médica", icon: "icon-house-medical", name: "Alta Médica" },
];

export function EvolutionWorkspacePage() {
  const { patientId, evolutionId } = useParams<{ patientId: string; evolutionId: string }>();
  const navigate = useNavigate();

  const { data: evolution, isLoading } = useEvolution(evolutionId || "");
  const { data: patient } = usePatient(patientId || "");
  const updateEvolution = useUpdateEvolution();
  const closeEvolution = useCloseEvolution();
  const { activeTab, setActiveTab, reset } = useEvolutionUIStore();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, { tabIndex: number; messages: string[] }>
  >({});

  // Helper to map field to tab
  const mapZodPathToTab = (path: (string | number)[]): { tabName: string; tabIndex: number } => {
    if (!path || path.length === 0) return { tabName: "General", tabIndex: 0 };
    const field = String(path[0]);

    if (
      [
        "arrivalMethod",
        "arrivalMethodObservations",
        "informationSource",
        "referringPerson",
        "contactNumber",
      ].includes(field)
    ) {
      return { tabName: "Registro de Admisión", tabIndex: 0 };
    }

    if (
      [
        "attentionDate",
        "attentionTime",
        "clinicalCause",
        "clinicalCauseDescription",
        "notifyPolice",
        "eventDateTime",
        "eventLocation",
        "eventAddress",
        "requiresPoliceCustody",
        "alcoholicBreath",
        "alcocheckValue",
        "accidentType",
        "violenceType",
        "intoxicationType",
        "eventObservations",
      ].includes(field)
    ) {
      return { tabName: "Motivo y Evento", tabIndex: 1 };
    }

    if (
      [
        "gestations",
        "parturitions",
        "abortions",
        "cesareans",
        "lastMenstruationDate",
        "gestationalWeeks",
        "fetalMovement",
        "fetalHeartRate",
        "rupturedMembranes",
        "rupturedTime",
        "uterineHeight",
        "presentation",
        "dilation",
        "effacement",
        "plane",
        "usefulPelvis",
        "vaginalBleeding",
        "contractions",
      ].includes(field)
    ) {
      return { tabName: "Emergencia Obstétrica", tabIndex: 2 };
    }

    if (
      [
        "bpRight",
        "bpLeft",
        "heartRate",
        "respiratoryRate",
        "temperature",
        "bmi",
        "weight",
        "height",
        "rightPupilReaction",
        "leftPupilReaction",
        "capillaryRefillTime",
        "oxygenSaturation",
        "glasgowOcular",
        "glasgowVerbal",
        "glasgowMotor",
        "glasgowTotal",
      ].includes(field)
    ) {
      return { tabName: "Signos Vitales", tabIndex: 3 };
    }

    if (["systemsReview", "physicalExams", "injuries"].includes(field)) {
      return { tabName: "Examen Físico", tabIndex: 4 };
    }

    if (["diagnoses"].includes(field)) {
      return { tabName: "Diagnóstico", tabIndex: 5 };
    }

    if (
      [
        "discharges",
        "incapacityDays",
        "referralService",
        "referralFacility",
        "deathInEmergency",
        "deathCause",
      ].includes(field)
    ) {
      return { tabName: "Alta Médica", tabIndex: 6 };
    }

    return { tabName: "General", tabIndex: 0 };
  };

  // We use the relaxed schema for the default resolver (draft saving)
  const methods = useForm<UpdateEvolutionDraftFormValues>({
    resolver: zodResolver(UpdateEvolutionDraftSchema),
    defaultValues: {
      medicalRecordId: "",
      notifyPolice: false,
      requiresPoliceCustody: false,
      alcoholicBreath: false,
      deathInEmergency: false,
      systemsReview: [],
      physicalExams: [],
      injuries: [],
      diagnoses: [],
      discharges: [],
    },
  });

  // Watch the obstetric emergency flag from the form
  const isObstetricEmergency = useWatch({
    control: methods.control,
    name: "isObstetricEmergency",
  }) as boolean | undefined;

  // Load data when available
  useEffect(() => {
    if (evolution) {
      methods.reset({
        ...evolution,
        systemsReview: evolution.systemsReview || [],
        physicalExams: evolution.physicalExams || [],
        injuries: evolution.injuries || [],
        diagnoses: evolution.diagnoses || [],
        discharges: evolution.discharges || [],
      });
    }
    return () => reset(); // Reset UI store on unmount
  }, [evolution, methods, reset]);

  const isClosed = evolution?.status === "CERRADA";
  const isDirty = methods.formState.isDirty;

  // Intercept React Router navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !isClosed && currentLocation.pathname !== nextLocation.pathname,
  );

  // Intercept Browser Close/Refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isClosed) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome to show prompt
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
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
        payload: {
          ...data,
          status: evolution?.status === "ABIERTA" ? "EN_PROCESO" : evolution?.status,
        },
      });
      methods.reset(data); // reset dirty state
      addToast({ type: "success", message: "Borrador guardado temporalmente." });
    } catch (error) {
      console.error("Failed to save draft", error);
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
      addToast({
        type: "error",
        message: "No se puede cerrar la evolución. Hay campos obligatorios faltantes o inválidos.",
      });

      // Auto-focus first error tab
      const firstErrorTabIndex = Object.values(groupedErrors)[0]?.tabIndex;
      if (firstErrorTabIndex !== undefined) {
        setActiveTab(firstErrorTabIndex);
      }
      return;
    }

    if (!data.notifyPolice) {
      // We only prompt if cause requires police but it wasn't checked.
      // Assuming handled by domain or simply warn. We'll keep existing behavior.
      const confirmPolice = await confirm({
        title: "Atención",
        message: "No ha seleccionado notificar a la policía. ¿Está seguro de continuar?",
        confirmText: "Continuar",
        cancelText: "Cancelar",
        type: "warning",
      });
      if (!confirmPolice) return;
    }

    const missingOptionalAdmissionInfo =
      !data.informationSource || !data.referringPerson || !data.contactNumber;
    if (missingOptionalAdmissionInfo) {
      const confirmAdmission = await confirm({
        title: "Atención",
        message:
          "Hay campos en el Registro de Admisión que no contienen información (Fuente de información, Persona que entrega, o Contacto). ¿Desea continuar y cerrar la evolución de todas formas?",
        confirmText: "Continuar",
        cancelText: "Cancelar",
        type: "warning",
      });
      if (!confirmAdmission) return;
    }

    const confirmClose = await confirm({
      title: "Firmar y Cerrar Evolución",
      message:
        "¿Está seguro de firmar y cerrar esta evolución? Una vez cerrada, NO podrá ser modificada por ningún usuario.",
      confirmText: "Cerrar Evolución",
      cancelText: "Cancelar",
      type: "danger",
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
      console.error("Failed to close evolution", error);
      addToast({ type: "error", message: "Ocurrió un error al cerrar la evolución." });
    }
  };

  const isFemale =
    (patient?.gender as unknown as string) === "Femenino" ||
    patient?.gender === "FEMENINO" ||
    (patient?.gender as unknown as string) === "F";

  const visibleTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (!tab.onlyForFemale) return true;
      // only show obstetric tab when patient is female AND the form flag is true
      return !!(isFemale && isObstetricEmergency);
    });
  }, [isFemale, isObstetricEmergency]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    // Simple mock logic: complete if visited or valid. Real logic would check fields.
    // For now we do a simple based on active tabs + errors.
    // This is an approximation.
    return isClosed ? 100 : Math.round(((activeTab + 1) / visibleTabs.length) * 100);
  }, [activeTab, visibleTabs.length, isClosed]);

  const getVisibleTabIndex = (tabIndex: number) => {
    // Find the index of the given global tab within the currently visible tabs
    return visibleTabs.findIndex((visibleTab) => visibleTab.label === TABS[tabIndex]?.label);
  };

  const getActualTabIndex = (visibleIndex: number) => {
    let count = 0;
    for (let i = 0; i < TABS.length; i++) {
      if (visibleTabs.some((vt) => vt.label === TABS[i].label)) {
        if (count === visibleIndex) return i;
        count++;
      }
    }
    return Math.max(0, TABS.length - 1);
  };

  const handlePrevTab = () => {
    const visibleIndex = getVisibleTabIndex(activeTab);
    if (visibleIndex > 0) {
      setActiveTab(getActualTabIndex(visibleIndex - 1));
    }
  };

  const handleNextTab = () => {
    const visibleIndex = getVisibleTabIndex(activeTab);
    if (visibleIndex < visibleTabs.length - 1) {
      setActiveTab(getActualTabIndex(visibleIndex + 1));
    }
  };

  const currentVisibleTabIndex = useMemo(
    () => getVisibleTabIndex(activeTab),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, visibleTabs],
  );
  const isLastTab = currentVisibleTabIndex === visibleTabs.length - 1;

  // If the currently active tab becomes hidden (e.g. user unticked obstetric flag), maintain safe tab
  useEffect(() => {
    const activeTabObj = TABS[activeTab];
    if (activeTabObj && !visibleTabs.find((t) => t.label === activeTabObj.label)) {
      // Find the closest valid tab before the removed one.
      const newIndex = getActualTabIndex(Math.max(0, currentVisibleTabIndex - 1));
      setActiveTab(newIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTabs]);

  const getTabStatusColor = (tabName: string, index: number) => {
    if (validationErrors[tabName]) return "var(--color-danger)";
    if (index === activeTab) return "var(--color-primary)";
    if (index < activeTab) return "var(--color-success)";
    return "var(--color-text-tertiary)"; // default unvisited
  };

  if (isLoading) {
    return (
      <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Cargando evolución...</div>
    );
  }

  if (!evolution) {
    return (
      <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}>
        Evolución no encontrada.
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-6) var(--space-8)", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--space-4)",
        }}
      >
        <div style={{ flex: 1 }}>
          <button
            onClick={handleGoBack}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: 0,
              marginBottom: "var(--space-2)",
            }}
          >
            <Icon name="icon-chevron-left" size={16} /> Volver a Historia Clínica
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Evolución Médica</h1>
            <span
              style={{
                fontSize: "0.875rem",
                padding: "4px 12px",
                borderRadius: "16px",
                backgroundColor: isClosed
                  ? "var(--color-success-light)"
                  : evolution.status === "EN_PROCESO"
                    ? "var(--color-primary-light)"
                    : "var(--color-warning-light)",
                color: isClosed
                  ? "var(--color-success)"
                  : evolution.status === "EN_PROCESO"
                    ? "var(--color-primary)"
                    : "var(--color-warning)",
                fontWeight: 600,
              }}
            >
              {evolution.status.replace("_", " ")}
            </span>
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              maxWidth: "400px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "8px",
                backgroundColor: "var(--color-border)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercentage}%`,
                  height: "100%",
                  backgroundColor: "var(--color-primary)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                fontWeight: 500,
              }}
            >
              {progressPercentage}% Completado
            </span>
          </div>
        </div>

        {!isClosed && (
          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "24px" }}>
            <WcButton
              variant="secondary"
              onClick={methods.handleSubmit(handleSaveDraft)}
              disabled={updateEvolution.isPending}
            >
              <Icon name="icon-save" size={16} />
              {updateEvolution.isPending ? "Guardando..." : "Guardar Temporalmente"}
            </WcButton>
            <WcButton
              variant="primary"
              onClick={handleCloseEvolution}
              disabled={closeEvolution.isPending || updateEvolution.isPending}
            >
              <Icon name="icon-check" size={16} />
              {closeEvolution.isPending ? "Cerrando..." : "Firmar y Cerrar Evolución"}
            </WcButton>
          </div>
        )}
      </div>

      {/* Sticky Tab Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--color-bg)",
          paddingTop: "var(--space-4)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "var(--space-6)",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none", // hide scrollbar for clean look
        }}
      >
        {TABS.map((tab, index) => {
          if (tab.onlyForFemale && !(isFemale && isObstetricEmergency)) return null;
          const hasError = !!validationErrors[tab.name];
          const statusColor = getTabStatusColor(tab.name, index);

          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                border: "none",
                background: activeTab === index ? "var(--color-surface)" : "transparent",
                borderBottom:
                  activeTab === index ? `3px solid ${statusColor}` : "3px solid transparent",
                color: activeTab === index ? "var(--color-text)" : "var(--color-text-secondary)",
                fontWeight: activeTab === index ? 600 : 500,
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <Icon name={tab.icon as any} size={18} />
              {tab.label}
              {hasError && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-danger)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <div
          style={{
            backgroundColor: "var(--color-danger-light)",
            border: "1px solid var(--color-danger)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-6)",
            animation: "fadeIn 0.3s",
          }}
        >
          <h4
            style={{
              color: "var(--color-danger)",
              margin: "0 0 var(--space-4) 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="icon-alert-circle" size={16} />
            Errores de validación (Requeridos para cerrar)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {Object.entries(validationErrors).map(([tabName, data], i) => (
              <div key={i} style={{ paddingLeft: "var(--space-2)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  <strong style={{ color: "var(--color-danger)", fontSize: "0.875rem" }}>
                    {tabName}
                  </strong>
                  <button
                    onClick={() => setActiveTab(data.tabIndex)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-primary)",
                      textDecoration: "underline",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Ir a la pestaña
                  </button>
                </div>
                <ul
                  style={{ margin: 0, paddingLeft: "var(--space-4)", color: "var(--color-danger)" }}
                >
                  {data.messages.map((err, j) => (
                    <li key={j} style={{ fontSize: "0.875rem" }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          opacity: isClosed ? 0.8 : 1,
          pointerEvents: isClosed ? "none" : "auto",
          minHeight: "500px",
        }}
      >
        {/* Form Content */}
        <FormProvider {...methods}>
          <form id="evolution-form" onSubmit={(e) => e.preventDefault()}>
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              {activeTab === 0 && <TabAdmision />}
              {activeTab === 1 && <TabMotivo />}
              {activeTab === 2 && isFemale && <TabEmergenciaObstetrica />}
              {activeTab === 3 && <TabSignosVitales />}
              {activeTab === 4 && <TabExamen />}
              {activeTab === 5 && <TabDiagnostico />}
              {activeTab === 6 && <TabAlta />}
            </div>
          </form>
        </FormProvider>

        {/* Footer Navigation */}
        <div
          style={{
            marginTop: "var(--space-8)",
            paddingTop: "var(--space-6)",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            pointerEvents: "auto",
          }}
        >
          <WcButton variant="secondary" onClick={handlePrevTab} disabled={activeTab === 0}>
            Anterior
          </WcButton>

          {!isLastTab ? (
            <WcButton variant="primary" onClick={handleNextTab}>
              Siguiente
            </WcButton>
          ) : (
            !isClosed && (
              <WcButton
                variant="primary"
                onClick={handleCloseEvolution}
                disabled={closeEvolution.isPending || updateEvolution.isPending}
              >
                <Icon name="icon-check" size={16} />
                Firmar y Cerrar
              </WcButton>
            )
          )}
        </div>
      </div>

      {DialogComponent}

      <UnsavedChangesModal
        isOpen={blocker.state === "blocked"}
        isPending={updateEvolution.isPending}
        onSaveAndExit={async () => {
          await handleSaveDraft(methods.getValues());
          blocker.proceed?.();
        }}
        onExitWithoutSaving={() => {
          blocker.proceed?.();
        }}
        onCancel={() => {
          blocker.reset?.();
        }}
      />
      <PatientDetailsDrawer />
    </div>
  );
}
