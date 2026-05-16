import { Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import type { UpdateEvolutionDraftFormValues } from "../../schemas/evolution.schema";
import type {
  AirwayStatus,
  GeneralCondition,
  InjuryMarker,
  InjuryType,
  PhysicalExamRegion,
} from "@/domain/modules/evolution/models/Evolution";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { WcCheckbox } from "@/presentation/modules/shared/components/ui/webcomponents/Checkbox/WcCheckbox";
import {
  WcField,
  WcFormGrid,
  WcFormSection,
} from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import {
  WcInput,
  WcSelect,
} from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";
import { WcTextareaExpand } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs/wcTextareaExpand";
import { BodyDiagramEditor } from "@/presentation/modules/evolution/components/body-diagram/BodyDiagram";
import "./TabExamen.css";

const SYSTEM_REVIEW_COMBOS: Array<{
  airwayStatus: AirwayStatus;
  generalCondition: GeneralCondition;
}> = [
  { airwayStatus: "VIA_AEREA_LIBRE", generalCondition: "CONDICION_ESTABLE" },
  { airwayStatus: "VIA_AEREA_LIBRE", generalCondition: "CONDICION_INESTABLE" },
  { airwayStatus: "VIA_AEREA_OBSTRUIDA", generalCondition: "CONDICION_ESTABLE" },
  { airwayStatus: "VIA_AEREA_OBSTRUIDA", generalCondition: "CONDICION_INESTABLE" },
];

const AIRWAY_OPTIONS = [
  { value: "VIA_AEREA_LIBRE", label: "Vía aérea libre" },
  { value: "VIA_AEREA_OBSTRUIDA", label: "Vía aérea obstruida" },
];

const GENERAL_CONDITION_OPTIONS = [
  { value: "CONDICION_ESTABLE", label: "Estable" },
  { value: "CONDICION_INESTABLE", label: "Inestable" },
];

const REGION_OPTIONS = [
  { value: "CABEZA", label: "Cabeza" },
  { value: "CUELLO", label: "Cuello" },
  { value: "TORAX", label: "Tórax" },
  { value: "ABDOMEN", label: "Abdomen" },
  { value: "COLUMNA", label: "Columna" },
  { value: "PELVIS", label: "Pelvis" },
  { value: "EXTREMIDADES", label: "Extremidades" },
  { value: "OTRO", label: "Otro" },
];

const INJURY_OPTIONS = [
  { value: "HERIDA_PENETRANTE", label: "Herida Penetrante" },
  { value: "HERIDA_CORTANTE", label: "Herida Cortante" },
  { value: "FRACTURA_CERRADA", label: "Fractura Cerrada" },
  { value: "CUERPO_EXTRANO", label: "Cuerpo Extraño" },
  { value: "HEMORRAGIA", label: "Hemorragia" },
  { value: "MORDEDURA", label: "Mordedura" },
  { value: "PICADURA", label: "Picadura" },
  { value: "EXCORIACION", label: "Excoriación" },
  { value: "DEFORMIDAD_MASA", label: "Deformidad o Masa" },
  { value: "HEMATOMA", label: "Hematoma" },
  { value: "ERITEMA_INFLAMACION", label: "Eritema / Inflamación" },
  { value: "LUXACION_ESGUINCE", label: "Luxación / Esguince" },
  { value: "QUEMADURA", label: "Quemadura" },
  { value: "OTRO", label: "Otro" },
];

const ROW_CARD_STYLE = {
  backgroundColor: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-3)",
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--space-3)",
};

const ROW_HEADER_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-2)",
  paddingBottom: "var(--space-2)",
  borderBottom: "1px dashed var(--color-border)",
};

const ROW_TITLE_STYLE = {
  margin: 0,
  fontFamily: "var(--font-heading)",
  fontSize: "var(--font-size-xs)",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const EMPTY_STATE_STYLE = {
  color: "var(--color-text-secondary)",
  fontSize: "0.875rem",
  margin: 0,
};

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function AutoResizeTextarea({ value, onChange, placeholder }: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autosize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    autosize(ref.current);
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value);
        autosize(event.target);
      }}
    />
  );
}

