import { useState, useRef, useEffect, type ReactNode } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/shared/components/ui/webcomponents/Headers/WcModuleHeader.css";

interface WcModuleHeaderProps {
  moduleName: string;
  moduleIcon?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function WcModuleHeader({
  moduleName,
  moduleIcon,
  title,
  description,
  children,
}: WcModuleHeaderProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInfoOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isInfoOpen]);

  return (
    <div className="wc-module-header">
      <div className="wc-module-header__label">
        {moduleIcon && <Icon name={moduleIcon} size={14} />}
        {moduleName}
      </div>

      <div className="wc-module-header__content">
        <div className="wc-module-header__title-section">
          <h1 className="wc-module-header__title">{title}</h1>
          <div className="wc-module-header__info" ref={infoRef}>
            <button
              type="button"
              className="wc-module-header__info-btn"
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              aria-label="Más información"
            >
              <Icon name="icon-info-circle" size={14} />
            </button>
            
            {isInfoOpen && (
              <div className="wc-module-header__info-popover">
                <p>{description}</p>
              </div>
            )}
          </div>
        </div>

        {children && (
          <div className="wc-module-header__actions">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
