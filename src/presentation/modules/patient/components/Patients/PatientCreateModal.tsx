import { useState, useEffect, useRef, type ReactNode } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  patientSchema,
  type PatientFormData,
} from "@/presentation/modules/patient/schemas/patient.schema";
import {
  useCreatePatient,
  useUpdatePatient,
  usePatient,
} from "@/presentation/modules/patient/hooks/usePatients";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Cie10SearchInput } from "./Cie10SearchInput";
import { GeographicLocationSearchInput } from "./GeographicLocationSearchInput";
import { PatientEmergencyContactCard } from "@/presentation/modules/patient/components/Patients/PatientEmergencyContactCard";
import { PatientClinicalAntecedentCard } from "@/presentation/modules/patient/components/Patients/PatientClinicalAntecedentCard";
import "./PatientCreateModal.css";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { WcFormStepSection } from "@/presentation/modules/shared/components/ui/webcomponents/Sections/WcFormStepSection";
import WcWarning from "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning";

interface PatientCreateModalProps {
  patientId?: string | null;
  onClose: () => void;
  onCreated?: (patient: Patient) => void;
}

const TABS = [
  { id: 0, title: "Básica", icon: "icon-card-info" },
  { id: 1, title: "Demografía", icon: "icon-demography" },
  { id: 2, title: "Ubicación", icon: "icon-map-pin" },
  { id: 3, title: "Laboral", icon: "icon-briefcase" },
  { id: 4, title: "Contactos", icon: "icon-phone" },
  { id: 5, title: "Antecedentes", icon: "icon-medical-history" },
  { id: 6, title: "Fuente Info", icon: "icon-user-voice" },
];

interface FormLabelProps {
  text: string;
}

function FormLabel({ text }: FormLabelProps) {
  return <label className="form-label">{text}</label>;
}

interface TabHeaderWithInfoProps {
  title: string;
  description: string;
  action?: ReactNode;
}

function hasMeaningfulFormValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulFormValue(item));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) =>
      hasMeaningfulFormValue(item),
    );
  }
  return false;
}

function resolveAntecedentSummary(
  description: string | null | undefined,
  treatment: string | null | undefined,
): string {
  if (description && description.trim() !== "") {
    return description;
  }
  if (treatment && treatment.trim() !== "") {
    return treatment;
  }
  return "";
}

function TabHeaderWithInfo({
  title,
  description,
  action,
}: TabHeaderWithInfoProps) {
  return (
    <div className="patient-tab-header">
      <div className="patient-tab-header__main">
        <h3 className="patient-tab-header__title">{title}</h3>
        <div className="patient-tab-header__info">
          <button
            type="button"
            className="patient-tab-header__info-btn"
            aria-label={`Más información sobre ${title}`}
          >
            <Icon name="icon-info-circle" size={14} />
          </button>
          <div className="patient-tab-header__info-popover">
            <p>{description}</p>
          </div>
        </div>
      </div>
      {action ? (
        <div className="patient-tab-header__action">{action}</div>
      ) : null}
    </div>
  );
}

