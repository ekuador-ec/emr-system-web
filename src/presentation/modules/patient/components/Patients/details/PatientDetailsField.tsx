import type { ReactNode } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

interface PatientDetailsFieldProps {
  label: string;
  value?: ReactNode;
  icon?: string;
  emphasis?: "default" | "strong" | "muted";
  multiline?: boolean;
  fullWidth?: boolean;
  fallback?: string;
}

export function PatientDetailsField({
  label,
  value,
  icon,
  emphasis = "default",
  multiline = false,
  fullWidth = false,
  fallback = "N/R",
}: PatientDetailsFieldProps) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    !(typeof value === "string" && value.trim() === "");

  const classes = [
    "patient-detail-field",
    fullWidth ? "patient-detail-field--full" : "",
    multiline ? "patient-detail-field--multiline" : "",
    !hasValue ? "patient-detail-field--empty" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <span className="patient-detail-field__label">
        {icon ? (
          <Icon
            name={icon}
            size={12}
            className="patient-detail-field__label-icon"
          />
        ) : null}
        {label}
      </span>
      <span
        className={`patient-detail-field__value patient-detail-field__value--${emphasis}`}
      >
        {hasValue ? value : fallback}
      </span>
    </div>
  );
}
