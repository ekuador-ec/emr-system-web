import { useState } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { Cie10SearchInput } from "@/presentation/modules/patient/components/Patients/Cie10SearchInput";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { WcToggleChip } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/WcToggleChip";
import "./TabDiagnostico.css";

type DiagnosisType = "INGRESO" | "ALTA";

const CERTAINTY_OPTIONS = [
  { value: "PRESUNTIVO", label: "Presuntivo" },
  { value: "DEFINITIVO", label: "Definitivo" },
];

interface DiagnosisCardProps {
  index: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onMove: () => void;
  onRemove: () => void;
  moveLabel: string;
  variant: DiagnosisType;
}

function DiagnosisCard({
  index,
  expanded,
  onToggleExpanded,
  onMove,
  onRemove,
  moveLabel,
  variant,
}: DiagnosisCardProps) {
  const { control, register, setValue, watch } = useFormContext<UpdateEvolutionDraftFormValues>();
  const diag = watch(`diagnoses.${index}`);
  const cie10Code = diag?.cie10Code;
  const cie10Name = diag?.cie10Name;
  const description = diag?.description;
  const certainty = diag?.certainty;

  const summaryLabel = cie10Code
    ? `${cie10Code}${cie10Name ? ` — ${cie10Name}` : ""}`
    : description?.trim()
      ? description
      : "Diagnóstico sin código";

  return (
    <div className="diag-card" data-expanded={expanded ? "true" : "false"} data-variant={variant}>
      <button
        type="button"
        className="diag-card__summary"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-controls={`diag-card-body-${index}`}
      >
        <span className="diag-card__summary-main">
          <span className="diag-card__summary-code" title={summaryLabel}>
            {summaryLabel}
          </span>
          <span className="diag-card__summary-meta">
            {certainty ? (
              <span className="diag-card__certainty" data-certainty={certainty}>
                {certainty === "PRESUNTIVO" ? "Presuntivo" : "Definitivo"}
              </span>
            ) : null}
            {description && cie10Code ? <span title={description}>{description}</span> : null}
          </span>
        </span>
        <span className="diag-card__chevron" aria-hidden="true">
          <Icon name="icon-chevron-down" size={18} />
        </span>
      </button>

      {expanded ? (
        <div className="diag-card__body" id={`diag-card-body-${index}`}>
          <div>
            <label className="diag-card__field-label" htmlFor={`diag-cie10-${index}`}>
              Diagnóstico (CIE-10)
            </label>
            <Controller
              control={control}
              name={`diagnoses.${index}.cie10Id` as const}
              render={({ field }) => (
                <Cie10SearchInput
                  value={field.value}
                  onChange={field.onChange}
                  initialLabel={cie10Code && cie10Name ? `${cie10Code} - ${cie10Name}` : undefined}
                  onDescriptionSelect={(desc) => {
                    setValue(`diagnoses.${index}.description` as const, desc, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
              )}
            />
          </div>

          <div>
            <label className="diag-card__field-label" htmlFor={`diag-desc-${index}`}>
              Descripción / Observaciones
            </label>
            <input
              id={`diag-desc-${index}`}
              type="text"
              className="diag-card__field-input"
              placeholder="Descripción adicional del diagnóstico..."
              {...register(`diagnoses.${index}.description` as const)}
            />
          </div>

          <div>
            <span className="diag-card__field-label">Certeza</span>
            <Controller
              control={control}
              name={`diagnoses.${index}.certainty` as const}
              render={({ field }) => (
                <WcToggleChip
                  value={(field.value as string) ?? "PRESUNTIVO"}
                  onChange={(next) => field.onChange(next)}
                  options={CERTAINTY_OPTIONS}
                  size="sm"
                />
              )}
            />
          </div>

          <div className="diag-card__actions">
            <WcButton variant="secondary" onClick={onMove}>
              <Icon name={variant === "INGRESO" ? "icon-arrow-right" : "icon-arrow-left"} size={16} />
              {moveLabel}
            </WcButton>
            <div className="diag-card__actions-right">
              <WcButtonIcon
                variant="danger"
                shape="square"
                size="sm"
                onClick={onRemove}
                aria-label="Eliminar diagnóstico"
              >
                <Icon name="icon-trash" size={16} />
              </WcButtonIcon>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface DiagnosisColumnProps {
  variant: DiagnosisType;
  title: string;
  icon: string;
  indices: number[];
  expandedSet: Set<number>;
  onToggleExpanded: (index: number) => void;
  onAdd: () => void;
  onMove: (index: number) => void;
  onRemove: (index: number) => void;
  moveLabel: string;
  emptyMessage: string;
}

function DiagnosisColumn({
  variant,
  title,
  icon,
  indices,
  expandedSet,
  onToggleExpanded,
  onAdd,
  onMove,
  onRemove,
  moveLabel,
  emptyMessage,
}: DiagnosisColumnProps) {
  return (
    <div className="diag-column" data-variant={variant === "INGRESO" ? "ingreso" : "alta"}>
      <div className="diag-column__header">
        <h3 className="diag-column__title">
          <span className="diag-column__title-pill" aria-hidden="true">
            <Icon name={icon} size={14} />
          </span>
          {title}
          <span className="diag-column__count">{indices.length}</span>
        </h3>
        <WcButton variant="terciary" onClick={onAdd}>
          <Icon name="icon-add" size={16} />
          Agregar
        </WcButton>
      </div>

      {indices.length === 0 ? (
        <div className="diag-column__empty">
          <Icon name="icon-diagnostic-medical" size={28} />
          <span>{emptyMessage}</span>
        </div>
      ) : (
        <div className="diag-column__list">
          {indices.map((index) => (
            <DiagnosisCard
              key={index}
              index={index}
              expanded={expandedSet.has(index)}
              onToggleExpanded={() => onToggleExpanded(index)}
              onMove={() => onMove(index)}
              onRemove={() => onRemove(index)}
              moveLabel={moveLabel}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TabDiagnostico() {
  const { control, watch, setValue } = useFormContext<UpdateEvolutionDraftFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "diagnoses",
  });

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const ingresoIndices: number[] = [];
  const altaIndices: number[] = [];
  fields.forEach((_, index) => {
    const type = watch(`diagnoses.${index}.type`);
    if (type === "ALTA") altaIndices.push(index);
    else ingresoIndices.push(index);
  });

  const handleAdd = (type: DiagnosisType) => {
    append({
      type,
      certainty: "PRESUNTIVO",
      cie10Id: "",
      description: "",
    });
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(fields.length);
      return next;
    });
  };

  const handleMove = (index: number, to: DiagnosisType) => {
    setValue(`diagnoses.${index}.type` as const, to, { shouldDirty: true });
  };

  const handleRemove = (index: number) => {
    remove(index);
    setExpanded((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  return (
    <div className="diagnoses-tab">
      <DiagnosisColumn
        variant="INGRESO"
        title="Diagnósticos de Ingreso"
        icon="icon-arrow-right"
        indices={ingresoIndices}
        expandedSet={expanded}
        onToggleExpanded={toggleExpanded}
        onAdd={() => handleAdd("INGRESO")}
        onMove={(i) => handleMove(i, "ALTA")}
        onRemove={handleRemove}
        moveLabel="Mover a Alta"
        emptyMessage="Sin diagnósticos de ingreso. Agrega el primero."
      />

      <DiagnosisColumn
        variant="ALTA"
        title="Diagnósticos de Alta"
        icon="icon-arrow-left"
        indices={altaIndices}
        expandedSet={expanded}
        onToggleExpanded={toggleExpanded}
        onAdd={() => handleAdd("ALTA")}
        onMove={(i) => handleMove(i, "INGRESO")}
        onRemove={handleRemove}
        moveLabel="Mover a Ingreso"
        emptyMessage="Sin diagnósticos de alta. Agrega el primero."
      />
    </div>
  );
}
