import { Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { WcFormSection } from "@/presentation/modules/shared/components/ui/webcomponents/Forms";
import { WcSelect } from "@/presentation/modules/shared/components/ui/webcomponents/Inputs";
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

const ROW_CONTAINER_STYLE = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--space-6)",
};

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  modalTitle?: string;
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  modalTitle = "Descripción",
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const titleId = useId();

  const autosize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    if (!el.value) {
      el.style.height = "";
      return;
    }
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    autosize(ref.current);
  }, [value]);

  useLayoutEffect(() => {
    if (expanded) autosize(modalRef.current);
  }, [expanded, value]);

  useEffect(() => {
    if (!expanded) return;
    const section = rootRef.current?.closest("section") as HTMLElement | null;
    if (section) {
      section.style.position = "relative";
      setContainer(section);
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [expanded]);

  useEffect(() => {
    if (expanded) {
      requestAnimationFrame(() => modalRef.current?.focus());
    }
  }, [expanded]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
    autosize(event.target);
  };

  return (
    <div ref={rootRef} className="tab-examen-row__textarea">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
      <button
        type="button"
        className="tab-examen-row__textarea-expand"
        onClick={() => setExpanded(true)}
        aria-label="Expandir descripción"
        title="Expandir"
      >
        <Icon name="icon-maximize" size={12} />
      </button>
      {expanded && container
        ? createPortal(
            <div
              className="tab-examen-row__overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={() => setExpanded(false)}
            >
              <div
                className="tab-examen-row__overlay-card"
                onClick={(event) => event.stopPropagation()}
              >
                <header className="tab-examen-row__overlay-header">
                  <h4 id={titleId}>{modalTitle}</h4>
                  <button
                    type="button"
                    className="tab-examen-row__overlay-close"
                    onClick={() => setExpanded(false)}
                    aria-label="Cerrar"
                  >
                    <Icon name="icon-x" size={14} />
                  </button>
                </header>
                <textarea
                  ref={modalRef}
                  value={value}
                  placeholder={placeholder}
                  onChange={handleChange}
                />
              </div>
            </div>,
            container,
          )
        : null}
    </div>
  );
}

export function TabExamen() {
  const { control } = useFormContext<UpdateEvolutionDraftFormValues>();

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
    <div style={ROW_CONTAINER_STYLE}>
      <WcFormSection
        title="Enfermedad actual y Revisión de sistemas"
        info="Describir cronología, localización, características, intensidad, frecuencia, factores agravantes."
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
          <p className="tab-examen-injuries__empty">
            No hay revisiones registradas. Haz clic en "Agregar combinación".
          </p>
        ) : (
          <div className="tab-examen-injuries__list">
            {systemsFields.map((field, index) => (
              <div
                key={field.id}
                className="tab-examen-row tab-examen-row--system"
              >
                <div className="tab-examen-row__number tab-examen-row__number--exam">
                  {index + 1}
                </div>
                <div className="tab-examen-row__select">
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
                </div>
                <div className="tab-examen-row__select">
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
                </div>
                <div className="tab-examen-row__description">
                  <Controller
                    control={control}
                    name={`systemsReview.${index}.description` as const}
                    render={({ field: f }) => (
                      <AutoResizeTextarea
                        value={f.value ?? ""}
                        onChange={f.onChange}
                        placeholder="Cronología, características, intensidad, factores agravantes..."
                        modalTitle="Enfermedad actual / Revisión de sistemas"
                      />
                    )}
                  />
                </div>
                <div className="tab-examen-row__delete">
                  <WcButtonIcon
                    variant="danger"
                    shape="square"
                    size="sm"
                    onClick={() => removeSystem(index)}
                    aria-label={`Eliminar combinación ${index + 1}`}
                  >
                    <Icon name="icon-trash" size={14} />
                  </WcButtonIcon>
                </div>
              </div>
            ))}
          </div>
        )}
      </WcFormSection>

      <WcFormSection
        title="Examen físico"
        info="Cada fila numera una región anatómica, marca si presenta patología y permite extender los hallazgos."
        actions={
          <WcButton
            variant="terciary"
            onClick={() =>
              appendExam({ region: "OTRO", hasPathology: false, description: "" })
            }
          >
            <Icon name="icon-add" size={16} /> Agregar región
          </WcButton>
        }
      >
        {examFields.length === 0 ? (
          <p className="tab-examen-injuries__empty">
            No hay regiones registradas. Haz clic en "Agregar región".
          </p>
        ) : (
          <div className="tab-examen-injuries__list">
            {examFields.map((field, index) => (
              <div
                key={field.id}
                className="tab-examen-row tab-examen-row--exam"
              >
                <div className="tab-examen-row__number tab-examen-row__number--exam">
                  {index + 1}
                </div>
                <div className="tab-examen-row__select">
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
                </div>
                <Controller
                  control={control}
                  name={`physicalExams.${index}.hasPathology` as const}
                  render={({ field: f }) => {
                    const active = Boolean(f.value);
                    return (
                      <button
                        type="button"
                        className={`tab-examen-row__pathology ${
                          active ? "tab-examen-row__pathology--active" : ""
                        }`}
                        aria-pressed={active}
                        aria-label="Marcar como con patología"
                        title={active ? "Con patología (CP)" : "Sin patología (SP)"}
                        onClick={() => f.onChange(!active)}
                      >
                        <span className="tab-examen-row__pathology-label">
                          {active ? "CP" : "SP"}
                        </span>
                      </button>
                    );
                  }}
                />
                <div className="tab-examen-row__description">
                  <Controller
                    control={control}
                    name={`physicalExams.${index}.description` as const}
                    render={({ field: f }) => (
                      <AutoResizeTextarea
                        value={f.value ?? ""}
                        onChange={f.onChange}
                        placeholder="Hallazgos / descripción de la región"
                        modalTitle="Hallazgos del examen físico"
                      />
                    )}
                  />
                </div>
                <div className="tab-examen-row__delete">
                  <WcButtonIcon
                    variant="danger"
                    shape="square"
                    size="sm"
                    onClick={() => removeExam(index)}
                    aria-label={`Eliminar región ${index + 1}`}
                  >
                    <Icon name="icon-trash" size={14} />
                  </WcButtonIcon>
                </div>
              </div>
            ))}
          </div>
        )}
      </WcFormSection>

      <WcFormSection
        title="Lesiones"
        info="Marca en el diagrama corporal la ubicación de cada lesión. Cada click crea una nueva fila numerada."
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
                <div
                  key={field.id}
                  className="tab-examen-row tab-examen-row--injury"
                >
                  <div className="tab-examen-row__number tab-examen-row__number--injury">
                    {index + 1}
                  </div>
                  <div className="tab-examen-row__select">
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
                  <div className="tab-examen-row__description">
                    <Controller
                      control={control}
                      name={`injuries.${index}.description` as const}
                      render={({ field: f }) => (
                        <AutoResizeTextarea
                          value={f.value ?? ""}
                          onChange={f.onChange}
                          placeholder="Descripción (ej. 5 cm en región frontal derecha)"
                          modalTitle="Descripción de la lesión"
                        />
                      )}
                    />
                  </div>
                  <div className="tab-examen-row__delete">
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
