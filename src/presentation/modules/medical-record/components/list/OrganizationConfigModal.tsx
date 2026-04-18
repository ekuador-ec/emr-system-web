import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrganizationConfig, useUpdateOrganizationConfig } from "@/presentation/modules/medical-record/hooks/useOrganizationConfig";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { organizationConfigSchema, type OrganizationConfigFormValues } from "@/presentation/modules/medical-record/schemas/organizationConfig.schema";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/wcWarning";

interface OrganizationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrganizationConfigModal({ isOpen, onClose }: OrganizationConfigModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wcWarningRef = useRef<any>(null);
  const { data: config } = useOrganizationConfig();
  const { mutate: updateConfig, isPending } = useUpdateOrganizationConfig();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OrganizationConfigFormValues>({
    resolver: zodResolver(organizationConfigSchema),
    defaultValues: {
      institutionName: "",
      operationalUnit: "",
      operationalUnitCode: "",
      provinceCode: "",
      cantonCode: "",
      parishCode: "",
    },
  });

  useEffect(() => {
    if (config) {
      reset({
        institutionName: config.institutionName || "",
        operationalUnit: config.operationalUnit || "",
        operationalUnitCode: config.operationalUnitCode || "",
        provinceCode: config.provinceCode || "",
        cantonCode: config.cantonCode || "",
        parishCode: config.parishCode || "",
      });
    }
  }, [config, reset]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
      if (config) {
        reset({
          institutionName: config.institutionName || "",
          operationalUnit: config.operationalUnit || "",
          operationalUnitCode: config.operationalUnitCode || "",
          provinceCode: config.provinceCode || "",
          cantonCode: config.cantonCode || "",
          parishCode: config.parishCode || "",
        });
      }
    }
  }, [isOpen, config, reset]);

  const handleClose = () => {
    if (isDirty) {
      wcWarningRef.current?.open(
        () => onClose(),
        () => {}
      );
    } else {
      onClose();
    }
  };

  const onSubmit = (data: OrganizationConfigFormValues) => {
    updateConfig(data, {
      onSuccess: () => {
        addToast({ type: "success", message: "Configuracion actualizada exitosamente" });
        onClose();
      },
      onError: (err) => {
        addToast({
          type: "error",
          message: err instanceof Error ? err.message : "Error al actualizar la configuracion",
        });
      },
    });
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "8px",
    paddingRight: hasError ? "32px" : "8px",
    borderRadius: "6px",
    border: `1px solid ${hasError ? "var(--color-danger)" : "var(--color-border)"}`,
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
  });

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      className="org-config-modal"
      style={{
        padding: "0",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        maxWidth: "500px",
        width: "90vw",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        margin: "auto",
      }}
    >
      <div style={{ padding: "var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
          <h2 style={{ marginTop: 0, marginBottom: 0, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ color: "var(--color-primary)", display: "flex" }}>
              <Icon name="icon-settings" size={24} />
            </span>
            Configuracion de Encabezado
          </h2>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: "var(--space-1)", display: "flex" }}
            aria-label="Cerrar modal"
            disabled={isPending}
          >
            <Icon name="icon-x" size={20} />
          </button>
        </div>

        <p style={{ marginTop: 0, marginBottom: "var(--space-6)", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          Configura los datos institucionales que aparecen en el encabezado de las historias clinicas.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="config-institutionName" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                <Icon name="icon-building" size={16} />
              </span>
              Institucion del Sistema
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="config-institutionName"
                placeholder="Ej: Hospital General del Norte"
                {...register("institutionName")}
                disabled={isPending}
                style={inputStyle(!!errors.institutionName)}
              />
              {errors.institutionName && (
                <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                  <Icon name="icon-alert-circle" size={18} />
                </span>
              )}
            </div>
            {errors.institutionName && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.institutionName.message}</span>}
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="config-operationalUnit" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                <Icon name="icon-medical-center" size={16} />
              </span>
              Unidad Operativa
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="config-operationalUnit"
                placeholder="Ej: Consulta Externa"
                {...register("operationalUnit")}
                disabled={isPending}
                style={inputStyle(!!errors.operationalUnit)}
              />
              {errors.operationalUnit && (
                <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                  <Icon name="icon-alert-circle" size={18} />
                </span>
              )}
            </div>
            {errors.operationalUnit && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.operationalUnit.message}</span>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div>
              <label htmlFor="config-operationalUnitCode" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-code" size={16} />
                </span>
                Cod. Unidad
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="config-operationalUnitCode"
                  placeholder="Ej: UO-001"
                  {...register("operationalUnitCode")}
                  disabled={isPending}
                  style={inputStyle(!!errors.operationalUnitCode)}
                />
                {errors.operationalUnitCode && (
                  <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                    <Icon name="icon-alert-circle" size={18} />
                  </span>
                )}
              </div>
              {errors.operationalUnitCode && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.operationalUnitCode.message}</span>}
            </div>
            <div>
              <label htmlFor="config-provinceCode" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-map-pin" size={16} />
                </span>
                Cod. Provincia
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="config-provinceCode"
                  placeholder="Ej: 17"
                  {...register("provinceCode")}
                  disabled={isPending}
                  style={inputStyle(!!errors.provinceCode)}
                />
                {errors.provinceCode && (
                  <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                    <Icon name="icon-alert-circle" size={18} />
                  </span>
                )}
              </div>
              {errors.provinceCode && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.provinceCode.message}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div>
              <label htmlFor="config-cantonCode" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-map-pin" size={16} />
                </span>
                Cod. Canton
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="config-cantonCode"
                  placeholder="Ej: 01"
                  {...register("cantonCode")}
                  disabled={isPending}
                  style={inputStyle(!!errors.cantonCode)}
                />
                {errors.cantonCode && (
                  <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                    <Icon name="icon-alert-circle" size={18} />
                  </span>
                )}
              </div>
              {errors.cantonCode && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.cantonCode.message}</span>}
            </div>
            <div>
              <label htmlFor="config-parishCode" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)", display: "flex" }}>
                  <Icon name="icon-map-pin" size={16} />
                </span>
                Cod. Parroquia
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id="config-parishCode"
                  placeholder="Ej: 50"
                  {...register("parishCode")}
                  disabled={isPending}
                  style={inputStyle(!!errors.parishCode)}
                />
                {errors.parishCode && (
                  <span style={{ position: "absolute", right: "8px", color: "var(--color-danger)", display: "flex", alignItems: "center" }}>
                    <Icon name="icon-alert-circle" size={18} />
                  </span>
                )}
              </div>
              {errors.parishCode && <span style={{ color: "var(--color-danger)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>{errors.parishCode.message}</span>}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
            <WcButton
              variant="secondary"
              disabled={isPending}
              onClick={handleClose}
            >
              <Icon name="icon-x" size={16} />
              Cancelar
            </WcButton>
            <WcButton
              variant="primary"
              disabled={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              <Icon name="icon-check" size={16} />
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </WcButton>
          </div>
        </form>
      </div>

      <wc-warning
        ref={wcWarningRef}
        title="Descartar cambios"
        message="¿Estas seguro de que deseas cancelar? Perderas todos los cambios realizados."
        confirm-text="Descartar"
        cancel-text="Seguir editando"
      />

      <style>
        {`
          .org-config-modal::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }

          @media (max-width: 640px) {
            .org-config-modal {
              width: 98vw;
              max-width: 100%;
            }
          }
        `}
      </style>
    </dialog>
  );
}
