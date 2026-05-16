import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  announceFloatingPopover,
  onFloatingPopoverOpened,
} from "@/presentation/modules/shared/utils/floatingPopoverBus";
import "./FloatingQuickActions.css";

export interface QuickActionEntry {
  label: string;
  icon: string;
  route?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface QuickActionsModule {
  module: string;
  icon: string;
  actions: QuickActionEntry[];
  disabled?: boolean;
}

interface FloatingQuickActionsProps {
  modules: QuickActionsModule[];
}

export function FloatingQuickActions({ modules }: FloatingQuickActionsProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
      setExpandedIndex(null);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setExpandedIndex(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  useEffect(() => {
    return onFloatingPopoverOpened("quick-actions", () => {
      setIsOpen(false);
      setExpandedIndex(null);
    });
  }, []);

  const handleToggle = () => {
    setIsOpen((value) => {
      const next = !value;
      if (next) announceFloatingPopover("quick-actions");
      else setExpandedIndex(null);
      return next;
    });
  };

  const handleModuleClick = (index: number, mod: QuickActionsModule) => {
    if (mod.disabled || mod.actions.length === 0) return;
    setExpandedIndex((current) => (current === index ? null : index));
  };

  const handleActionClick = (action: QuickActionEntry) => {
    if (action.disabled) return;
    if (action.onClick) action.onClick();
    if (action.route) navigate(action.route);
    setIsOpen(false);
    setExpandedIndex(null);
  };

  return (
    <div ref={wrapperRef} className="floating-quick-actions">
      <button
        type="button"
        className={`floating-quick-actions__trigger${isOpen ? " is-open" : ""}`}
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Acciones rápidas"
        title="Acciones rápidas"
      >
        <Icon name="icon-menu-solid" size={16} />
      </button>

      {isOpen && (
        <div className="floating-quick-actions__menu" role="menu">
          <div className="floating-quick-actions__menu-title">Acciones rápidas</div>

          <div className="floating-quick-actions__list">
            {modules.map((mod, index) => {
              const isExpanded = expandedIndex === index;
              const isDisabled = mod.disabled || mod.actions.length === 0;
              return (
                <div
                  key={mod.module}
                  className={`floating-quick-actions__module${
                    isExpanded ? " is-expanded" : ""
                  }${isDisabled ? " is-disabled" : ""}`}
                >
                  <button
                    type="button"
                    role="menuitem"
                    aria-expanded={isExpanded}
                    aria-disabled={isDisabled}
                    className="floating-quick-actions__module-trigger"
                    onClick={() => handleModuleClick(index, mod)}
                    disabled={isDisabled}
                  >
                    <span
                      className="floating-quick-actions__module-icon"
                      aria-hidden="true"
                    >
                      <Icon name={mod.icon} size={13} />
                    </span>
                    <span className="floating-quick-actions__module-label">
                      {mod.module}
                    </span>
                    {!isDisabled && (
                      <span
                        className="floating-quick-actions__module-chevron"
                        aria-hidden="true"
                      >
                        <Icon name="icon-chevron-down" size={12} />
                      </span>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="floating-quick-actions__actions" role="group">
                      {mod.actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          role="menuitem"
                          className="floating-quick-actions__action"
                          onClick={() => handleActionClick(action)}
                          disabled={action.disabled}
                        >
                          <span
                            className="floating-quick-actions__action-icon"
                            aria-hidden="true"
                          >
                            <Icon name={action.icon} size={12} />
                          </span>
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
