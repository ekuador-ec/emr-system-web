import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateEvolutionDraftSchema,
  CloseEvolutionStrictSchema,
  type UpdateEvolutionDraftFormValues,
} from "../schemas/evolution.schema";
import { useEvolution, useUpdateEvolution, useCloseEvolution } from "../hooks/useEvolutions";
import { useEvolutionAutosave } from "../hooks/useEvolutionAutosave";
import { useEvolutionUIStore } from "../stores/useEvolutionUIStore";
import {
  clearDraft as clearLocalDraft,
  loadDraft as loadLocalDraft,
  saveDraft as saveLocalDraft,
} from "@/infrastructure/core/draftCache";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { UnsavedChangesModal } from "../components/UnsavedChangesModal";
import { EvolutionPatientBanner } from "../components/EvolutionPatientBanner";
import { EvolutionTabsNav } from "../components/EvolutionTabsNav";
import type { EvolutionNavTab } from "../components/EvolutionTabsNav";
import "./EvolutionWorkspacePage.css";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { EvolutionAiAssistant } from "@/presentation/modules/ai/components/EvolutionAiAssistant";

import { TabAdmision } from "../components/form/TabAdmision";
import { TabMotivo } from "../components/form/TabMotivo";
import { TabEmergenciaObstetrica } from "../components/form/TabEmergenciaObstetrica";
import { TabSignosVitales } from "../components/form/TabSignosVitales";
import { TabExamen } from "../components/form/TabExamen";
import { TabDiagnostico } from "../components/form/TabDiagnostico";
import { TabPlanTratamiento } from "../components/form/TabPlanTratamiento";
import { TabAlta } from "../components/form/TabAlta";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";

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
  { label: "Plan de Tratamiento", icon: "icon-edit", name: "Plan de Tratamiento" },
  { label: "Alta Médica", icon: "icon-house-medical", name: "Alta Médica" },
];

