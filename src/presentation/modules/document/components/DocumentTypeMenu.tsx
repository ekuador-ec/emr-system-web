import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { DOCUMENT_ICON, DOCUMENT_TYPES } from "@/presentation/modules/document/registry/documentRegistry";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

interface DocumentTypeMenuProps {
  label?: string;
  onSelect: (type: DocumentType) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "terciary";
}

const MENU_WIDTH = 280;

export function DocumentTypeMenu({
  label = "Nuevo documento",
  onSelect,
  disabled,
  variant = "primary",
}: DocumentTypeMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setPos({ top: rect.bottom + 6, left });
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleReposition = () => setOpen(false);

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const handleSelect = (type: DocumentType) => {
    setOpen(false);
    onSelect(type);
  };

  return (
    <div ref={triggerRef} style={{ display: "inline-flex" }}>
      <WcButton
        variant={variant}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon name="icon-plus-solid" size={16} />
        {label}
        <Icon name="icon-chevron-down" size={14} />
      </WcButton>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: MENU_WIDTH,
                zIndex: 10000,
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg, 0 16px 40px rgba(0,0,0,0.18))",
                padding: "var(--space-2)",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              {DOCUMENT_TYPES.map((def) => (
                <button
                  key={def.type}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(def.type)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-2)",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Icon name={DOCUMENT_ICON} size={18} style={{ flexShrink: 0 }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-sm)" }}>
                      {def.shortLabel}
                    </span>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                      {def.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
