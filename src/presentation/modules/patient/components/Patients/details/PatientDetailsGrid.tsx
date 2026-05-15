import type { ReactNode } from "react";

interface PatientDetailsGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export function PatientDetailsGrid({
  columns = 3,
  children,
  className,
}: PatientDetailsGridProps) {
  const classes = [
    "patient-detail-grid",
    `patient-detail-grid--${columns}`,
    className || "",
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={classes}>{children}</div>;
}
