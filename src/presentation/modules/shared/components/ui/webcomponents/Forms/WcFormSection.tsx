import { useId, type ReactNode } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "./WcFormSection.css";

interface WcFormSectionProps {
  title: string;
  subtitle?: string;
  info?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WcFormSection({
  title,
  subtitle,
  info,
  icon,
  actions,
  children,
  className,
}: WcFormSectionProps) {
  const rootClassName = className
    ? `wc-form-section ${className}`
    : "wc-form-section";

  const popoverId = useId();

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
            <div className="wc-form-section__title-row">
              <h3 className="wc-form-section__title">{title}</h3>
              {info ? (
                <span className="wc-form-section__info">
                  <button
                    type="button"
                    className="wc-form-section__info-btn"
                    aria-label={`Más información sobre ${title}`}
                    aria-describedby={popoverId}
                  >
                    <Icon name="icon-info-circle" size={14} />
                  </button>
                  <div
                    id={popoverId}
                    role="tooltip"
                    className="wc-form-section__info-popover"
                  >
                    <p>{info}</p>
                  </div>
                </span>
              ) : null}
            </div>
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
