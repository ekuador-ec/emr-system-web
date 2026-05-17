import type { ReactNode } from "react";
import "./ReportSection.css";

interface ReportSectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function ReportSection({
  title,
  description,
  actions,
  footer,
  children,
}: ReportSectionProps) {
  return (
    <section className="reports-section">
      <header className="reports-section__header">
        <div className="reports-section__titles">
          <h2 className="reports-section__title">{title}</h2>
          {description ? (
            <p className="reports-section__description">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="reports-section__actions">{actions}</div>
        ) : null}
      </header>
      <div className="reports-section__body">{children}</div>
      {footer ? <footer className="reports-section__footer">{footer}</footer> : null}
    </section>
  );
}
