import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { patientSchema, type PatientFormData } from "@/presentation/modules/patient/schemas/patient.schema";
import { useCreatePatient, useUpdatePatient, usePatient } from "@/presentation/modules/patient/hooks/usePatients";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { Cie10SearchInput } from "./Cie10SearchInput";

interface PatientCreateModalProps {
  patientId?: string | null;
  onClose: () => void;
}

const TABS = [
  { id: 0, title: "Básica", icon: "icon-user" },
  { id: 1, title: "Demografía", icon: "icon-users" },
  { id: 2, title: "Ubicación", icon: "icon-map-pin" },
  { id: 3, title: "Laboral", icon: "icon-briefcase" },
  { id: 4, title: "Contactos", icon: "icon-phone" },
  { id: 5, title: "Antecedentes", icon: "icon-activity" },
  { id: 6, title: "Fuente Info", icon: "icon-file-text" },
];

export function PatientCreateModal({ patientId, onClose }: PatientCreateModalProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const { addToast } = useToastStore();
  const { mutate: createPatient, isPending: isCreating } = useCreatePatient();
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const isPending = isCreating || isUpdating;
  
  const isEditMode = !!patientId;
  const { data: patientData, isLoading: isLoadingPatient } = usePatient(patientId || "", { enabled: isEditMode });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
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
        // Ensure arrays are at least empty arrays to prevent undefined issues
        emergencyContacts: patientData.emergencyContacts || [],
        clinicalAntecedents: patientData.clinicalAntecedents || [],
        // Format dates if needed, ensure currentlyWorks is boolean
        currentlyWorks: patientData.currentlyWorks || false,
      } as unknown as PatientFormData);
    }
  }, [isEditMode, patientData, reset]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const { fields: antecedentFields, append: appendAntecedent, remove: removeAntecedent } = useFieldArray({
    control,
    name: "clinicalAntecedents",
  });

  const watchCulturalGroup = watch("culturalGroup");
  const watchInfoSourceType = watch("infoSourceType");
  const watchCurrentlyWorks = watch("currentlyWorks");

  const handleNext = () => {
    if (currentTab < TABS.length - 1) {
      setCurrentTab((prev) => prev + 1);
    }
  };

  const onSubmit = (data: PatientFormData) => {
    if (isEditMode && patientId) {
      updatePatient({ id: patientId, data: data as any }, {
        onSuccess: () => {
          addToast({ type: "success", message: "Paciente actualizado exitosamente" });
          onClose();
        },
        onError: (error) => {
          addToast({ type: "error", message: `Error al actualizar: ${error.message}` });
        },
      });
    } else {
      createPatient(data as any, {
        onSuccess: () => {
          addToast({ type: "success", message: "Paciente creado exitosamente" });
          onClose();
        },
        onError: (error) => {
          addToast({ type: "error", message: `Error al crear: ${error.message}` });
        },
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onMouseDown={onClose}
    >
      <style>{`
        .patient-modal-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .patient-modal-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          flex-direction: column;
        }

        .patient-modal-sidebar {
          display: none;
          width: 240px;
          border-right: 1px solid var(--color-border);
          background-color: var(--color-bg-secondary);
          overflow-y: auto;
          flex-direction: column;
        }

        .patient-modal-mobile-tabs {
          display: flex;
          border-bottom: 1px solid var(--color-border);
          background-color: var(--color-bg-secondary);
          position: relative;
        }

        .tab-item {
          padding: var(--space-3) var(--space-4);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          transition: all 0.2s;
        }

        .tab-item:hover {
          background-color: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .tab-item.active {
          color: var(--color-primary);
          background-color: var(--color-primary-light);
        }

        .mobile-tab {
          flex: 1;
          text-align: center;
          justify-content: center;
          border-bottom: 2px solid transparent;
        }
        
        .mobile-tab.active {
          border-bottom: 2px solid var(--color-primary);
          color: var(--color-primary);
          background-color: transparent;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          z-index: 10;
          min-width: 200px;
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 768px) {
          .patient-modal-body {
            flex-direction: row;
          }
          .patient-modal-sidebar {
            display: flex;
          }
          .patient-modal-mobile-tabs {
            display: none;
          }
          .tab-item {
            border-left: 3px solid transparent;
            border-bottom: none;
          }
          .tab-item.active {
            border-left: 3px solid var(--color-primary);
            background-color: var(--color-primary-light);
          }
        }
      `}</style>
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "1000px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>
            {isEditMode ? "Editar Paciente" : "Registrar Nuevo Paciente"}
          </h2>
          <button type="button" className="btn-ghost" onClick={onClose} style={{ padding: "var(--space-2)" }}>
            <Icon name="icon-x" size={20} />
          </button>
        </div>

        {isLoadingPatient ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>
            <Icon name="icon-loader" size={32} className="spin" />
            <span style={{ marginLeft: "var(--space-3)" }}>Cargando datos...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="patient-modal-container">
            <div className="patient-modal-body">
              {/* Desktop Sidebar Tabs */}
              <div className="patient-modal-sidebar">
                {TABS.map((tab) => (
                  <div
                    key={tab.id}
                    className={`tab-item ${currentTab === tab.id ? "active" : ""}`}
                    onClick={() => setCurrentTab(tab.id)}
                  >
                    <Icon name={tab.icon} size={18} />
                    {tab.title}
                  </div>
                ))}
              </div>

              {/* Mobile Top Tabs */}
              <div className="patient-modal-mobile-tabs" ref={mobileMenuRef}>
                {TABS.slice(0, 2).map((tab) => (
                  <div
                    key={tab.id}
                    className={`tab-item mobile-tab ${currentTab === tab.id ? "active" : ""}`}
                    onClick={() => {
                      setCurrentTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {tab.title}
                  </div>
                ))}
                
                <div 
                  className={`tab-item mobile-tab ${currentTab >= 2 ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {currentTab >= 2 ? TABS[currentTab].title : "Más opciones"} ▾
                </div>

                {isMobileMenuOpen && (
                  <div className="dropdown-menu">
                    {TABS.slice(2).map((tab) => (
                      <div
                        key={tab.id}
                        className={`tab-item ${currentTab === tab.id ? "active" : ""}`}
                        style={{ padding: "var(--space-3) var(--space-4)" }}
                        onClick={() => {
                          setCurrentTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {tab.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Content Area */}
              <div style={{ padding: "var(--space-6)", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                
                {/* TAB 0: Información Básica */}
                <div style={{ display: currentTab === 0 ? "block" : "none" }}>
                  <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-4)" }}>Información Básica</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
                    <div>
                      <label className="form-label">Cédula / Identificación *</label>
                      <input {...register("idNumber")} className={`input-field ${errors.idNumber ? 'error' : ''}`} placeholder="Ej. 1712345678" />
                      {errors.idNumber && <span className="form-error">{errors.idNumber.message}</span>}
                    </div>
                    <div>
                      <label className="form-label">Primer Nombre *</label>
                      <input {...register("firstName")} className={`input-field ${errors.firstName ? 'error' : ''}`} />
                      {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                    </div>
                    <div>
                      <label className="form-label">Segundo Nombre</label>
                      <input {...register("middleName")} className="input-field" />
                    </div>
                    <div>
                      <label className="form-label">Apellido Paterno *</label>
                      <input {...register("lastName")} className={`input-field ${errors.lastName ? 'error' : ''}`} />
                      {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                    </div>
                    <div>
                      <label className="form-label">Apellido Materno</label>
                      <input {...register("secondLastName")} className="input-field" />
                    </div>
                    <div>
                      <label className="form-label">Fecha de Nacimiento *</label>
                      <input type="date" {...register("birthDate")} className={`input-field ${errors.birthDate ? 'error' : ''}`} />
                      {errors.birthDate && <span className="form-error">{errors.birthDate.message}</span>}
                    </div>
                    <div>
                      <label className="form-label">Género *</label>
                      <select {...register("gender")} className={`input-field ${errors.gender ? 'error' : ''}`}>
                        <option value="">Seleccione...</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                      </select>
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
                      <input type="email" {...register("email")} className={`input-field ${errors.email ? 'error' : ''}`} />
                      {errors.email && <span className="form-error">{errors.email.message}</span>}
                    </div>
                    <div>
                      <label className="form-label">Teléfono</label>
                      <input {...register("phone")} className={`input-field ${errors.phone ? 'error' : ''}`} />
                      {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                    </div>
                  </div>
                </div>

                {/* TAB 1: Datos Demográficos */}
                <div style={{ display: currentTab === 1 ? "block" : "none" }}>
                  <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-4)" }}>Datos Demográficos</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
                    <div>
                      <label className="form-label">Nacionalidad</label>
                      <input {...register("nationality")} className="input-field" placeholder="Ej. Ecuatoriana" />
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
                        <input {...register("culturalGroupOther")} className={`input-field ${errors.culturalGroupOther ? 'error' : ''}`} />
                        {errors.culturalGroupOther && <span className="form-error">{errors.culturalGroupOther.message}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* TAB 2: Ubicación */}
                <div style={{ display: currentTab === 2 ? "block" : "none" }}>
                  <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-4)" }}>Ubicación Domiciliaria</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Dirección Domicilio *</label>
                      <input {...register("homeAddress")} className={`input-field ${errors.homeAddress ? 'error' : ''}`} placeholder="Calle principal, secundaria y numeración" />
                      {errors.homeAddress && <span className="form-error">{errors.homeAddress.message}</span>}
                    </div>
                    <div>
                      <label className="form-label">Barrio / Sector</label>
                      <input {...register("neighborhood")} className="input-field" />
                    </div>
                  </div>
                </div>

                {/* TAB 3: Información Laboral */}
                <div style={{ display: currentTab === 3 ? "block" : "none" }}>
                  <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-4)" }}>Información Laboral</h3>
                  <div style={{ marginBottom: "var(--space-4)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
                      <input type="checkbox" {...register("currentlyWorks")} style={{ width: "16px", height: "16px" }} />
                      <span style={{ fontSize: "var(--font-size-sm)" }}>El paciente trabaja actualmente</span>
                    </label>
                  </div>
                  
                  {watchCurrentlyWorks && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)", padding: "var(--space-4)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
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

                {/* TAB 4: Contactos de Emergencia */}
                <div style={{ display: currentTab === 4 ? "block" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                    <h3 style={{ fontSize: "var(--font-size-base)", margin: 0 }}>Contactos de Emergencia</h3>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => appendContact({ name: "", kinship: "OTRO", phone: "" })}
                      style={{ padding: "var(--space-2) var(--space-3)", fontSize: "var(--font-size-sm)" }}
                    >
                      <Icon name="icon-plus" size={14} /> Añadir Contacto
                    </button>
                  </div>
                  
                  {contactFields.length === 0 ? (
                    <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-secondary)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
                      No hay contactos de emergencia registrados.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                      {contactFields.map((field, index) => (
                        <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "var(--space-4)", alignItems: "start", padding: "var(--space-4)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", position: "relative" }}>
                          <input type="hidden" {...register(`emergencyContacts.${index}.id` as const)} />
                          <div>
                            <label className="form-label">Nombre *</label>
                            <input {...register(`emergencyContacts.${index}.name` as const)} className={`input-field ${errors.emergencyContacts?.[index]?.name ? 'error' : ''}`} />
                            {errors.emergencyContacts?.[index]?.name && <span className="form-error">{errors.emergencyContacts[index]?.name?.message}</span>}
                          </div>
                          <div>
                            <label className="form-label">Parentesco *</label>
                            <select {...register(`emergencyContacts.${index}.kinship` as const)} className={`input-field ${errors.emergencyContacts?.[index]?.kinship ? 'error' : ''}`}>
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
                            {errors.emergencyContacts?.[index]?.kinship && <span className="form-error">{errors.emergencyContacts[index]?.kinship?.message}</span>}
                          </div>
                          <div>
                            <label className="form-label">Teléfono *</label>
                            <input {...register(`emergencyContacts.${index}.phone` as const)} className={`input-field ${errors.emergencyContacts?.[index]?.phone ? 'error' : ''}`} />
                            {errors.emergencyContacts?.[index]?.phone && <span className="form-error">{errors.emergencyContacts[index]?.phone?.message}</span>}
                          </div>
                          <div style={{ paddingTop: "28px" }}>
                            <button type="button" className="btn-ghost" onClick={() => removeContact(index)} style={{ color: "var(--color-danger)" }}>
                              <Icon name="icon-trash" size={16} />
                            </button>
                          </div>
                          {watch(`emergencyContacts.${index}.kinship`) === "OTRO" && (
                            <div style={{ gridColumn: "1 / -1" }}>
                              <label className="form-label">Especificar Parentesco *</label>
                              <input {...register(`emergencyContacts.${index}.kinshipOther` as const)} className={`input-field ${errors.emergencyContacts?.[index]?.kinshipOther ? 'error' : ''}`} />
                              {errors.emergencyContacts?.[index]?.kinshipOther && <span className="form-error">{errors.emergencyContacts[index]?.kinshipOther?.message}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TAB 5: Antecedentes Clínicos */}
                <div style={{ display: currentTab === 5 ? "block" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                    <h3 style={{ fontSize: "var(--font-size-base)", margin: 0 }}>Antecedentes Clínicos</h3>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => appendAntecedent({ antecedentType: "CLINICO" })}
                      style={{ padding: "var(--space-2) var(--space-3)", fontSize: "var(--font-size-sm)" }}
                    >
                      <Icon name="icon-plus" size={14} /> Añadir Antecedente
                    </button>
                  </div>
                  
                  {antecedentFields.length === 0 ? (
                    <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-secondary)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
                      No hay antecedentes registrados.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                      {antecedentFields.map((field, index) => (
                        <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "var(--space-4)", alignItems: "start", padding: "var(--space-4)", backgroundColor: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
                          <input type="hidden" {...register(`clinicalAntecedents.${index}.id` as const)} />
                          <div>
                            <label className="form-label">Tipo *</label>
                            <select {...register(`clinicalAntecedents.${index}.antecedentType` as const)} className={`input-field ${errors.clinicalAntecedents?.[index]?.antecedentType ? 'error' : ''}`}>
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
                            {errors.clinicalAntecedents?.[index]?.antecedentType && <span className="form-error">{errors.clinicalAntecedents[index]?.antecedentType?.message}</span>}
                          </div>
                          <div>
                            <label className="form-label">Fecha de Diagnóstico</label>
                            <input type="date" {...register(`clinicalAntecedents.${index}.diagnosisDate` as const)} className="input-field" />
                          </div>
                          <div style={{ paddingTop: "28px" }}>
                            <button type="button" className="btn-ghost" onClick={() => removeAntecedent(index)} style={{ color: "var(--color-danger)" }}>
                              <Icon name="icon-trash" size={16} />
                            </button>
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Patología (CIE-10)</label>
                            <Cie10SearchInput
                              value={watch(`clinicalAntecedents.${index}.pathologyId`)}
                              onChange={(id) => {
                                setValue(`clinicalAntecedents.${index}.pathologyId`, id || undefined, { shouldValidate: true });
                              }}
                            />
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Descripción</label>
                            <textarea {...register(`clinicalAntecedents.${index}.description` as const)} className="input-field" rows={2} />
                          </div>
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Tratamiento</label>
                            <input {...register(`clinicalAntecedents.${index}.treatment` as const)} className="input-field" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TAB 6: Fuente de Información */}
                <div style={{ display: currentTab === 6 ? "block" : "none" }}>
                  <h3 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-4)" }}>Fuente de la Información</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
                    <div>
                      <label className="form-label">Fuente de la Información *</label>
                      <select {...register("infoSourceType")} className={`input-field ${errors.infoSourceType ? 'error' : ''}`}>
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
                      {errors.infoSourceType && <span className="form-error">{errors.infoSourceType.message}</span>}
                    </div>
                    
                    {watchInfoSourceType === "OTRO" && (
                      <div>
                        <label className="form-label">Especifique Fuente *</label>
                        <input {...register("infoSourceOther")} className={`input-field ${errors.infoSourceOther ? 'error' : ''}`} />
                        {errors.infoSourceOther && <span className="form-error">{errors.infoSourceOther.message}</span>}
                      </div>
                    )}

                    {watchInfoSourceType !== "PACIENTE" && watchInfoSourceType !== "HISTORIA_CLINICA" && (watchInfoSourceType as string) !== "" && (
                      <>
                        <div>
                          <label className="form-label">Nombre del Informante</label>
                          <input {...register("infoSourceName")} className="input-field" placeholder="Nombre de quien da la info" />
                        </div>
                        <div>
                          <label className="form-label">Teléfono del Informante</label>
                          <input {...register("infoSourcePhone")} className="input-field" />
                        </div>
                      </>
                    )}

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Observaciones (Opcional)</label>
                      <textarea {...register("infoSourceObservations")} className="input-field" rows={3} placeholder="Anotaciones relevantes sobre la recolección de datos..." />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div
              style={{
                padding: "var(--space-4) var(--space-6)",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "var(--color-bg-secondary)",
              }}
            >
              <button
                type="button"
                className="btn-ghost"
                onClick={onClose}
              >
                Cancelar
              </button>
              
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                {currentTab < TABS.length - 1 && (
                  <button type="button" className="btn-secondary" onClick={handleNext}>
                    Siguiente
                  </button>
                )}
                <button type="submit" className="btn-primary" disabled={isPending} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  {isPending && <Icon name="icon-loader" size={16} className="spin" />}
                  {isEditMode ? "Guardar Cambios" : "Crear Paciente"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
