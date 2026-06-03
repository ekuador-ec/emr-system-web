import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { useForm, FormProvider, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form005EntrySchema,
  FORM005_ENTRY_DEFAULTS,
  type Form005EntryFormValues,
} from "../schemas/form005.schema";
import { useForm005, useCloseForm005 } from "../hooks/useForm005";
import { useForm005EntryAutosave, draftKeyFor } from "../hooks/useForm005EntryAutosave";
import { useForm005UIStore } from "../stores/useForm005UIStore";
import { Form005VitalsModal } from "../components/form/Form005VitalsModal";
import { loadDraft } from "@/infrastructure/core/draftCache";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { WcStatusBadge } from "@/presentation/modules/shared/components/ui/webcomponents/Badges/WcStatusBadge";
import { WcAutosavePill } from "@/presentation/modules/shared/components/ui/webcomponents/Badges/WcAutosavePill";
import { WcField } from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import { WcInput } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";
import { WcTextareaExpand } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/wcTextareaExpand";
import { UnsavedChangesModal } from "@/presentation/modules/evolution/components/UnsavedChangesModal";
import { PatientDetailsDrawer } from "@/presentation/modules/patient/components/Patients/PatientDetailsDrawer";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import { usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useAuth } from "@/presentation/modules/auth/hooks/useAuth";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";
import type { Form005Entry } from "@/domain/modules/form005/models/Form005Document";
import "./Form005WorkspacePage.css";

const VITAL_FIELDS = [
  "bpRight",
  "bpLeft",
  "heartRate",
  "respiratoryRate",
  "temperature",
  "weight",
  "height",
  "oxygenSaturation",
  "capillaryRefillTime",
  "rightPupilReaction",
  "leftPupilReaction",
  "glasgowTotal",
] as const;

function nowDefaults(): { attentionDate: string; attentionTime: string } {
  const now = new Date();
  return {
    attentionDate: now.toISOString().split("T")[0],
    attentionTime: now.toTimeString().slice(0, 5),
  };
}

function statusBadge(status: string): { variant: "success" | "warning" | "info"; label: string } {
  if (status === "CERRADA") return { variant: "success", label: "Cerrada" };
  if (status === "EN_PROCESO") return { variant: "info", label: "En proceso" };
  return { variant: "warning", label: "Abierta" };
}

function vitalsSummary(entry: Form005Entry): string[] {
  const chips: string[] = [];
  const bp = [entry.bpRight, entry.bpLeft].filter(Boolean).join(" / ");
  if (bp) chips.push(`PA ${bp}`);
  if (entry.heartRate != null) chips.push(`FC ${entry.heartRate}`);
  if (entry.respiratoryRate != null) chips.push(`FR ${entry.respiratoryRate}`);
  if (entry.temperature != null) chips.push(`T° ${entry.temperature}`);
  if (entry.oxygenSaturation != null) chips.push(`SatO₂ ${entry.oxygenSaturation}%`);
  if (entry.bmi != null) chips.push(`IMC ${entry.bmi}`);
  if (entry.glasgowTotal != null) chips.push(`Glasgow ${entry.glasgowTotal}`);
  return chips;
}

function firstEntryVitalsComplete(entry: Form005Entry | undefined): boolean {
  if (!entry) return false;
  return (
    Boolean(entry.bpRight || entry.bpLeft) &&
    entry.heartRate != null &&
    entry.respiratoryRate != null &&
    entry.temperature != null &&
    entry.oxygenSaturation != null
  );
}

function entryToFormValues(entry: Form005Entry): Form005EntryFormValues {
  return {
    attentionDate: entry.attentionDate,
    attentionTime: entry.attentionTime ? entry.attentionTime.slice(0, 5) : null,
    evolutionNote: entry.evolutionNote ?? "",
    prescriptions: entry.prescriptions ?? "",
    bpRight: entry.bpRight,
    bpLeft: entry.bpLeft,
    heartRate: entry.heartRate,
    respiratoryRate: entry.respiratoryRate,
    temperature: entry.temperature,
    bmi: entry.bmi,
    weight: entry.weight,
    height: entry.height,
    rightPupilReaction: entry.rightPupilReaction,
    leftPupilReaction: entry.leftPupilReaction,
    capillaryRefillTime: entry.capillaryRefillTime,
    oxygenSaturation: entry.oxygenSaturation,
    glasgowOcular: entry.glasgowOcular,
    glasgowVerbal: entry.glasgowVerbal,
    glasgowMotor: entry.glasgowMotor,
    glasgowTotal: entry.glasgowTotal,
  };
}