export function TabExamen() {
  const { control, register } = useFormContext<UpdateEvolutionDraftFormValues>();

  const {
    fields: systemsFields,
    append: appendSystem,
    remove: removeSystem,
  } = useFieldArray({ control, name: "systemsReview" });

  const {
    fields: examFields,
    append: appendExam,
    remove: removeExam,
  } = useFieldArray({ control, name: "physicalExams" });

  const {
    fields: injuryFields,
    append: appendInjury,
    remove: removeInjury,
  } = useFieldArray({ control, name: "injuries" });

  const watchedSystems = useWatch({ control, name: "systemsReview" }) as
    | { airwayStatus?: AirwayStatus; generalCondition?: GeneralCondition }[]
    | undefined;

  const watchedInjuriesRaw = useWatch({ control, name: "injuries" }) as
    | { injuryType?: InjuryType; description?: string | null; marker?: InjuryMarker | null }[]
    | undefined;
  const watchedInjuries = watchedInjuriesRaw ?? [];

  const availableCombos = SYSTEM_REVIEW_COMBOS.filter(
    (combo) =>
      !(watchedSystems ?? []).some(
        (row) =>
          row.airwayStatus === combo.airwayStatus &&
          row.generalCondition === combo.generalCondition,
      ),
  );

  const canAddSystem = availableCombos.length > 0;

  const handleAppendSystem = () => {
    const nextCombo = availableCombos[0] ?? SYSTEM_REVIEW_COMBOS[0];
    appendSystem({
      airwayStatus: nextCombo.airwayStatus,
      generalCondition: nextCombo.generalCondition,
      description: "",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <WcFormSection
        title="Revisión por sistemas"
        subtitle="Cada fila combina el estado de la vía aérea y la condición general, con una descripción única."
        actions={
          <WcButton
            variant="terciary"
            onClick={handleAppendSystem}
            disabled={!canAddSystem}
          >
            <Icon name="icon-add" size={16} /> Agregar combinación
          </WcButton>
        }
      >
        {systemsFields.length === 0 ? (
          <p style={EMPTY_STATE_STYLE}>
            No hay revisiones registradas. Haz clic en "Agregar combinación".
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {systemsFields.map((field, index) => (
              <div key={field.id} style={ROW_CARD_STYLE}>
                <div style={ROW_HEADER_STYLE}>
                  <h4 style={ROW_TITLE_STYLE}>Combinación {index + 1}</h4>
                  <WcButtonIcon
                    variant="danger"
                    shape="square"
                    size="sm"
                    onClick={() => removeSystem(index)}
                    aria-label={`Eliminar combinación ${index + 1}`}
                  >
                    <Icon name="icon-trash" size={16} />
                  </WcButtonIcon>
                </div>
                <WcFormGrid columns={2}>
                  <WcField label="Vía aérea">
                    <Controller
                      control={control}
                      name={`systemsReview.${index}.airwayStatus` as const}
                      render={({ field: f }) => (
                        <WcSelect
                          value={f.value ?? null}
                          onChange={(value) => f.onChange(value as AirwayStatus)}
                          options={AIRWAY_OPTIONS}
                        />
                      )}
                    />
                  </WcField>
                  <WcField label="Condición general">
                    <Controller
                      control={control}
                      name={`systemsReview.${index}.generalCondition` as const}
                      render={({ field: f }) => (
                        <WcSelect
                          value={f.value ?? null}
                          onChange={(value) => f.onChange(value as GeneralCondition)}
                          options={GENERAL_CONDITION_OPTIONS}
                        />
                      )}
                    />
                  </WcField>
                  <WcField label="Descripción" spanFull>
                    <Controller
                      control={control}
                      name={`systemsReview.${index}.description` as const}
                      render={({ field: f }) => (
                        <WcTextareaExpand
                          value={f.value ?? ""}
                          onChange={f.onChange}
                          placeholder="Hallazgos clínicos, manejo aplicado..."
                          minRows={2}
                          maxRows={5}
                          label="Descripción"
                        />
                      )}
                    />
                  </WcField>
                </WcFormGrid>
              </div>
            ))}
          </div>
        )}
      </WcFormSection>

      <WcFormSection
        title="Examen físico"
        actions={
          <WcButton
            variant="terciary"
            onClick={() =>
              appendExam({ region: "OTRO", hasPathology: false, description: "" })
            }
          >
            <Icon name="icon-add" size={16} /> Agregar
          </WcButton>
        }
      >
        {examFields.length === 0 ? (
          <p style={EMPTY_STATE_STYLE}>
            No hay exámenes registrados. Haz clic en "Agregar".
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {examFields.map((field, index) => (
              <div key={field.id} style={ROW_CARD_STYLE}>
                <div style={ROW_HEADER_STYLE}>
                  <h4 style={ROW_TITLE_STYLE}>Región {index + 1}</h4>
                  <WcButtonIcon
                    variant="danger"
                    shape="square"
                    size="sm"
                    onClick={() => removeExam(index)}
                    aria-label={`Eliminar región ${index + 1}`}
                  >
                    <Icon name="icon-trash" size={16} />
                  </WcButtonIcon>
                </div>
                <WcFormGrid columns={3}>
                  <WcField label="Región">
                    <Controller
                      control={control}
                      name={`physicalExams.${index}.region` as const}
                      render={({ field: f }) => (
                        <WcSelect
                          value={f.value ?? null}
                          onChange={(value) => f.onChange(value as PhysicalExamRegion)}
                          options={REGION_OPTIONS}
                        />
                      )}
                    />
                  </WcField>
                  <WcField label="Estado">
                    <WcCheckbox
                      {...register(`physicalExams.${index}.hasPathology` as const)}
                      label="Con Patología (CP)"
                    />
                  </WcField>
                  <WcField label="Hallazgos">
                    <WcInput
                      type="text"
                      placeholder="Descripción de la patología..."
                      {...register(`physicalExams.${index}.description` as const)}
                    />
                  </WcField>
                </WcFormGrid>
              </div>
            ))}
          </div>
        )}
      </WcFormSection>

      <WcFormSection
        title="Lesiones"
        subtitle="Marca en el diagrama corporal la ubicación de cada lesión. Cada click crea una nueva fila numerada."
      >
        <div className="tab-examen-injuries">
          <div className="tab-examen-injuries__diagram">
            <BodyDiagramEditor
              markers={(() => {
                const visible: Array<{ marker: InjuryMarker; number: number }> = [];
                watchedInjuries.forEach((injury, index) => {
                  if (injury?.marker) {
                    visible.push({ marker: injury.marker, number: index + 1 });
                  }
                });
                return visible;
              })()}
              onAddMarker={(marker) => {
                appendInjury({
                  injuryType: "OTRO",
                  description: "",
                  marker,
                });
              }}
              onRemoveMarker={(visibleIndex) => {
                let cursor = -1;
                for (let i = 0; i < watchedInjuries.length; i += 1) {
                  if (watchedInjuries[i]?.marker) {
                    cursor += 1;
                    if (cursor === visibleIndex) {
                      removeInjury(i);
                      return;
                    }
                  }
                }
              }}
            />
          </div>

          <div className="tab-examen-injuries__list">
            {injuryFields.length === 0 ? (
              <p className="tab-examen-injuries__empty">
                Sin lesiones registradas. Marca en el diagrama para agregar una.
              </p>
            ) : (
              injuryFields.map((field, index) => (
                <div key={field.id} className="tab-examen-injury-row">
                  <div className="tab-examen-injury-row__number">{index + 1}</div>
                  <div className="tab-examen-injury-row__type">
                    <Controller
                      control={control}
                      name={`injuries.${index}.injuryType` as const}
                      render={({ field: f }) => (
                        <WcSelect
                          value={f.value ?? null}
                          onChange={(value) => f.onChange(value as InjuryType)}
                          options={INJURY_OPTIONS}
                        />
                      )}
                    />
                  </div>
                  <div className="tab-examen-injury-row__description">
                    <Controller
                      control={control}
                      name={`injuries.${index}.description` as const}
                      render={({ field: f }) => (
                        <AutoResizeTextarea
                          value={f.value ?? ""}
                          onChange={f.onChange}
                          placeholder="Descripción (ej. 5 cm en región frontal derecha)"
                        />
                      )}
                    />
                  </div>
                  <div className="tab-examen-injury-row__delete">
                    <WcButtonIcon
                      variant="danger"
                      shape="square"
                      size="sm"
                      onClick={() => removeInjury(index)}
                      aria-label={`Eliminar lesión ${index + 1}`}
                    >
                      <Icon name="icon-trash" size={14} />
                    </WcButtonIcon>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </WcFormSection>
    </div>
  );
}
