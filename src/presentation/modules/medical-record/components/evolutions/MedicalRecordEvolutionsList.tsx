import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useEvolutionsByMedicalRecord,
  useCreateEvolution,
} from "@/presentation/modules/evolution/hooks/useEvolutions";
import {
  useForm005ByMedicalRecord,
  useCreateForm005,
} from "@/presentation/modules/form005/hooks/useForm005";
import { useEvolutionUIStore } from "@/presentation/modules/evolution/stores/useEvolutionUIStore";
import { useForm005UIStore } from "@/presentation/modules/form005/stores/useForm005UIStore";
import { getDocumentDefinition } from "@/presentation/modules/document/registry/documentRegistry";
import { DocumentTypeMenu } from "@/presentation/modules/document/components/DocumentTypeMenu";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import WcTag from "@/presentation/modules/shared/components/ui/webcomponents/Tags/wcTag";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";

interface MedicalRecordEvolutionsListProps {
  medicalRecordId: string;
}

interface UnifiedDocumentRow {
  id: string;
  type: DocumentType;
  status: "ABIERTA" | "EN_PROCESO" | "CERRADA";
  attentionDate: string | null;
  attentionTime: string | null;
  openedByName?: string | null;
  createdAt: string;
}

export function MedicalRecordEvolutionsList({ medicalRecordId }: MedicalRecordEvolutionsListProps) {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const { data: evolutions, isLoading: isLoading008 } =
    useEvolutionsByMedicalRecord(medicalRecordId);
  const { data: form005Documents, isLoading: isLoading005 } =
    useForm005ByMedicalRecord(medicalRecordId);
  const createEvolution = useCreateEvolution();
  const createForm005 = useCreateForm005();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();
  const openReadOnlyEvolution = useEvolutionUIStore((state) => state.openReadOnlyEvolution);
  const openReadOnlyForm005 = useForm005UIStore((state) => state.openReadOnlyForm005);

  const isLoading = isLoading008 || isLoading005;
  const isCreating = createEvolution.isPending || createForm005.isPending;

  const documents = useMemo<UnifiedDocumentRow[]>(() => {
    const list: UnifiedDocumentRow[] = [];
    (evolutions ?? []).forEach((ev) => {
      list.push({
        id: ev.id,
        type: "FORM_008",
        status: ev.status,
        attentionDate: ev.attentionDate,
        attentionTime: ev.attentionTime,
        openedByName: ev.openedByName,
        createdAt: ev.createdAt,
      });
    });
    (form005Documents ?? []).forEach((doc) => {
      const lastEntry = doc.entries && doc.entries.length > 0 ? doc.entries[doc.entries.length - 1] : null;
      list.push({
        id: doc.id,
        type: "FORM_005",
        status: doc.status,
        attentionDate: lastEntry?.attentionDate ?? null,
        attentionTime: lastEntry?.attentionTime ?? null,
        openedByName: doc.openedByName,
        createdAt: doc.createdAt,
      });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [evolutions, form005Documents]);

  const handleNewDocument = async (type: DocumentType) => {
    const def = getDocumentDefinition(type);
    const isConfirmed = await confirm({
      title: `Nuevo documento · ${def.shortLabel}`,
      message: `¿Desea abrir un nuevo documento (${def.shortLabel})? Se creará un borrador que podrá pausar y continuar luego.`,
      confirmText: "Crear documento",
      type: "primary",
    });
    if (!isConfirmed) return;

    try {
      const now = new Date();
      const attentionDate = now.toISOString().split("T")[0];
      const attentionTime = now.toTimeString().slice(0, 5);

      let newId: string;
      if (type === "FORM_005") {
        const created = await createForm005.mutateAsync({ medicalRecordId });
        newId = created.id;
      } else {
        const created = await createEvolution.mutateAsync({
          medicalRecordId,
          notifyPolice: false,
          requiresPoliceCustody: false,
          alcoholicBreath: false,
          deathInEmergency: false,
          attentionDate,
          attentionTime,
        });
        newId = created.id;
      }

      addToast({ type: "success", message: `Borrador de documento (${def.shortLabel}) creado.` });
      if (patientId) navigate(def.workspacePath(patientId, newId));
    } catch (error) {
      console.error("Failed to create new document", error);
      addToast({ type: "error", message: "Ocurrió un error al crear el documento." });
    }
  };

  const openReadOnly = (row: UnifiedDocumentRow) => {
    if (!patientId) return;
    if (row.type === "FORM_005") {
      openReadOnlyForm005({ patientId, documentId: row.id });
    } else {
      openReadOnlyEvolution({ patientId, evolutionId: row.id });
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
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontWeight: 700,
            color: "var(--color-text)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <Icon name="icon-clipboard" size={20} />
          Documentos Clínicos
        </h3>
        <DocumentTypeMenu
          label={isCreating ? "Creando..." : "Nuevo documento"}
          onSelect={handleNewDocument}
          disabled={isCreating}
        />
      </div>

      <div style={{ padding: "var(--space-6)" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--color-text-secondary)" }}>
            Cargando documentos...
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: "var(--space-10) var(--space-6)", textAlign: "center", color: "var(--color-text-secondary)" }}>
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
              Sin documentos registrados
            </p>
            <p style={{ margin: 0, fontSize: "0.85rem" }}>
              Los documentos clínicos de este paciente se mostrarán aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {documents.map((row) => {
              const def = getDocumentDefinition(row.type);
              return (
                <div
                  key={`${row.type}-${row.id}`}
                  onClick={() => patientId && navigate(def.workspacePath(patientId, row.id))}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-4)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    backgroundColor: "var(--color-bg)",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", flexWrap: "wrap" }}>
                      <WcTag variant="neutral" size="sm">
                        <Icon name={def.icon} size={12} />
                        {def.shortLabel}
                      </WcTag>
                      <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
                        {row.attentionDate ?? "Sin fecha"} {row.attentionTime?.slice(0, 5) ?? ""}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor:
                            row.status === "CERRADA"
                              ? "var(--color-success-light)"
                              : row.status === "EN_PROCESO"
                                ? "var(--color-primary-light)"
                                : "var(--color-warning-light)",
                          color:
                            row.status === "CERRADA"
                              ? "var(--color-success)"
                              : row.status === "EN_PROCESO"
                                ? "var(--color-primary)"
                                : "var(--color-warning)",
                          fontWeight: 600,
                        }}
                      >
                        {row.status.replace("_", " ")}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                      {row.openedByName ? `Dr. ${row.openedByName}` : "Médico Tratante"}
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
                        openReadOnly(row);
                      }}
                    />
                    <Icon name="icon-chevron-right" size={20} style={{ color: "var(--color-text-tertiary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {DialogComponent}
    </div>
  );
}
