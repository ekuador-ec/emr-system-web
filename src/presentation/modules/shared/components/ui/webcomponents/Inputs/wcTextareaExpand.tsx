import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";

interface WcTextareaExpandProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export function WcTextareaExpand({
  value,
  onChange,
  placeholder = "Escriba aquí...",
  rows = 3,
  disabled = false,
  error,
  label
}: WcTextareaExpandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [parentContainer, setParentContainer] = useState<HTMLElement | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (isExpanded && modalTextareaRef.current) {
      modalTextareaRef.current.style.height = "auto";
      modalTextareaRef.current.style.height = `${modalTextareaRef.current.scrollHeight}px`;
    }
  }, [isExpanded, value]);

  useEffect(() => {
    if (isExpanded && rootRef.current) {
      const section = rootRef.current.closest("section") as HTMLElement | null;
      if (section) {
        section.style.position = "relative";
        setParentContainer(section);
      }
    }
  }, [isExpanded]);

  const expandedOverlay = isExpanded && parentContainer
    ? createPortal(
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            borderRadius: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "var(--space-4, 20px)"
          }}
          onClick={() => setIsExpanded(false)}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "520px",
              backgroundColor: "var(--color-surface, #ffffff)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg, 12px)",
              padding: "var(--space-4, 20px)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3, 16px)",
              maxHeight: "90%",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "var(--space-2, 12px)",
              flexShrink: 0
            }}>
              <span style={{ fontWeight: 600, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                {label || "Descripción Completa"}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                style={{
                  background: "var(--color-surface-hover, #f3f4f6)",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-secondary)",
                  transition: "all 0.2s ease"
                }}
                title="Cerrar"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-danger-light, #fee2e2)";
                  e.currentTarget.style.color = "var(--color-danger, #ef4444)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface-hover, #f3f4f6)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
              >
                <Icon name="icon-x" size={16} />
              </button>
            </div>
            
            <div style={{ overflowY: "auto", padding: "2px", display: "flex", flexDirection: "column" }}>
              <textarea
                ref={modalTextareaRef}
                value={value}
                onChange={handleInput}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus
                style={{
                  width: "100%",
                  minHeight: "150px",
                  padding: "12px",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.875rem",
                  resize: "none",
                  fontFamily: "inherit",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  lineHeight: "1.6",
                  outline: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                  ...({ fieldSizing: "content" } as React.CSSProperties)
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-primary, #3b82f6)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-border)";
                }}
              />
            </div>
          </div>
        </div>,
        parentContainer
      )
    : null;

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "12px",
            paddingRight: "48px",
            borderRadius: "var(--radius-md, 8px)",
            border: error ? "1px solid var(--color-danger)" : "1px solid var(--color-border)",
            fontSize: "0.875rem",
            resize: "none",
            fontFamily: "inherit",
            lineHeight: "1.5",
            minHeight: "80px",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            ...({ fieldSizing: "content" } as React.CSSProperties)
          }}
        />
        <WcButtonIcon
          icon="icon-maximize"
          variant="outline"
          shape="circle"
          size="sm"
          title="Expandir"
          onClick={() => setIsExpanded(true)}
          style={{
            position: "absolute",
            right: "8px",
            bottom: "15px",
            zIndex: 2,
          }}
        />
      </div>
      
      {error && (
        <span style={{ fontSize: "0.75rem", color: "var(--color-danger)", marginTop: "4px", display: "block" }}>
          {error}
        </span>
      )}

      {expandedOverlay}
    </div>
  );
}