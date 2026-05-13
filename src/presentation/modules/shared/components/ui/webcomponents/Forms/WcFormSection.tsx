import type { ReactNode } from "react";
import "./WcFormSection.css";

interface WcFormSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WcFormSection({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
}: WcFormSectionProps) {
  const rootClassName = className
    ? `wc-form-section ${className}`
    : "wc-form-section";

  return (
    <section className={rootClassName}>
      <header className="wc-form-section__header">
        <div className="wc-form-section__heading">
          {icon ? (
            <span className="wc-form-section__icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <div className="wc-form-section__text">
            <h3 className="wc-form-section__title">{title}</h3>
            {subtitle ? (
              <p className="wc-form-section__subtitle">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="wc-form-section__actions">{actions}</div>
        ) : null}
      </header>
      <div className="wc-form-section__body">{children}</div>
    </section>
  );
}
