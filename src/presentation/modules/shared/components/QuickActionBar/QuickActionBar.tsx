import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/shared/components/QuickActionBar/QuickActionBar.css";

export interface QuickAction {
  label: string;
  icon: string;
  route?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface QuickActionBarProps {
  module: string;
  icon: string;
  actions: QuickAction[];
  disabled?: boolean;
}

export function QuickActionBar({
  module,
  icon,
  actions,
  disabled = false,
}: QuickActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) return;
    
    setIsOpen(false);
    if (action.route) {
      navigate(action.route);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="quick-action-bar-container" ref={menuRef}>
      <button
        type="button"
        className={`btn-ghost quick-action-bar-btn ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""}`}
        onClick={handleToggle}
        disabled={disabled}
        title={disabled ? "Módulo Pendiente" : ""}
      >
        <Icon name={icon} size={16} />
        <span className="qab-module-label">{module}</span>
        <div className={`qab-chevron ${isOpen ? "open" : ""}`}>
          <Icon name="icon-chevron-down" size={14} />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="qab-dropdown">
          {actions.map((action, idx) => (
            <button
              key={`${action.label}-${idx}`}
              type="button"
              className={`btn-ghost qab-action-btn ${action.disabled ? "disabled" : ""}`}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              title={action.disabled ? "Acción no disponible" : ""}
            >
              <Icon name={action.icon} size={16} />
              <span className="qab-action-label">{action.label}</span>
            </button>
          ))}
          {actions.length === 0 && (
            <div className="qab-empty-state">
              Sin acciones disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
}
