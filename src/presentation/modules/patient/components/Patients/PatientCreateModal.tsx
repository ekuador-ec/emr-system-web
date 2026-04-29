import { useState, useEffect } from "react";
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
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import { WcTabsFolder } from "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";

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

export function PatientCreateModal({ patientId, onClose, onCreated }: PatientCreateModalProps) {
  const [currentTab, setCurrentTab] = useState(0);

  const { addToast } = useToastStore();
  const { mutate: createPatient, isPending: isCreating } = useCreatePatient();
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const isPending = isCreating || isUpdating;

  const isEditMode = !!patientId;
  const { data: patientData, isLoading: isLoadingPatient } = usePatient(patientId || "", {
    enabled: isEditMode,
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      currentlyWorks: false,
      emergencyContacts: [],
      clinicalAntecedents: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isEditMode && patientData) {
      reset({
        ...patientData,
        emergencyContacts: patientData.emergencyContacts || [],
        clinicalAntecedents: patientData.clinicalAntecedents || [],
        currentlyWorks: patientData.currentlyWorks || false,
      } as unknown as PatientFormData);
    }
  }, [isEditMode, patientData, reset]);

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

  const watchContacts = watch("emergencyContacts");
  const hasEmptyContact = (watchContacts || []).some((c) => !c.name?.trim() && !c.phone?.trim());

  const watchAntecedents = watch("clinicalAntecedents");
  const hasEmptyAntecedent = (watchAntecedents || []).some(
    (ant) =>
      !ant.pathologyId && !ant.description?.trim() && !ant.diagnosisDate && !ant.treatment?.trim(),
  );

  const watchCulturalGroup = watch("culturalGroup");
  const watchInfoSourceType = watch("infoSourceType");
  const watchCurrentlyWorks = watch("currentlyWorks");

  const hasErrorsInTab = (tabId: number) => {
    switch (tabId) {
      case 0:
        return !!(
          errors.idNumber ||
          errors.firstName ||
          errors.lastName ||
          errors.birthDate ||
          errors.gender ||
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
      updatePatient(
        { id: patientId, data: data as any },
        {
          onSuccess: () => {
            addToast({
              type: "success",
              message: "Paciente actualizado exitosamente",
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
            message: "Paciente creado exitosamente",
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
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <label className="form-label">Cédula / Identificación *</label>
          <div className="input-wrapper">
            <input
              {...register("idNumber")}
              className={`input-field ${errors.idNumber ? "error" : ""}`}
              placeholder="Ej. 1712345678"
            />
            {errors.idNumber && (
              <span className="input-error-icon">
                <Icon name="icon-alert-circle" size={16} />
              </span>
            )}
          </div>
          {errors.idNumber && <span className="form-error">{errors.idNumber.message}</span>}
        </div>
        <div>
          <label className="form-label">Primer Nombre *</label>
          <div className="input-wrapper">
            <input
              {...register("firstName")}
              className={`input-field ${errors.firstName ? "error" : ""}`}
            />
            {errors.firstName && (
              <span className="input-error-icon">
                <Icon name="icon-alert-circle" size={16} />
              </span>
            )}
          </div>
          {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
        </div>
        <div>
          <label className="form-label">Segundo Nombre</label>
          <input {...register("middleName")} className="input-field" />
        </div>
        <div>
          <label className="form-label">Apellido Paterno *</label>
          <div className="input-wrapper">
            <input
              {...register("lastName")}
              className={`input-field ${errors.lastName ? "error" : ""}`}
            />
            {errors.lastName && (
              <span className="input-error-icon">
                <Icon name="icon-alert-circle" size={16} />
              </span>
            )}
          </div>
          {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
        </div>
        <div>
          <label className="form-label">Apellido Materno</label>
          <input {...register("secondLastName")} className="input-field" />
        </div>
        <div>
          <label className="form-label">Fecha de Nacimiento *</label>
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
          {errors.birthDate && <span className="form-error">{errors.birthDate.message}</span>}
        </div>
        <div>
          <label className="form-label">Género *</label>
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
          {errors.gender && <span className="form-error">{errors.gender.message}</span>}
        </div>
        <div>
          <label className="form-label">Grupo Sanguíneo</label>
          <select {...register("bloodType")} className="input-field">
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
        </div>
        <div>
          <label className="form-label">Email</label>
          <div className="input-wrapper">
            <input
              type="email"
              {...register("email")}
              className={`input-field ${errors.email ? "error" : ""}`}
            />
            {errors.email && (
              <span className="input-error-icon">
                <Icon name="icon-alert-circle" size={16} />
              </span>
            )}
          </div>
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>
        <div>
          <label className="form-label">Teléfono</label>
          <div className="input-wrapper">
            <input
              {...register("phone")}
              className={`input-field ${errors.phone ? "error" : ""}`}
            />
            {errors.phone && (
              <span className="input-error-icon">
                <Icon name="icon-alert-circle" size={16} />
              </span>
            )}
          </div>
          {errors.phone && <span className="form-error">{errors.phone.message}</span>}
        </div>
      </div>
    </div>
  );

  const demographyTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <label className="form-label">Nacionalidad</label>
          <input
            {...register("nationality")}
            className="input-field"
            placeholder="Ej. Ecuatoriana"
          />
        </div>
        <div>
          <label className="form-label">Estado Civil</label>
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
        <div>
          <label className="form-label">Nivel de Instrucción</label>
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
          <label className="form-label">Seguro de Salud</label>
          <select {...register("healthInsurance")} className="input-field">
            <option value="">Seleccione...</option>
            <option value="PUBLICO">Público (IESS, ISSFA, etc)</option>
            <option value="PRIVADO">Privado</option>
            <option value="NINGUNO">Ninguno</option>
          </select>
        </div>
        <div>
          <label className="form-label">Grupo Cultural</label>
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
            <label className="form-label">Especifique Grupo Cultural *</label>
            <div className="input-wrapper">
              <input
                {...register("culturalGroupOther")}
                className={`input-field ${errors.culturalGroupOther ? "error" : ""}`}
              />
              {errors.culturalGroupOther && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.culturalGroupOther && (
              <span className="form-error">{errors.culturalGroupOther.message}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const locationTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Ubicación Geográfica (Provincia, Cantón, Parroquia)</label>
          <div className="input-wrapper">
            <GeographicLocationSearchInput
              value={watch("geographicLocationId")}
              onChange={(id) => setValue("geographicLocationId", id, { shouldValidate: true })}
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
            <span className="form-error">{errors.geographicLocationId.message}</span>
          )}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Dirección Domicilio *</label>
          <div className="input-wrapper">
            <input
              {...register("homeAddress")}
              className={`input-field ${errors.homeAddress ? "error" : ""}`}
              placeholder="Calle principal, secundaria y numeración"
            />
            {errors.homeAddress && (
              <span className="input-error-icon">
                <Icon name="icon-alert-circle" size={16} />
              </span>
            )}
          </div>
          {errors.homeAddress && <span className="form-error">{errors.homeAddress.message}</span>}
        </div>
        <div>
          <label className="form-label">Barrio / Sector</label>
          <input {...register("neighborhood")} className="input-field" />
        </div>
      </div>
    </div>
  );

  const laborTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            {...register("currentlyWorks")}
            style={{ width: "16px", height: "16px" }}
          />
          <span style={{ fontSize: "var(--font-size-sm)" }}>El paciente trabaja actualmente</span>
        </label>
      </div>

      {watchCurrentlyWorks && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
            padding: "var(--space-4)",
            backgroundColor: "var(--color-bg)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div>
            <label className="form-label">Nombre de la Empresa</label>
            <input {...register("companyName")} className="input-field" />
          </div>
          <div>
            <label className="form-label">Cargo</label>
            <input {...register("companyPosition")} className="input-field" />
          </div>
          <div>
            <label className="form-label">Teléfono de Empresa</label>
            <input {...register("companyPhone")} className="input-field" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Dirección de Empresa</label>
            <input {...register("companyAddress")} className="input-field" />
          </div>
        </div>
      )}
    </div>
  );

  const contactsTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      {contactFields.length === 0 ? (
        <div
          style={{
            padding: "var(--space-6)",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-bg)",
            borderRadius: "var(--radius-md)",
          }}
        >
          No hay contactos de emergencia registrados.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {contactFields.map((field, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={field.id}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: `3px solid ${isEven ? "var(--color-warning)" : "var(--color-secondary)"}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-2) var(--space-4)",
                    backgroundColor: isEven
                      ? "var(--color-warning-light)"
                      : "var(--color-primary-light)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: isEven ? "var(--color-warning)" : "var(--color-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Contacto {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-danger)",
                      padding: "var(--space-1)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="icon-trash" size={16} />
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <input type="hidden" {...register(`emergencyContacts.${index}.id` as const)} />
                  <div>
                    <label className="form-label">Nombre *</label>
                    <div className="input-wrapper">
                      <input
                        {...register(`emergencyContacts.${index}.name` as const)}
                        className={`input-field ${errors.emergencyContacts?.[index]?.name ? "error" : ""}`}
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
                    <label className="form-label">Parentesco *</label>
                    <div className="input-wrapper">
                      <select
                        {...register(`emergencyContacts.${index}.kinship` as const)}
                        className={`input-field ${errors.emergencyContacts?.[index]?.kinship ? "error" : ""}`}
                      >
                        <option value="PADRE">Padre</option>
                        <option value="MADRE">Madre</option>
                        <option value="CONYUGE">Cónyuge</option>
                        <option value="PAREJA">Pareja</option>
                        <option value="HIJO">Hijo/a</option>
                        <option value="HERMANO">Hermano/a</option>
                        <option value="ABUELO">Abuelo/a</option>
                        <option value="NIETO">Nieto/a</option>
                        <option value="TIO">Tío/a</option>
                        <option value="SOBRINO">Sobrino/a</option>
                        <option value="PRIMO">Primo/a</option>
                        <option value="TUTOR">Tutor</option>
                        <option value="REPRESENTANTE_LEGAL">Representante Legal</option>
                        <option value="CUIDADOR">Cuidador</option>
                        <option value="AMIGO">Amigo/a</option>
                        <option value="COMPANERO_TRABAJO">Compañero/a de Trabajo</option>
                        <option value="VECINO">Vecino/a</option>
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
                    <label className="form-label">Teléfono *</label>
                    <div className="input-wrapper">
                      <input
                        {...register(`emergencyContacts.${index}.phone` as const)}
                        className={`input-field ${errors.emergencyContacts?.[index]?.phone ? "error" : ""}`}
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
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Especificar Parentesco *</label>
                      <div className="input-wrapper">
                        <input
                          {...register(`emergencyContacts.${index}.kinshipOther` as const)}
                          className={`input-field ${errors.emergencyContacts?.[index]?.kinshipOther ? "error" : ""}`}
                        />
                        {errors.emergencyContacts?.[index]?.kinshipOther && (
                          <span className="input-error-icon">
                            <Icon name="icon-alert-circle" size={16} />
                          </span>
                        )}
                      </div>
                      {errors.emergencyContacts?.[index]?.kinshipOther && (
                        <span className="form-error">
                          {errors.emergencyContacts[index]?.kinshipOther?.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <WcButton
          variant="primary"
          disabled={hasEmptyContact}
          onClick={() =>
            appendContact({
              id: "",
              name: "",
              kinship: "OTRO",
              phone: "",
              kinshipOther: "",
              address: "",
            })
          }
        >
          <Icon name="icon-add" size={14} /> Añadir Contacto
        </WcButton>
      </div>
    </div>
  );

  const antecedentsTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      {antecedentFields.length === 0 ? (
        <div
          style={{
            padding: "var(--space-6)",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-bg)",
            borderRadius: "var(--radius-md)",
          }}
        >
          No hay antecedentes registrados.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {antecedentFields.map((field, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={field.id}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: `3px solid ${isEven ? "var(--color-success)" : "var(--color-primary-hover)"}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-2) var(--space-4)",
                    backgroundColor: isEven
                      ? "var(--color-success-light)"
                      : "var(--color-primary-light)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: isEven ? "var(--color-success)" : "var(--color-primary-hover)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Antecedente {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAntecedent(index)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-danger)",
                      padding: "var(--space-1)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="icon-trash" size={16} />
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <input type="hidden" {...register(`clinicalAntecedents.${index}.id` as const)} />
                  <div>
                    <label className="form-label">Tipo *</label>
                    <div className="input-wrapper">
                      <select
                        {...register(`clinicalAntecedents.${index}.antecedentType` as const)}
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
                        {errors.clinicalAntecedents[index]?.antecedentType?.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Fecha de Diagnóstico</label>
                    <input
                      type="date"
                      {...register(`clinicalAntecedents.${index}.diagnosisDate` as const)}
                      className="input-field"
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Patología (CIE-10)</label>
                    <div className="input-wrapper">
                      <Cie10SearchInput
                        value={watch(`clinicalAntecedents.${index}.pathologyId`)}
                        initialLabel={
                          patientData?.clinicalAntecedents?.find(
                            (a) => a.id === watch(`clinicalAntecedents.${index}.id`),
                          )?.pathology
                            ? `${patientData.clinicalAntecedents.find((a) => a.id === watch(`clinicalAntecedents.${index}.id`))?.pathology?.code} - ${patientData.clinicalAntecedents.find((a) => a.id === watch(`clinicalAntecedents.${index}.id`))?.pathology?.description}`
                            : ""
                        }
                        onChange={(id) => {
                          setValue(`clinicalAntecedents.${index}.pathologyId`, id || undefined, {
                            shouldValidate: true,
                          });
                        }}
                        error={errors.clinicalAntecedents?.[index]?.pathologyId?.message}
                      />
                      {errors.clinicalAntecedents?.[index]?.pathologyId && (
                        <span className="input-error-icon" style={{ right: 30 }}>
                          <Icon name="icon-alert-circle" size={16} />
                        </span>
                      )}
                    </div>
                    {errors.clinicalAntecedents?.[index]?.pathologyId && (
                      <span className="form-error">
                        {errors.clinicalAntecedents[index]?.pathologyId?.message}
                      </span>
                    )}
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Descripción</label>
                    <textarea
                      {...register(`clinicalAntecedents.${index}.description` as const)}
                      className="input-field"
                      rows={2}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Tratamiento</label>
                    <input
                      {...register(`clinicalAntecedents.${index}.treatment` as const)}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
          <Icon name="icon-add" size={14} /> Añadir Antecedente
        </WcButton>
      </div>
    </div>
  );

  const infoSourceTabContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <label className="form-label">Fuente de la Información *</label>
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
              <option value="HISTORIA_CLINICA">Historia Clínica / Expediente</option>
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
            <span className="form-error">{errors.infoSourceType.message}</span>
          )}
        </div>

        {watchInfoSourceType === "OTRO" && (
          <div>
            <label className="form-label">Especifique Fuente *</label>
            <div className="input-wrapper">
              <input
                {...register("infoSourceOther")}
                className={`input-field ${errors.infoSourceOther ? "error" : ""}`}
              />
              {errors.infoSourceOther && (
                <span className="input-error-icon">
                  <Icon name="icon-alert-circle" size={16} />
                </span>
              )}
            </div>
            {errors.infoSourceOther && (
              <span className="form-error">{errors.infoSourceOther.message}</span>
            )}
          </div>
        )}

        {watchInfoSourceType !== "PACIENTE" &&
          watchInfoSourceType !== "HISTORIA_CLINICA" &&
          (watchInfoSourceType as string) !== "" && (
            <>
              <div>
                <label className="form-label">Nombre del Informante</label>
                <input
                  {...register("infoSourceName")}
                  className="input-field"
                  placeholder="Nombre de quien da la info"
                />
              </div>
              <div>
                <label className="form-label">Teléfono del Informante</label>
                <input {...register("infoSourcePhone")} className="input-field" />
              </div>
            </>
          )}

        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Observaciones (Opcional)</label>
          <textarea
            {...register("infoSourceObservations")}
            className="input-field"
            rows={3}
            placeholder="Anotaciones relevantes sobre la recolección de datos..."
          />
        </div>
      </div>
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
        onClick={() => setCurrentTab((prev) => Math.min(TABS.length - 1, prev + 1))}
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
      }}
    >
      <WcButton variant="danger" onClick={onClose} disabled={isPending}>
        Cancelar
      </WcButton>
      <WcButton
        variant="primary"
        disabled={isPending || (isEditMode && !isDirty)}
        onClick={handleSubmit(onSubmit, onError)}
      >
        {isPending && <Icon name="icon-loader" size={16} className="spin" />}
        {isEditMode ? "Guardar Cambios" : "Crear Paciente"}
      </WcButton>
    </div>
  );

  return (
    <WcModal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? "Editar Paciente" : "Registrar Nuevo Paciente"}
      maxWidth="700px"
      disableBackdropClick={isPending}
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
          <span style={{ marginLeft: "var(--space-3)" }}>Cargando datos...</span>
        </div>
      ) : (
        <form id="patient-form" onSubmit={handleSubmit(onSubmit, onError)}>
          <div style={{ padding: "var(--space-2)" }}>
            <WcTabsFolder
              tabs={tabsData}
              activeIndex={currentTab}
              onChange={setCurrentTab}
              headerExtra={tabNav}
            />
          </div>
        </form>
      )}
    </WcModal>
  );
}