export function EvolutionWorkspacePage() {
  const { patientId, evolutionId } = useParams<{ patientId: string; evolutionId: string }>();
  const navigate = useNavigate();

  const { data: evolution, isLoading } = useEvolution(evolutionId || "");
  const { data: patient } = usePatient(patientId || "");
  const updateEvolution = useUpdateEvolution();
  const closeEvolution = useCloseEvolution();
  const { user } = useAuth();
  const canCloseEvolution = user?.role === "doctor" || user?.role === "admin";
  const { activeTab, setActiveTab, reset } = useEvolutionUIStore();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();
  const setSelectedPatientId = usePatientStore((state) => state.setSelectedPatientId);

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

    if (["treatmentPlans"].includes(field)) {
      return { tabName: "Plan de Tratamiento", tabIndex: 6 };
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
      return { tabName: "Alta Médica", tabIndex: 7 };
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
      treatmentPlans: [],
      discharges: [],
    },
  });

  // Watch the obstetric emergency flag from the form
  const isObstetricEmergency = useWatch({
    control: methods.control,
    name: "isObstetricEmergency",
  }) as boolean | undefined;

  // Load data when available. keepDirtyValues makes sure that fields the user
  // is actively editing are not blown away when the cache is invalidated after
  // an autosave, which would otherwise stomp on their in-progress edits.
  useEffect(() => {
    if (evolution) {
      methods.reset(
        {
          ...evolution,
          systemsReview: evolution.systemsReview || [],
          physicalExams: evolution.physicalExams || [],
          injuries: evolution.injuries || [],
          diagnoses: evolution.diagnoses || [],
          treatmentPlans: evolution.treatmentPlans || [],
          discharges: evolution.discharges || [],
        },
        { keepDirtyValues: true },
      );
    }
  }, [evolution, methods]);

  // Reset UI store ONLY when the workspace unmounts. Previously this cleanup
  // lived inside the data-loading effect, which made it fire on every
  // evolution refetch (e.g. after autosave invalidates the query) and bounced
  // the user back to the first tab in the middle of their edits.
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Offer to restore a locally cached draft (encrypted via session key) when
  // it is newer than the server copy. This recovers the user's work after a
  // failed autosave or a brutal browser refresh. Runs at most once per
  // evolution mount.
  const draftRestoreCheckedRef = useRef<string | null>(null);

  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!evolutionId || !evolution) return;
    if (draftRestoreCheckedRef.current === evolutionId) return;
    draftRestoreCheckedRef.current = evolutionId;

    const evolutionRef = evolution;

    (async () => {
      const cached = await loadLocalDraft<UpdateEvolutionDraftFormValues>(evolutionId);
      if (!cached) return;

      const cachedAt = new Date(cached.savedAt).getTime();
      const serverAt = new Date(evolutionRef.updatedAt).getTime();
      // The local cache writes every ~800 ms while the server only catches up
      // every few seconds, so the cache will almost always look "newer" by a
      // few hundred milliseconds even in the happy path. Only treat it as a
      // recovery scenario when the gap is wide enough to suggest the user
      // actually lost data (refresh / crash / offline gap).
      const RECOVERY_GAP_MS = 30_000;
      if (cachedAt - serverAt < RECOVERY_GAP_MS) {
        clearLocalDraft(evolutionId);
        return;
      }

      const restore = await confirm({
        title: "Cambios sin sincronizar",
        message:
          "Detectamos cambios locales más recientes que los guardados en el servidor. Probablemente la conexión se perdió o el navegador se cerró. ¿Deseas restaurarlos en este formulario?",
        confirmText: "Restaurar",
        cancelText: "Descartar",
        type: "warning",
      });

      if (restore) {
        methods.reset(cached.payload);
      } else {
        clearLocalDraft(evolutionId);
      }
    })();
  }, [evolutionId, evolution, confirm, methods]);

  const isClosed = evolution?.status === "CERRADA";
  const isDirty = methods.formState.isDirty;

  const autosave = useEvolutionAutosave({
    evolutionId,
    methods,
    enabled: Boolean(evolutionId) && !isClosed,
  });

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
      if (evolutionId) clearLocalDraft(evolutionId);
      addToast({
        type: "success",
        message: "Borrador guardado. Puedes seguir editando o salir sin perder los cambios.",
      });
    } catch (error) {
      console.error("Failed to save draft", error);
      addToast({
        type: "error",
        message:
          "No se pudo guardar en el servidor. Los cambios siguen seguros en este navegador.",
      });
    }
  };

  const handleCloseEvolution = async () => {
    if (!canCloseEvolution) {
      addToast({
        type: "warning",
        message: "Solo personal médico o administradores pueden firmar y cerrar una evolución.",
      });
      return;
    }

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
      await closeEvolution.mutateAsync({ id: evolutionId!, actorRole: user?.role });
      if (evolutionId) clearLocalDraft(evolutionId);
      addToast({ type: "success", message: "Evolución médica firmada y cerrada exitosamente." });
      navigate(`/pacientes/${patientId}/historia`);
    } catch (error) {
      console.error("Failed to close evolution", error);
      addToast({ type: "error", message: "Ocurrió un error al cerrar la evolución." });
    }
  };

  const isFemale = patient?.gender === "FEMENINO";

  const visibleTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (!tab.onlyForFemale) return true;
      // only show obstetric tab when patient is female AND the form flag is true
      return !!(isFemale && isObstetricEmergency);
    });
  }, [isFemale, isObstetricEmergency]);

  // Calculate progress
  const progressPercentage = useMemo(() => {
    return isClosed ? 100 : Math.round(((activeTab + 1) / visibleTabs.length) * 100);
  }, [activeTab, visibleTabs.length, isClosed]);

  const getVisibleTabIndex = (tabIndex: number) => {
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
      const newIndex = getActualTabIndex(Math.max(0, currentVisibleTabIndex - 1));
      setActiveTab(newIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTabs]);

  // Keyboard shortcuts: Ctrl+S (save draft), Alt+Left/Right (tab nav),
  // Alt+P (open patient detail drawer). Mod keys disabled while editing
  // inside a contenteditable so plain typing is never hijacked.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;

      const isMod = event.ctrlKey || event.metaKey;

      if (isMod && (event.key === "s" || event.key === "S")) {
        event.preventDefault();
        if (!isClosed) {
          void handleSaveDraft(methods.getValues());
        }
        return;
      }

      if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevTab();
        return;
      }

      if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        handleNextTab();
        return;
      }

      if (event.altKey && event.shiftKey && (event.key === "p" || event.key === "P")) {
        event.preventDefault();
        if (patient) setSelectedPatientId(patient.id);
        return;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClosed, methods, patient, activeTab, visibleTabs]);

  const tabComponents = [
    <TabAdmision key="admision" />,
    <TabMotivo key="motivo" />,
    <TabEmergenciaObstetrica key="obstetrica" />,
    <TabSignosVitales key="vitales" />,
    <TabExamen key="examen" />,
    <TabDiagnostico key="diagnostico" />,
    <TabPlanTratamiento key="plan" />,
    <TabAlta key="alta" />,
  ];

  const navTabs: EvolutionNavTab[] = visibleTabs.map((tab) => ({
    label: tab.label,
    icon: tab.icon,
    hasError: !!validationErrors[tab.name],
  }));

  const activeTabMeta = TABS[activeTab];

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
    <div className="evolution-workspace">
      <div ref={bannerRef} className="evolution-workspace__banner-wrapper">
        <EvolutionPatientBanner
        patient={patient}
        status={evolution.status}
        attentionDate={evolution.attentionDate}
        autosaveStatus={autosave.status}
        lastSavedAt={autosave.lastSavedAt}
        canCloseEvolution={canCloseEvolution}
        isClosed={isClosed}
        isSavingDraft={updateEvolution.isPending}
        isClosing={closeEvolution.isPending}
        onBack={handleGoBack}
        onOpenPatientDetail={() => {
          if (patient) setSelectedPatientId(patient.id);
        }}
        onSaveDraft={() => handleSaveDraft(methods.getValues())}
        onCloseEvolution={handleCloseEvolution}
        />
      </div>

      {!canCloseEvolution && !isClosed && (
        <p
          style={{
            margin: "0 0 var(--space-4) 0",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
          }}
        >
          Tu rol puede editar la evolución, pero solo personal médico o administradores pueden
          firmarla y cerrarla.
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "0 0 var(--space-3) 0",
        }}
      >
        <EvolutionAiAssistant evolutionId={evolution.id} />
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <div
          style={{
            backgroundColor: "var(--color-danger-light)",
            border: "1px solid var(--color-danger)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h4
            style={{
              color: "var(--color-danger)",
              margin: "0 0 var(--space-3) 0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Icon name="icon-alert-circle" size={16} />
            Errores de validación (Requeridos para cerrar)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {Object.entries(validationErrors).map(([tabName, data], i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                  }}
                >
                  <strong style={{ color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
                    {tabName}
                  </strong>
                  <button
                    onClick={() => setActiveTab(data.tabIndex)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-primary)",
                      textDecoration: "underline",
                      fontSize: "var(--font-size-xs)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Ir a la pestaña
                  </button>
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "var(--space-4)",
                    color: "var(--color-danger)",
                  }}
                >
                  {data.messages.map((err, j) => (
                    <li key={j} style={{ fontSize: "var(--font-size-xs)" }}>
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
        className="evolution-workspace__body"
        style={{
          opacity: isClosed ? 0.8 : 1,
          pointerEvents: isClosed ? "none" : "auto",
        }}
      >
        <aside className="evolution-workspace__sidebar">
          <EvolutionTabsNav
            tabs={navTabs}
            activeIndex={currentVisibleTabIndex >= 0 ? currentVisibleTabIndex : 0}
            onChange={(visibleIndex) => setActiveTab(getActualTabIndex(visibleIndex))}
          />
        </aside>

        <main className="evolution-workspace__main">
          {activeTabMeta ? (
            <div className="evolution-workspace__main-header">
              <div className="evolution-workspace__main-title">
                <Icon name={activeTabMeta.icon} size={20} />
                <h2>{activeTabMeta.label}</h2>
              </div>
              <span className="evolution-workspace__step">
                {`Paso ${Math.max(currentVisibleTabIndex + 1, 1)} de ${visibleTabs.length} · ${progressPercentage}%`}
              </span>
            </div>
          ) : null}

          <FormProvider {...methods}>
            <form id="evolution-form" onSubmit={(e) => e.preventDefault()}>
              <div className="evolution-workspace__main-body">
                {tabComponents[activeTab]}
              </div>
            </form>
          </FormProvider>

          <div className="evolution-workspace__footer">
            <WcButton
              variant="secondary"
              onClick={handlePrevTab}
              disabled={currentVisibleTabIndex <= 0}
            >
              <Icon name="icon-chevron-left" size={16} />
              Anterior
            </WcButton>

            {!isLastTab ? (
              <WcButton variant="primary" onClick={handleNextTab}>
                Siguiente
                <Icon name="icon-chevron-right" size={16} />
              </WcButton>
            ) : !isClosed && canCloseEvolution ? (
              <WcButton
                variant="primary"
                onClick={handleCloseEvolution}
                disabled={closeEvolution.isPending || updateEvolution.isPending}
              >
                <Icon name="icon-check" size={16} />
                Firmar y cerrar
              </WcButton>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        </main>
      </div>

      {DialogComponent}

      <UnsavedChangesModal
        isOpen={blocker.state === "blocked"}
        isPending={updateEvolution.isPending}
        onSaveAndExit={async () => {
          try {
            await handleSaveDraft(methods.getValues());
          } catch {
            if (evolutionId) {
              await saveLocalDraft(evolutionId, methods.getValues());
            }
          }
          blocker.proceed?.();
        }}
        onExitWithoutSaving={() => {
          if (evolutionId) clearLocalDraft(evolutionId);
          methods.reset(methods.getValues(), { keepValues: false });
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