export function PatientCreateModal({
  patientId,
  onClose,
  onCreated,
}: PatientCreateModalProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [isCloseWarningOpen, setIsCloseWarningOpen] = useState(false);
  const [newAntecedentFieldId, setNewAntecedentFieldId] = useState<
    string | null
  >(null);
  const hasInitializedAntecedentFieldsRef = useRef(false);
  const previousAntecedentFieldIdsRef = useRef<string[]>([]);

  const { addToast } = useToastStore();
  const { mutate: createPatient, isPending: isCreating } = useCreatePatient();
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const isPending = isCreating || isUpdating;

  const isEditMode = !!patientId;
  const { data: patientData, isLoading: isLoadingPatient } = usePatient(
    patientId || "",
    {
      enabled: isEditMode,
    },
  );

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      useTemporaryId: false,
      currentlyWorks: false,
      emergencyContacts: [],
      clinicalAntecedents: [],
    },
    mode: "onChange",
  });

  const watchUseTemporaryId = watch("useTemporaryId");
  const isCreateWithoutCedula = !isEditMode && watchUseTemporaryId;

  useEffect(() => {
    if (watchUseTemporaryId) {
      setValue("idNumber", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [watchUseTemporaryId, setValue]);

  useEffect(() => {
    if (isEditMode && patientData) {
      reset({
        ...patientData,
        useTemporaryId: patientData.idNumberType === "temporal",
        idNumber:
          patientData.idNumberType === "temporal" ? "" : patientData.idNumber,
        emergencyContacts: patientData.emergencyContacts || [],
        clinicalAntecedents:
          patientData.clinicalAntecedents?.map((antecedent) => {
            const unifiedSummary = resolveAntecedentSummary(
              antecedent.description,
              antecedent.treatment,
            );
            return {
              ...antecedent,
              description: unifiedSummary,
              treatment: unifiedSummary,
            };
          }) || [],
        currentlyWorks: patientData.currentlyWorks || false,
      } as unknown as PatientFormData);
    }
  }, [isEditMode, patientData, reset]);

  const isPatientTemporal =
    isEditMode && patientData?.idNumberType === "temporal";

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const {
    fields: antecedentFields,
    append: appendAntecedent,
    remove: removeAntecedent,
  } = useFieldArray({
    control,
    name: "clinicalAntecedents",
  });

  useEffect(() => {
    const currentIds = antecedentFields.map((field) => field.id);

    if (!hasInitializedAntecedentFieldsRef.current) {
      previousAntecedentFieldIdsRef.current = currentIds;
      hasInitializedAntecedentFieldsRef.current = true;
      return;
    }

    const addedId = currentIds.find(
      (id) => !previousAntecedentFieldIdsRef.current.includes(id),
    );
    if (addedId) {
      setNewAntecedentFieldId(addedId);
    } else if (
      newAntecedentFieldId &&
      !currentIds.includes(newAntecedentFieldId)
    ) {
      setNewAntecedentFieldId(null);
    }

    previousAntecedentFieldIdsRef.current = currentIds;
  }, [antecedentFields, newAntecedentFieldId]);

  const watchContacts = watch("emergencyContacts");
  const hasEmptyContact = (watchContacts || []).some(
    (c) => !c.name?.trim() && !c.phone?.trim(),
  );

  const watchAntecedents = watch("clinicalAntecedents");
  const hasEmptyAntecedent = (watchAntecedents || []).some(
    (ant) =>
      !ant.pathologyId &&
      !ant.description?.trim() &&
      !ant.diagnosisDate &&
      !ant.treatment?.trim(),
  );

  const watchCulturalGroup = watch("culturalGroup");
  const watchInfoSourceType = watch("infoSourceType");
  const watchCurrentlyWorks = watch("currentlyWorks");

  const handleModalCloseAttempt = () => {
    if (isPending) return;
    const hasFormInfo = hasMeaningfulFormValue(getValues());
    if (isDirty && hasFormInfo) {
      setIsCloseWarningOpen(true);
      return;
    }
    onClose();
  };

  const hasErrorsInTab = (tabId: number) => {
    switch (tabId) {
      case 0:
        return !!(
          errors.idNumber ||
          errors.firstName ||
          errors.middleName ||
          errors.lastName ||
          errors.secondLastName ||
          errors.birthDate ||
          errors.birthPlace ||
          errors.gender ||
          errors.bloodType ||
          errors.email ||
          errors.phone
        );
      case 1:
        return !!errors.culturalGroupOther;
      case 2:
        return !!(errors.geographicLocationId || errors.homeAddress);
      case 3:
        return false;
      case 4:
        return !!errors.emergencyContacts?.length;
      case 5:
        return !!errors.clinicalAntecedents?.length;
      case 6:
        return !!(errors.infoSourceType || errors.infoSourceOther);
      default:
        return false;
    }
  };

  const onError = () => {
    const firstErrorTab = TABS.find((tab) => hasErrorsInTab(tab.id));
    if (firstErrorTab) {
      setCurrentTab(firstErrorTab.id);
    }
    addToast({
      type: "error",
      message: "Por favor, revise los campos marcados en rojo",
    });
  };

  const onSubmit = (data: PatientFormData) => {
    if (isEditMode && patientId) {
      const updatePayload: Record<string, unknown> = { ...data };
      if (isPatientTemporal && data.idNumber && data.idNumber.trim() !== "") {
        updatePayload.idNumber = data.idNumber;
        updatePayload.idNumberType = "cedula";
      }
      updatePatient(
        { id: patientId, data: updatePayload as any },
        {
          onSuccess: () => {
            addToast({
              type: "success",
              message:
                isPatientTemporal && data.idNumber?.trim()
                  ? "Paciente actualizado. El numero de historia clinica ha sido actualizado con la cedula registrada."
                  : "Paciente actualizado exitosamente",
            });
            onClose();
          },
          onError: (error) => {
            addToast({
              type: "error",
              message: `Error al actualizar: ${error.message}`,
            });
          },
        },
      );
    } else {
      createPatient(data as any, {
        onSuccess: (patient) => {
          addToast({
            type: "success",
            message: data.useTemporaryId
              ? "Paciente registrado con ID temporal. Recuerde registrar la cedula cuando este disponible."
              : "Paciente creado exitosamente",
          });
          onCreated?.(patient);
          onClose();
        },
        onError: (error) => {
          addToast({
            type: "error",
            message: `Error al crear: ${error.message}`,
          });
        },
      });
    }
  };

  const basicTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <TabHeaderWithInfo
        title="Información básica"
        description="Completa los datos principales del paciente para crear su registro clínico inicial."
      />

      {isPatientTemporal && (
        <div className="patient-temporary-note">
          <span className="patient-temporary-note__icon" aria-hidden="true">
            <Icon name="icon-alert-circle" size={16} />
          </span>
          <span className="patient-temporary-note__text">
            Este paciente tiene un ID temporal. Al registrar su cedula y
            guardar, el numero de historia clinica se actualizara
            automaticamente.
          </span>
        </div>
      )}

      <WcFormStepSection
        step={1}
        title="Cédula de identidad"
        className="patient-step-section"
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div style={{ width: "100%" }}>
            <label className="form-label">
              {isCreateWithoutCedula
                ? "Cédula / Identificación"
                : "Cédula / Identificación *"}
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}
            >
              <div
                className="input-wrapper"
                style={{ width: "min(100%, 200px)" }}
              >
                <input
                  {...register("idNumber")}
                  className={`input-field ${errors.idNumber ? "error" : ""} ${isCreateWithoutCedula ? "is-temporary-mode" : ""}`}
                  placeholder={
                    isCreateWithoutCedula
                      ? "ID temporal automático"
                      : "Ej: 1712345678"
                  }
                  disabled={isCreateWithoutCedula}
                />
                {errors.idNumber && !isCreateWithoutCedula && (
                  <span className="input-error-icon">
                    <Icon name="icon-alert-circle" size={16} />
                  </span>
                )}
              </div>
              {!isEditMode && (
                <div className="patient-cedula-control">
                  <label
                    htmlFor="toggle-temporary-id"
                    className="patient-cedula-control__toggle"
                  >
                    <input
                      id="toggle-temporary-id"
                      type="checkbox"
                      {...register("useTemporaryId")}
                      className="patient-cedula-control__checkbox"
                    />
                    <span className="patient-cedula-control__toggle-text">
                      Sin cédula
                    </span>
                  </label>
                  <div className="patient-cedula-control__info">
                    <button
                      type="button"
                      className="patient-cedula-control__info-btn"
                      aria-label="Más información"
                    >
                      <Icon name="icon-info-circle" size={14} />
                    </button>
                    <div className="patient-cedula-control__info-popover">
                      <p>El sistema asignará un ID temporal.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {errors.idNumber && !isCreateWithoutCedula && (
              <span className="form-error">{errors.idNumber.message}</span>
            )}
          </div>
        </div>
      </WcFormStepSection>

      <WcFormStepSection
        step={2}
        title="Nombres del paciente"
        className="patient-step-section"
      >
        <div
          className="patient-form-grid patient-form-grid--three"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <FormLabel text="Primer Nombre *" />
            <div className="input-wrapper">
              <input
                {...register("firstName")}
                className={`input-field ${errors.firstName ? "error" : ""}`}
                placeholder="Ej: Juan"
              />
              {errors.firstName && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.firstName && (
              <span className="form-error">{errors.firstName.message}</span>
            )}
          </div>
          <div>
            <FormLabel text="Segundo Nombre" />
            <div className="input-wrapper">
              <input
                {...register("middleName")}
                className={`input-field ${errors.middleName ? "error" : ""}`}
                placeholder="Ej: Carlos"
              />
              {errors.middleName && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.middleName && (
              <span className="form-error">{errors.middleName.message}</span>
            )}
          </div>
          <div>
            <FormLabel text="Apellido Paterno *" />
            <div className="input-wrapper">
              <input
                {...register("lastName")}
                className={`input-field ${errors.lastName ? "error" : ""}`}
                placeholder="Ej: Pérez"
              />
              {errors.lastName && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.lastName && (
              <span className="form-error">{errors.lastName.message}</span>
            )}
          </div>
          <div>
            <FormLabel text="Apellido Materno" />
            <div className="input-wrapper">
              <input
                {...register("secondLastName")}
                className={`input-field ${errors.secondLastName ? "error" : ""}`}
                placeholder="Ej: Gómez"
              />
              {errors.secondLastName && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.secondLastName && (
              <span className="form-error">
                {errors.secondLastName.message}
              </span>
            )}
          </div>
        </div>
      </WcFormStepSection>

      <WcFormStepSection
        step={3}
        title="Datos personales"
        className="patient-step-section"
      >
        <div
          className="patient-form-grid patient-form-grid--three"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <FormLabel text="Género *" />
            <div className="input-wrapper">
              <select
                {...register("gender")}
                className={`input-field ${errors.gender ? "error" : ""}`}
              >
                <option value="">Seleccione...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
              {errors.gender && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.gender && (
              <span className="form-error">{errors.gender.message}</span>
            )}
          </div>
          <div>
            <FormLabel text="Grupo Sanguíneo" />
            <div className="input-wrapper">
              <select
                {...register("bloodType")}
                className={`input-field ${errors.bloodType ? "error" : ""}`}
              >
                <option value="">Desconocido</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.bloodType && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.bloodType && (
              <span className="form-error">{errors.bloodType.message}</span>
            )}
          </div>
          <div>
            <label className="form-label">Fecha de Nacimiento</label>
            <div className="input-wrapper">
              <input
                type="date"
                {...register("birthDate")}
                className={`input-field ${errors.birthDate ? "error" : ""}`}
              />
              {errors.birthDate && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.birthDate && (
              <span className="form-error">{errors.birthDate.message}</span>
            )}
          </div>
          <div>
            <FormLabel text="Lugar de Nacimiento" />
            <div className="input-wrapper">
              <input
                {...register("birthPlace")}
                className={`input-field ${errors.birthPlace ? "error" : ""}`}
                placeholder="Ej: Quito, Pichincha"
              />
              {errors.birthPlace && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.birthPlace && (
              <span className="form-error">{errors.birthPlace.message}</span>
            )}
          </div>
        </div>
      </WcFormStepSection>

      <WcFormStepSection
        step={4}
        title="Contacto principal"
        className="patient-step-section"
      >
        <div
          className="patient-form-grid patient-form-grid--three"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ width: "min(100%, 200px)" }}>
            <FormLabel text="Email" />
            <div className="input-wrapper">
              <input
                type="email"
                {...register("email")}
                className={`input-field ${errors.email ? "error" : ""}`}
                placeholder="Ej: usuario@correo.com"
              />
              {errors.email && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>
          <div style={{ width: "min(100%, 200px)" }}>
            <FormLabel text="Teléfono" />
            <div className="input-wrapper">
              <input
                {...register("phone")}
                className={`input-field ${errors.phone ? "error" : ""}`}
                placeholder="Ej: 0991234567"
              />
              {errors.phone && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.phone && (
              <span className="form-error">{errors.phone.message}</span>
            )}
          </div>
        </div>
      </WcFormStepSection>
    </div>
  );

  const demographyTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <TabHeaderWithInfo
        title="Demografía"
        description="Registra la información demográfica del paciente para completar su perfil."
      />

      <WcFormStepSection
        step={1}
        title="Identidad social"
        className="patient-step-section"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <FormLabel text="Nacionalidad" />
            <div className="input-wrapper">
              <input
                {...register("nationality")}
                className={`input-field ${errors.nationality ? "error" : ""}`}
                placeholder="Ej: Ecuatoriana"
              />
              {errors.nationality && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.nationality && (
              <span className="form-error">{errors.nationality.message}</span>
            )}
          </div>
          <div>
            <FormLabel text="Estado Civil" />
            <select {...register("maritalStatus")} className="input-field">
              <option value="">Seleccione...</option>
              <option value="SOLTERO">Soltero/a</option>
              <option value="CASADO">Casado/a</option>
              <option value="DIVORCIADO">Divorciado/a</option>
              <option value="VIUDO">Viudo/a</option>
              <option value="UNION_LIBRE">Unión Libre</option>
              <option value="SEPARADO">Separado/a</option>
            </select>
          </div>
        </div>
      </WcFormStepSection>

      <WcFormStepSection
        step={2}
        title="Educación y cobertura"
        className="patient-step-section"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <FormLabel text="Nivel de Instrucción" />
            <select {...register("educationLevel")} className="input-field">
              <option value="">Seleccione...</option>
              <option value="NINGUNO">Ninguno</option>
              <option value="EDUCACION_BASICA">Educación Básica</option>
              <option value="BACHILLERATO">Bachillerato</option>
              <option value="TERCER_NIVEL">Tercer Nivel (Universidad)</option>
              <option value="CUARTO_NIVEL">Cuarto Nivel (Postgrado)</option>
            </select>
          </div>
          <div>
            <FormLabel text="Seguro de Salud" />
            <select {...register("healthInsurance")} className="input-field">
              <option value="">Seleccione...</option>
              <option value="PUBLICO">Público (IESS, ISSFA, etc)</option>
              <option value="PRIVADO">Privado</option>
              <option value="NINGUNO">Ninguno</option>
            </select>
          </div>
        </div>
      </WcFormStepSection>

      <WcFormStepSection
        step={3}
        title="Pertenencia cultural"
        className="patient-step-section"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <FormLabel text="Grupo Cultural" />
            <select {...register("culturalGroup")} className="input-field">
              <option value="">Seleccione...</option>
              <option value="MESTIZO">Mestizo</option>
              <option value="MONTUBIO">Montubio</option>
              <option value="INDIGENA">Indígena</option>
              <option value="AFROECUATORIANO">Afroecuatoriano</option>
              <option value="MULATO">Mulato</option>
              <option value="BLANCO">Blanco</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          {watchCulturalGroup === "OTRO" && (
            <div>
              <FormLabel text="Especifique Grupo Cultural *" />
              <div className="input-wrapper">
                <input
                  {...register("culturalGroupOther")}
                  className={`input-field ${errors.culturalGroupOther ? "error" : ""}`}
                  placeholder="Ej: Pueblo kichwa"
                />
                {errors.culturalGroupOther && (
                  <span className="input-error-icon">
                    <Icon name="icon-alert-circle" size={16} />
                  </span>
                )}
              </div>
              {errors.culturalGroupOther && (
                <span className="form-error">
                  {errors.culturalGroupOther.message}
                </span>
              )}
            </div>
          )}
        </div>
      </WcFormStepSection>
    </div>
  );

  const locationTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <TabHeaderWithInfo
        title="Ubicación"
        description="Registra la ubicación de residencia del paciente para su seguimiento clínico."
      />

      <WcFormStepSection
        step={1}
        title="Ubicación geográfica"
        className="patient-step-section"
      >
        <div>
          <div className="patient-field-label-with-help">
            <FormLabel text="Ubicación Geográfica (Provincia, Cantón, Parroquia)" />
            <div className="patient-field-help">
              <button
                type="button"
                className="patient-field-help__btn"
                aria-label="Cómo buscar ubicación geográfica"
              >
                <Icon name="icon-info-circle" size={14} />
              </button>
              <div className="patient-field-help__popover">
                <p>
                  Escribe al menos 3 caracteres por provincia, cantón o
                  parroquia. Ejemplo: Quito.
                </p>
              </div>
            </div>
          </div>
          <div className="input-wrapper">
            <GeographicLocationSearchInput
              value={watch("geographicLocationId")}
              onChange={(id) =>
                setValue("geographicLocationId", id, { shouldValidate: true })
              }
              error={errors.geographicLocationId?.message}
              initialLabel={
                patientData?.geographicLocation
                  ? `${patientData.geographicLocation.province}, ${patientData.geographicLocation.canton}, ${patientData.geographicLocation.parish} (DPA: ${patientData.geographicLocation.dpaCode})`
                  : ""
              }
            />
            {errors.geographicLocationId && (
              <span className="input-error-icon" style={{ right: 30 }}>
                <Icon name="icon-alert-circle" size={16} />
              </span>
            )}
          </div>
          {errors.geographicLocationId && (
            <span className="form-error">
              {errors.geographicLocationId.message}
            </span>
          )}
        </div>
      </WcFormStepSection>

      <WcFormStepSection
        step={2}
        title="Domicilio"
        className="patient-step-section"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Dirección Domicilio</label>
            <div className="input-wrapper">
              <input
                {...register("homeAddress")}
                className={`input-field ${errors.homeAddress ? "error" : ""}`}
                placeholder="Ej: Calle principal, secundaria y numeración"
              />
              {errors.homeAddress && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.homeAddress && (
              <span className="form-error">{errors.homeAddress.message}</span>
            )}
          </div>
          <div>
            <FormLabel text="Barrio / Sector" />
            <input
              {...register("neighborhood")}
              className="input-field"
              placeholder="Ej: La Carolina"
            />
          </div>
        </div>
      </WcFormStepSection>
    </div>
  );

  const laborTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <TabHeaderWithInfo
        title="Información laboral"
        description="Registra los datos laborales del paciente cuando aplique."
      />

      <div className="patient-work-question">
        <div className="patient-work-question__indicator">
          <Icon name="icon-info-circle" size={14} />
          <span>Pregunta</span>
        </div>
        <div className="patient-work-question__row">
          <p className="patient-work-question__label">
            ¿ El paciente trabaja actualmente ?
          </p>
          <div
            className="patient-choice-group"
            role="group"
            aria-label="Situación laboral del paciente"
          >
            <label className="patient-choice-option">
              <input
                type="checkbox"
                className="patient-choice-checkbox"
                checked={watchCurrentlyWorks === true}
                onChange={() =>
                  setValue("currentlyWorks", true, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <span>Sí</span>
            </label>

            <label className="patient-choice-option">
              <input
                type="checkbox"
                className="patient-choice-checkbox"
                checked={watchCurrentlyWorks === false}
                onChange={() =>
                  setValue("currentlyWorks", false, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <span>No</span>
            </label>
          </div>
        </div>
      </div>

      {watchCurrentlyWorks && (
        <WcFormStepSection
          step={1}
          title="Datos laborales"
          className="patient-step-section"
        >
          <div
            className="patient-form-grid patient-form-grid--three"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <FormLabel text="Nombre de la Empresa" />
              <input
                {...register("companyName")}
                className="input-field"
                placeholder="Ej: Clínica Central"
              />
            </div>
            <div>
              <FormLabel text="Cargo" />
              <input
                {...register("companyPosition")}
                className="input-field"
                placeholder="Ej: Auxiliar administrativo"
              />
            </div>
            <div>
              <div className="patient-field-label-with-help">
                <FormLabel text="Teléfono de Empresa" />
                <div className="patient-field-help patient-field-help--compact">
                  <button
                    type="button"
                    className="patient-field-help__btn"
                    aria-label="Cómo ingresar teléfonos de empresa"
                  >
                    <Icon name="icon-info-circle" size={14} />
                  </button>
                  <div className="patient-field-help__popover">
                    <p>
                      Puedes ingresar más de un número separándolos con guion
                      (-).
                    </p>
                  </div>
                </div>
              </div>
              <input
                {...register("companyPhone")}
                className="input-field"
                placeholder="Ej: 022345678-0984653741"
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <FormLabel text="Dirección de Empresa" />
              <input
                {...register("companyAddress")}
                className="input-field"
                placeholder="Ej: Av. 10 de Agosto y Colón"
              />
            </div>
          </div>
        </WcFormStepSection>
      )}
    </div>
  );

  const contactsTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <TabHeaderWithInfo
        title="Contactos de emergencia"
        description="Registra personas de contacto para actuar rápidamente en caso de emergencia."
        action={
          <WcButton
            variant="primary"
            disabled={hasEmptyContact}
            onClick={() =>
              appendContact({
                id: "",
                name: "",
                kinship: "PADRE",
                phone: "",
                kinshipOther: "",
                address: "",
              })
            }
          >
            <Icon name="icon-user-plus" size={14} /> Añadir Contacto
          </WcButton>
        }
      />

      {contactFields.length === 0 ? (
        <div className="patient-empty-state">
          <Icon name="icon-users" size={28} />
          <p className="patient-empty-state__title">
            No hay contactos registrados
          </p>
          <span className="patient-empty-state__description">
            Agrega al menos un contacto de emergencia para el paciente.
          </span>
        </div>
	      ) : (
	        <div className="patient-contact-cards-list">
	          {contactFields.map((field, index) => {
	            return (
              <PatientEmergencyContactCard
                key={field.id}
                label={`Contacto ${index + 1}`}
                onRemove={() => removeContact(index)}
              >
                <div className="patient-contact-card-fields-grid">
                  <input
                    type="hidden"
                    {...register(`emergencyContacts.${index}.id` as const)}
                  />
                  <div>
                    <FormLabel text="Nombre *" />
                    <div className="input-wrapper">
                      <input
                        {...register(
                          `emergencyContacts.${index}.name` as const,
                        )}
                        className={`input-field ${errors.emergencyContacts?.[index]?.name ? "error" : ""}`}
                        placeholder="Ej: María López"
                      />
                      {errors.emergencyContacts?.[index]?.name && (
                        <span className="input-error-icon">
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.emergencyContacts?.[index]?.name && (
                      <span className="form-error">
                        {errors.emergencyContacts[index]?.name?.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <FormLabel text="Parentesco *" />
                    <div className="input-wrapper">
                      <select
                        {...register(
                          `emergencyContacts.${index}.kinship` as const,
                        )}
                        className={`input-field ${errors.emergencyContacts?.[index]?.kinship ? "error" : ""}`}
                      >
                        <option value="">Seleccione...</option>
                        <option value="PADRE">Padre</option>
                        <option value="MADRE">Madre</option>
                        <option value="CONYUGE">Cónyuge</option>
                        <option value="PAREJA">Pareja</option>
                        <option value="HIJO">Hijo/a</option>
                        <option value="HERMANO">Hermano/a</option>
                        <option value="TUTOR">Tutor</option>
                        <option value="REPRESENTANTE_LEGAL">Representante Legal</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      {errors.emergencyContacts?.[index]?.kinship && (
                        <span className="input-error-icon">
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.emergencyContacts?.[index]?.kinship && (
                      <span className="form-error">
                        {errors.emergencyContacts[index]?.kinship?.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="patient-field-label-with-help">
                      <FormLabel text="Teléfono *" />
                      <div className="patient-field-help patient-field-help--compact">
                        <button
                          type="button"
                          className="patient-field-help__btn"
                          aria-label="Cómo ingresar teléfonos del contacto"
                        >
                          <Icon name="icon-info-circle" size={14} />
                        </button>
                        <div className="patient-field-help__popover">
                          <p>
                            Puedes ingresar más de un número separándolos con
                            guion (-).
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="input-wrapper">
                      <input
                        {...register(
                          `emergencyContacts.${index}.phone` as const,
                        )}
                        className={`input-field ${errors.emergencyContacts?.[index]?.phone ? "error" : ""}`}
                        placeholder="Ej: 022345678-0984653741"
                      />
                      {errors.emergencyContacts?.[index]?.phone && (
                        <span className="input-error-icon">
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.emergencyContacts?.[index]?.phone && (
                      <span className="form-error">
                        {errors.emergencyContacts[index]?.phone?.message}
                      </span>
                    )}
                  </div>
                  {watch(`emergencyContacts.${index}.kinship`) === "OTRO" && (
                    <div>
                      <FormLabel text="Especificar Parentesco *" />
                      <div className="input-wrapper">
                        <input
                          {...register(
                            `emergencyContacts.${index}.kinshipOther` as const,
                          )}
                          className={`input-field ${errors.emergencyContacts?.[index]?.kinshipOther ? "error" : ""}`}
                          placeholder="Ej: Suegro"
                        />
                        {errors.emergencyContacts?.[index]?.kinshipOther && (
                          <span className="input-error-icon">
                            <Icon name="icon-alert-circle" size={16} />
                          </span>
                        )}
                      </div>
                      {errors.emergencyContacts?.[index]?.kinshipOther && (
                        <span className="form-error">
                          {
                            errors.emergencyContacts[index]?.kinshipOther
                              ?.message
                          }
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </PatientEmergencyContactCard>
            );
          })}
        </div>
      )}
    </div>
  );

  const antecedentsTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <TabHeaderWithInfo
        title="Antecedentes clínicos"
        description="Registra los antecedentes relevantes del paciente para apoyar la toma de decisiones clínicas."
        action={
          <WcButton
            variant="primary"
            disabled={hasEmptyAntecedent}
            onClick={() =>
              appendAntecedent({
                id: "",
                antecedentType: "CLINICO",
                pathologyId: "",
                description: "",
                diagnosisDate: "",
                treatment: "",
              })
            }
          >
            <Icon name="icon-plus-solid" size={14} /> Añadir Antecedente
          </WcButton>
        }
      />

      {antecedentFields.length === 0 ? (
        <div className="patient-empty-state">
          <Icon name="icon-medical-history" size={28} />
          <p className="patient-empty-state__title">
            No hay antecedentes registrados
          </p>
          <span className="patient-empty-state__description">
            Agrega antecedentes clínicos para construir un historial médico más
            completo.
          </span>
        </div>
      ) : (
        <div className="patient-antecedent-cards-list">
          {antecedentFields.map((field, index) => {
            const descriptionField = register(
              `clinicalAntecedents.${index}.description` as const,
            );
            const treatmentFieldName =
              `clinicalAntecedents.${index}.treatment` as const;

            return (
              <PatientClinicalAntecedentCard
                key={field.id}
                label={`Antecedente ${index + 1}`}
                onRemove={() => removeAntecedent(index)}
                autoCollapsed={true}
                forceExpanded={field.id === newAntecedentFieldId}
              >
                <div className="patient-antecedent-card-fields-grid">
                  <input
                    type="hidden"
                    {...register(`clinicalAntecedents.${index}.id` as const)}
                  />
                  <div>
                    <FormLabel text="Tipo *" />
                    <div className="input-wrapper">
                      <select
                        {...register(
                          `clinicalAntecedents.${index}.antecedentType` as const,
                        )}
                        className={`input-field ${errors.clinicalAntecedents?.[index]?.antecedentType ? "error" : ""}`}
                      >
                        <option value="ALERGICO">Alérgico</option>
                        <option value="CLINICO">Clínico</option>
                        <option value="GINECOLOGICO">Ginecológico</option>
                        <option value="OBSTETRICO">Obstétrico</option>
                        <option value="TRAUMATOLOGICO">Traumatológico</option>
                        <option value="QUIRURGICO">Quirúrgico</option>
                        <option value="FARMACOLOGICO">Farmacológico</option>
                        <option value="TRANSFUSIONAL">Transfusional</option>
                        <option value="FAMILIAR">Familiar</option>
                        <option value="PATOLOGICO">Patológico</option>
                        <option value="INMUNOLOGICO">Inmunológico</option>
                        <option value="HABITO">Hábito</option>
                        <option value="PSIQUIATRICO">Psiquiátrico</option>
                        <option value="NEONATAL">Neonatal</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      {errors.clinicalAntecedents?.[index]?.antecedentType && (
                        <span className="input-error-icon">
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.clinicalAntecedents?.[index]?.antecedentType && (
                      <span className="form-error">
                        {
                          errors.clinicalAntecedents[index]?.antecedentType
                            ?.message
                        }
                      </span>
                    )}
                  </div>
                  <div>
                    <FormLabel text="Fecha de Diagnóstico *" />
                    <div className="input-wrapper">
                      <input
                        type="date"
                        {...register(
                          `clinicalAntecedents.${index}.diagnosisDate` as const,
                        )}
                        className={`input-field ${errors.clinicalAntecedents?.[index]?.diagnosisDate ? "error" : ""}`}
                        placeholder="Ej: 2024-05-10"
                      />
                      {errors.clinicalAntecedents?.[index]?.diagnosisDate && (
                        <span className="input-error-icon">
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.clinicalAntecedents?.[index]?.diagnosisDate && (
                      <span className="form-error">
                        {
                          errors.clinicalAntecedents[index]?.diagnosisDate
                            ?.message
                        }
                      </span>
                    )}
                  </div>
                  <div className="patient-antecedent-card-fields-grid__full">
                    <div className="patient-field-label-with-help">
                      <FormLabel text="Patología (CIE-10)" />
                      <div className="patient-field-help patient-field-help--compact">
                        <button
                          type="button"
                          className="patient-field-help__btn"
                          aria-label="Cómo buscar una patología CIE-10"
                        >
                          <Icon name="icon-info-circle" size={14} />
                        </button>
                        <div className="patient-field-help__popover">
                          <p>
                            Escribe al menos 3 caracteres del código o
                            descripción. Ejemplo: E11 o diabetes.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="input-wrapper">
                      <Cie10SearchInput
                        value={watch(
                          `clinicalAntecedents.${index}.pathologyId`,
                        )}
                        initialLabel={
                          patientData?.clinicalAntecedents?.find(
                            (a) =>
                              a.id === watch(`clinicalAntecedents.${index}.id`),
                          )?.pathology
                            ? `${patientData.clinicalAntecedents.find((a) => a.id === watch(`clinicalAntecedents.${index}.id`))?.pathology?.code} - ${patientData.clinicalAntecedents.find((a) => a.id === watch(`clinicalAntecedents.${index}.id`))?.pathology?.description}`
                            : ""
                        }
                        onChange={(id) => {
                          setValue(
                            `clinicalAntecedents.${index}.pathologyId`,
                            id || undefined,
                            {
                              shouldValidate: true,
                            },
                          );
                        }}
                        error={
                          errors.clinicalAntecedents?.[index]?.pathologyId
                            ?.message
                        }
                      />
                      {errors.clinicalAntecedents?.[index]?.pathologyId && (
                        <span
                          className="input-error-icon"
                          style={{ right: 30 }}
                        >
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.clinicalAntecedents?.[index]?.pathologyId && (
                      <span className="form-error">
                        {
                          errors.clinicalAntecedents[index]?.pathologyId
                            ?.message
                        }
                      </span>
                    )}
                  </div>
                  <div className="patient-antecedent-card-fields-grid__full">
                    <FormLabel text="Descripción y Tratamiento" />
                    <input
                      type="hidden"
                      {...register(treatmentFieldName)}
                    />
                    <textarea
                      {...descriptionField}
                      onChange={(event) => {
                        descriptionField.onChange(event);
                        setValue(
                          treatmentFieldName,
                          event.target.value,
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          },
                        );
                      }}
                      className="input-field patient-antecedent-summary-field"
                      rows={2}
                      placeholder="Ej: Hipertensión arterial diagnosticada en 2021. Manejo actual con metformina 850 mg cada 12 horas."
                    />
                  </div>
                </div>
              </PatientClinicalAntecedentCard>
            );
          })}
        </div>
      )}
    </div>
  );

  const infoSourceTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <TabHeaderWithInfo
        title="Fuente de información"
        description="Registra el origen de la información clínica para asegurar trazabilidad del dato."
      />

      <WcFormStepSection
        step={1}
        title="Origen de la información"
        className="patient-step-section"
      >
        <div className="patient-info-source-grid">
          <div>
            <label className="form-label">Fuente de la Información</label>
            <div className="input-wrapper">
              <select
                {...register("infoSourceType")}
                className={`input-field ${errors.infoSourceType ? "error" : ""}`}
              >
                <option value="">Seleccione...</option>
                <option value="PACIENTE">El propio paciente</option>
                <option value="FAMILIAR">Familiar</option>
                <option value="AMIGO">Amigo</option>
                <option value="TUTOR">Tutor</option>
                <option value="REPRESENTANTE_LEGAL">Representante Legal</option>
                <option value="HISTORIA_CLINICA">
                  Historia Clínica / Expediente
                </option>
                <option value="PERSONAL_SALUD">Personal de Salud</option>
                <option value="OTRO">Otro</option>
              </select>
              {errors.infoSourceType && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.infoSourceType && (
              <span className="form-error">
                {errors.infoSourceType.message}
              </span>
            )}
          </div>

          {watchInfoSourceType === "OTRO" && (
            <div>
              <FormLabel text="Especifique Fuente *" />
              <div className="input-wrapper">
                <input
                  {...register("infoSourceOther")}
                  className={`input-field ${errors.infoSourceOther ? "error" : ""}`}
                  placeholder="Ej: Personal de ambulancia"
                />
                {errors.infoSourceOther && (
                  <span className="input-error-icon">
                    <Icon name="icon-alert-circle" size={16} />
                  </span>
                )}
              </div>
              {errors.infoSourceOther && (
                <span className="form-error">
                  {errors.infoSourceOther.message}
                </span>
              )}
            </div>
          )}
        </div>
      </WcFormStepSection>

      {(watchInfoSourceType as string) !== "" && (
        <WcFormStepSection
          step={2}
          title="Detalle de la fuente"
          className="patient-step-section"
        >
          <div className="patient-info-source-grid">
            {watchInfoSourceType !== "PACIENTE" &&
              watchInfoSourceType !== "HISTORIA_CLINICA" && (
                <>
                  <div>
                    <FormLabel text="Nombre del Informante" />
                    <input
                      {...register("infoSourceName")}
                      className="input-field"
                      placeholder="Ej: María López"
                    />
                  </div>
                  <div>
                    <div className="patient-field-label-with-help">
                      <FormLabel text="Teléfono del Informante" />
                      <div className="patient-field-help patient-field-help--compact">
                        <button
                          type="button"
                          className="patient-field-help__btn"
                          aria-label="Cómo ingresar teléfonos del informante"
                        >
                          <Icon name="icon-info-circle" size={14} />
                        </button>
                        <div className="patient-field-help__popover">
                          <p>
                            Puedes ingresar más de un número separándolos con
                            guion (-).
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="input-wrapper">
                      <input
                        {...register("infoSourcePhone")}
                        className={`input-field ${errors.infoSourcePhone ? "error" : ""}`}
                        placeholder="Ej: 022345678-0984653741"
                      />
                      {errors.infoSourcePhone && (
                        <span className="input-error-icon">
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.infoSourcePhone && (
                      <span className="form-error">
                        {errors.infoSourcePhone.message}
                      </span>
                    )}
                  </div>
                </>
              )}
            <div className="patient-info-source-grid__full">
              <FormLabel text="Observaciones (Opcional)" />
              <textarea
                {...register("infoSourceObservations")}
                className="input-field patient-info-source-observations-field"
                rows={3}
                placeholder="Ej: Paciente orientado, información validada con familiar"
              />
            </div>
          </div>
        </WcFormStepSection>
      )}
    </div>
  );

  const tabNav = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-1)",
        flexShrink: 0,
        padding: "var(--space-2) 0",
      }}
    >
      <WcButtonIcon
        icon={"icon-chevron-left"}
        onClick={() => setCurrentTab((prev) => Math.max(0, prev - 1))}
        disabled={currentTab === 0 || isPending}
        aria-label="Anterior"
      />
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-secondary)",
          fontWeight: "var(--font-weight-medium)",
          padding: "0 var(--space-1)",
          whiteSpace: "nowrap",
          minWidth: "28px",
          textAlign: "center",
        }}
      >
        {currentTab + 1}/{TABS.length}
      </span>
      <WcButtonIcon
        icon={"icon-chevron-right"}
        onClick={() =>
          setCurrentTab((prev) => Math.min(TABS.length - 1, prev + 1))
        }
        disabled={currentTab === TABS.length - 1 || isPending}
        aria-label="Siguiente"
      />
    </div>
  );

  const tabsData = TABS.map((tab) => {
    const hasError = hasErrorsInTab(tab.id);
    return {
      name: tab.title,
      hasError,
      icon: <Icon name={hasError ? "icon-alert-circle" : tab.icon} size={16} />,
      content: (() => {
        switch (tab.id) {
          case 0:
            return basicTabContent;
          case 1:
            return demographyTabContent;
          case 2:
            return locationTabContent;
          case 3:
            return laborTabContent;
          case 4:
            return contactsTabContent;
          case 5:
            return antecedentsTabContent;
          case 6:
            return infoSourceTabContent;
          default:
            return null;
        }
      })(),
    };
  });

  const formFooter = (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        gap: "var(--space-3)",
        borderTop: "1px solid var(--color-border)",
        paddingTop: "var(--space-4)",
      }}
    >
      <WcButton variant="secondary" onClick={onClose} disabled={isPending}>
        Cancelar
      </WcButton>
      <WcButton
        variant="primary"
        className="patient-submit-button"
        disabled={isPending || (isEditMode && !isDirty)}
        onClick={handleSubmit(onSubmit, onError)}
      >
        {isPending && (
          <span className="patient-submit-button__loader" aria-hidden="true">
            <Icon name="icon-loader" size={16} className="spin" />
          </span>
        )}
        <span className="patient-submit-button__text">
          {isEditMode ? "Guardar Cambios" : "Crear paciente"}
        </span>
      </WcButton>
    </div>
  );

  return (
    <WcModal
      isOpen={true}
      onClose={onClose}
      onCloseAttempt={handleModalCloseAttempt}
      title={isEditMode ? "Editar Paciente" : "Registrar nuevo paciente"}
      maxWidth="800px"
      disableBackdropClick={isPending}
      showHeaderDivider={false}
      showFooterDivider={false}
      contentClassName="patient-create-modal__content"
      footer={formFooter}
    >
      {isLoadingPatient ? (
        <div
          style={{
            padding: "var(--space-8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-secondary)",
          }}
        >
          <Icon name="icon-loader" size={32} className="spin" />
          <span style={{ marginLeft: "var(--space-3)" }}>
            Cargando datos...
          </span>
        </div>
      ) : (
        <form
          id="patient-form"
          className="patient-create-form"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <div style={{ padding: "0 var(--space-6) var(--space-3)" }}>
            <div className="patient-create-tabs">
              <WcTabsFolder
                tabs={tabsData}
                activeIndex={currentTab}
                onChange={setCurrentTab}
                headerExtra={tabNav}
              />
            </div>
          </div>
        </form>
      )}
      <WcWarning
        isOpen={isCloseWarningOpen}
        onOpenChange={setIsCloseWarningOpen}
        type="destructive"
        icon={<Icon name="icon-trash-solid" size={24} />}
        title="Salir sin guardar"
        message="Se perderán los cambios realizados en este formulario."
        confirmText="Descartar cambios"
        cancelText="Seguir editando"
        onConfirm={onClose}
      />
    </WcModal>
  );
}
