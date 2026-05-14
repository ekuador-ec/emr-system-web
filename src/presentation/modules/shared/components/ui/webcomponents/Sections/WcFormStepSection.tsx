import type { ReactNode } from "react";
import "@/presentation/modules/shared/components/ui/webcomponents/Sections/WcFormStepSection.css";

interface WcFormStepSectionProps {
  step: number | string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function WcFormStepSection({
  step,
  title,
  description,
  children,
  className,
  contentClassName,
}: WcFormStepSectionProps) {
  const sectionClassName = className
    ? `wc-form-step-section ${className}`
    : "wc-form-step-section";
  const sectionContentClassName = contentClassName
    ? `wc-form-step-section__content ${contentClassName}`
    : "wc-form-step-section__content";

  return (
    <section className={sectionClassName}>
      <header className="wc-form-step-section__header">
        <span className="wc-form-step-section__badge" aria-hidden="true">
          {step}
        </span>
        <div className="wc-form-step-section__title-wrapper">
          <h4 className="wc-form-step-section__title">{title}</h4>
          {description && <p className="wc-form-step-section__description">{description}</p>}
        </div>
      </header>
      <div className={sectionContentClassName}>{children}</div>
    </section>
  );
}