function VitalsButton({ onOpen, required }: { onOpen: () => void; required: boolean }) {
  const values = useWatch({ name: VITAL_FIELDS as unknown as string[] }) as unknown[];
  const filled = Array.isArray(values)
    ? values.filter((v) => v !== null && v !== undefined && v !== "").length
    : 0;

  return (
    <WcButton variant={filled > 0 ? "secondary" : required ? "primary" : "terciary"} onClick={onOpen}>
      <Icon name="icon-ecg-heart" size={16} />
      Signos vitales
      {filled > 0 ? ` (${filled})` : required ? " *" : ""}
    </WcButton>
  );
}

export function Form005WorkspacePage() {
  const { patientId, documentId } = useParams<{ patientId: string; documentId: string }>();
  const navigate = useNavigate();

  const { data: document005, isLoading, refetch } = useForm005(documentId || "");
  const { data: patient } = usePatient(patientId || "");
  const closeForm005 = useCloseForm005();
  const { user } = useAuth();
  const canClose = user?.role === "doctor" || user?.role === "admin";
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();
  const setSelectedPatientId = usePatientStore((state) => state.setSelectedPatientId);
  const openReadOnlyForm005 = useForm005UIStore((state) => state.openReadOnlyForm005);

  const entries = useMemo(() => document005?.entries ?? [], [document005]);
  const isClosed = document005?.status === "CERRADA";

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const methods = useForm<Form005EntryFormValues>({
    resolver: zodResolver(Form005EntrySchema),
    defaultValues: { ...FORM005_ENTRY_DEFAULTS, ...nowDefaults() },
  });

  const autosave = useForm005EntryAutosave({
    documentId,
    entryId: editingEntryId,
    methods,
    enabled: Boolean(documentId) && !isClosed,
    onEntryCreated: (id) => setEditingEntryId(id),
  });

  // Restore an encrypted local draft for the active target (recovers work
  // after a refresh / accidental close), at most once per target.
  const restoredTargetRef = useRef<string | null>(null);
  useEffect(() => {
    if (!documentId || isClosed) return;
    const targetKey = draftKeyFor(documentId, editingEntryId);
    if (restoredTargetRef.current === targetKey) return;
    restoredTargetRef.current = targetKey;
    (async () => {
      const cached = await loadDraft<Form005EntryFormValues>(targetKey);
      if (cached?.payload) methods.reset(cached.payload);
    })();
  }, [documentId, editingEntryId, isClosed, methods]);

  const pendingChanges = autosave.status === "dirty" || autosave.status === "saving";

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      pendingChanges && !isClosed && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingChanges && !isClosed) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pendingChanges, isClosed]);

  const editingIndex = editingEntryId ? entries.findIndex((e) => e.id === editingEntryId) : -1;
  const requiresVitals = editingEntryId ? editingIndex === 0 : entries.length === 0;
  const canEditEntry = (entry: Form005Entry) => !isClosed && entry.createdBy === user?.id;

  const startNew = async () => {
    await autosave.flush();
    setEditingEntryId(null);
    methods.reset({ ...FORM005_ENTRY_DEFAULTS, ...nowDefaults() });
  };

  const startEdit = async (entry: Form005Entry) => {
    await autosave.flush();
    setEditingEntryId(entry.id);
    methods.reset(entryToFormValues(entry));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClose = async () => {
    if (!canClose) {
      addToast({
        type: "warning",
        message: "Solo personal médico o administradores pueden firmar y cerrar el documento.",
      });
      return;
    }
    await autosave.flush();
    const fresh = await refetch();
    const freshEntries = fresh.data?.entries ?? entries;
    if (freshEntries.length === 0) {
      addToast({ type: "warning", message: "Registra al menos una atención antes de cerrar." });
      return;
    }
    if (!firstEntryVitalsComplete(freshEntries[0])) {
      addToast({
        type: "warning",
        message:
          "La primera atención debe tener signos vitales (PA, FC, FR, temperatura y SatO₂) para poder cerrar.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Firmar y Cerrar Documento",
      message:
        "¿Está seguro de firmar y cerrar este documento? Una vez cerrado, NO se podrán agregar ni editar atenciones.",
      confirmText: "Cerrar Documento",
      cancelText: "Cancelar",
      type: "danger",
    });
    if (!confirmed) return;

    try {
      await closeForm005.mutateAsync({ id: documentId!, actorRole: user?.role });
      addToast({ type: "success", message: "Documento firmado y cerrado exitosamente." });
      navigate(`/pacientes/${patientId}/historia`);
    } catch {
      addToast({ type: "error", message: "Ocurrió un error al cerrar el documento." });
    }
  };

  if (isLoading) {
    return <div style={{ padding: "var(--space-8)", textAlign: "center" }}>Cargando documento...</div>;
  }

  if (!document005) {
    return (
      <div style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-danger)" }}>
        Documento no encontrado.
      </div>
    );
  }

  const badge = statusBadge(document005.status);
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Cargando paciente…";

  return (
    <div className="f005-ws">
      <header className="f005-ws__header card">
        <button
          type="button"
          className="f005-ws__back"
          onClick={() => navigate(`/pacientes/${patientId}/historia`)}
        >
          <Icon name="icon-chevron-left" size={14} />
          Volver a Historia Clínica
        </button>

        <div className="f005-ws__header-row">
          <div className="f005-ws__patient">
            <span className="f005-ws__patient-name">{patientName}</span>
            {patient ? (
              <WcButton variant="terciary" onClick={() => setSelectedPatientId(patient.id)}>
                <Icon name="icon-see-details" size={14} />
                Ver información
              </WcButton>
            ) : null}
            <span className="f005-ws__form-tag">Formulario 005 · Evolución y Prescripciones</span>
          </div>

          <div className="f005-ws__header-actions">
            <WcStatusBadge variant={badge.variant} size="md">
              {badge.label}
            </WcStatusBadge>
            <WcButton
              variant="secondary"
              onClick={() => {
                if (patientId && documentId) openReadOnlyForm005({ patientId, documentId });
              }}
            >
              <Icon name="icon-eye" size={16} />
              Vista previa
            </WcButton>
            {!isClosed && canClose ? (
              <WcButton
                variant="primary"
                onClick={handleClose}
                disabled={closeForm005.isPending || entries.length === 0}
              >
                <Icon name="icon-check" size={16} />
                Firmar y cerrar
              </WcButton>
            ) : null}
          </div>
        </div>
        {!canClose && !isClosed ? (
          <p className="f005-ws__hint">
            Tu rol puede registrar atenciones, pero solo personal médico o administradores pueden
            firmar y cerrar el documento.
          </p>
        ) : null}
      </header>

      <section className="f005-ws__history card">
        <h3 className="f005-ws__section-title">
          <Icon name="icon-clipboard" size={18} />
          Historial de atenciones ({entries.length})
        </h3>
        {entries.length === 0 ? (
          <div className="f005-ws__empty">
            Aún no hay atenciones registradas. Completa la atención en el formulario inferior; se
            guarda automáticamente.
          </div>
        ) : (
          <div className="f005-ws__entries">
            {entries.map((entry, index) => {
              const chips = vitalsSummary(entry);
              const expanded = expandedIds.has(entry.id);
              const editable = canEditEntry(entry);
              const isEditingThis = editingEntryId === entry.id;
              const wasEdited =
                entry.updatedAt &&
                entry.createdAt &&
                new Date(entry.updatedAt).getTime() - new Date(entry.createdAt).getTime() > 1000;
              return (
                <article className={`f005-entry ${expanded ? "f005-entry--open" : ""}`} key={entry.id}>
                  <button
                    type="button"
                    className="f005-entry__toggle"
                    onClick={() => toggleExpand(entry.id)}
                    aria-expanded={expanded}
                  >
                    <Icon name={expanded ? "icon-chevron-down" : "icon-chevron-right"} size={16} />
                    <span className="f005-entry__index">#{index + 1}</span>
                    <span className="f005-entry__datetime">
                      <Icon name="icon-calendar-solid" size={13} />
                      {entry.attentionDate ?? "—"} {entry.attentionTime ? entry.attentionTime.slice(0, 5) : ""}
                    </span>
                    <span className="f005-entry__author">
                      <Icon name="icon-user" size={13} />
                      {entry.createdByName ?? "—"}
                      {wasEdited ? " · editada" : ""}
                    </span>
                    {isEditingThis ? <span className="f005-entry__editing">Editando…</span> : null}
                    {!expanded ? (
                      <span className="f005-entry__preview">{entry.evolutionNote?.trim() || "—"}</span>
                    ) : null}
                  </button>

                  {expanded ? (
                    <div className="f005-entry__detail">
                      {chips.length > 0 ? (
                        <div className="f005-entry__vitals">
                          {chips.map((chip) => (
                            <span className="f005-entry__chip" key={chip}>
                              {chip}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="f005-entry__cols">
                        <div className="f005-entry__col">
                          <span className="f005-entry__col-label">Evolución</span>
                          <p className="f005-entry__text">{entry.evolutionNote?.trim() || "—"}</p>
                        </div>
                        <div className="f005-entry__col">
                          <span className="f005-entry__col-label">Prescripciones</span>
                          <p className="f005-entry__text">{entry.prescriptions?.trim() || "—"}</p>
                        </div>
                      </div>
                      {editable && !isEditingThis ? (
                        <div className="f005-entry__actions">
                          <WcButton variant="secondary" onClick={() => void startEdit(entry)}>
                            <Icon name="icon-edit" size={14} />
                            Editar
                          </WcButton>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {!isClosed ? (
        <section className="f005-ws__new card" ref={formRef}>
          <div className="f005-ws__new-header">
            <h3 className="f005-ws__section-title">
              <Icon name={editingEntryId ? "icon-edit" : "icon-add-file"} size={18} />
              {editingEntryId ? `Editar atención #${editingIndex + 1}` : "Nueva atención"}
              {requiresVitals ? (
                <span className="f005-ws__first-hint">Signos vitales obligatorios en la primera atención</span>
              ) : null}
            </h3>
            <div className="f005-ws__new-tools">
              <WcAutosavePill status={autosave.status} lastSavedAt={autosave.lastSavedAt} />
              <WcButton variant="terciary" onClick={() => void autosave.flush()}>
                <Icon name="icon-save" size={14} />
                Guardar ahora
              </WcButton>
              <WcButton variant="secondary" onClick={() => void startNew()}>
                <Icon name="icon-plus-solid" size={14} />
                Nueva atención
              </WcButton>
            </div>
          </div>

          <p className="f005-ws__autosave-note">
            Los cambios se guardan automáticamente. Una atención se registra en cuanto escribes su
            nota de evolución; puedes seguir editándola mientras el documento esté abierto.
          </p>

          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="f005-new-grid">
                <div className="f005-new-col f005-new-col--meta">
                  <WcField label="Fecha">
                    <WcInput type="date" {...methods.register("attentionDate")} />
                  </WcField>
                  <WcField label="Hora">
                    <WcInput type="time" {...methods.register("attentionTime")} />
                  </WcField>
                  <VitalsButton onOpen={() => setIsVitalsModalOpen(true)} required={requiresVitals} />
                </div>

                <div className="f005-new-col">
                  <WcField label="Evolución (notas de evolución)">
                    <Controller
                      control={methods.control}
                      name="evolutionNote"
                      render={({ field }) => (
                        <WcTextareaExpand
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value)}
                          placeholder="Describa el progreso clínico, anamnesis, examen y diagnóstico..."
                          minRows={6}
                          maxRows={14}
                          label="Evolución"
                        />
                      )}
                    />
                  </WcField>
                </div>

                <div className="f005-new-col">
                  <WcField label="Prescripciones">
                    <Controller
                      control={methods.control}
                      name="prescriptions"
                      render={({ field }) => (
                        <WcTextareaExpand
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value)}
                          placeholder="Farmacoterapia e indicaciones para enfermería u otro personal..."
                          minRows={6}
                          maxRows={14}
                          label="Prescripciones"
                        />
                      )}
                    />
                  </WcField>
                </div>
              </div>

              <Form005VitalsModal
                isOpen={isVitalsModalOpen}
                onClose={() => setIsVitalsModalOpen(false)}
                required={requiresVitals}
              />
            </form>
          </FormProvider>
        </section>
      ) : null}

      {DialogComponent}

      <UnsavedChangesModal
        isOpen={blocker.state === "blocked"}
        isPending={autosave.status === "saving"}
        onSaveAndExit={async () => {
          await autosave.flush();
          blocker.proceed?.();
        }}
        onExitWithoutSaving={() => {
          blocker.proceed?.();
        }}
        onCancel={() => blocker.reset?.()}
      />
      <PatientDetailsDrawer />
    </div>
  );
}
