import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import "./wcTextareaExpand.css";

interface WcTextareaExpandProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export function WcTextareaExpand({
  value,
  onChange,
  placeholder = "Escriba aquí...",
  rows,
  minRows = 2,
  maxRows = 5,
  disabled = false,
  error,
  label,
}: WcTextareaExpandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalTextareaRef = useRef<HTMLTextAreaElement>(null);

  const initialRows = rows ?? minRows;

  const autosize = useCallback(
    (ta: HTMLTextAreaElement | null) => {
      if (!ta) return;
      const styles = window.getComputedStyle(ta);
      const lineHeight = parseFloat(styles.lineHeight) || 21;
      const paddingY =
        (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
      const borderY =
        (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0);
      const minHeight = lineHeight * minRows + paddingY + borderY;
      const maxHeight = lineHeight * maxRows + paddingY + borderY;
      ta.style.height = "auto";
      const next = Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight));
      ta.style.height = `${next}px`;
      ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
    },
    [minRows, maxRows],
  );

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
    autosize(e.target);
  };

  useEffect(() => {
    autosize(textareaRef.current);
  }, [value, autosize]);

  // While expanded: focus the big editor, close on Escape / Ctrl(Cmd)+Enter,
  // and lock body scroll.
  useEffect(() => {
    if (!isExpanded) return;
    const ta = modalTextareaRef.current;
    if (ta) {
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        setIsExpanded(false);
      }
    };
    document.addEventListener("keydown", handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded]);

  const expandedOverlay = isExpanded
    ? createPortal(
        <div
          className="wc-ta-expand__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={label || "Editor"}
          onClick={() => setIsExpanded(false)}
        >
          <div className="wc-ta-expand__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="wc-ta-expand__dialog-header">
              <span className="wc-ta-expand__dialog-title">{label || "Edición ampliada"}</span>
              <WcButtonIcon
                icon="icon-x"
                variant="ghost"
                shape="circle"
                size="sm"
                onClick={() => setIsExpanded(false)}
                title="Cerrar (Esc)"
                aria-label="Cerrar"
              />
            </div>

            <textarea
              ref={modalTextareaRef}
              className="wc-ta-expand__modal-field"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
            />

            <div className="wc-ta-expand__dialog-footer">
              <span className="wc-ta-expand__hint">
                <kbd>Ctrl</kbd> + <kbd>Enter</kbd> o <kbd>Esc</kbd> para cerrar
              </span>
              <WcButton variant="primary" onClick={() => setIsExpanded(false)}>
                <Icon name="icon-check" size={16} />
                Listo
              </WcButton>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="wc-ta-expand">
      <div className="wc-ta-expand__wrap">
        <textarea
          ref={textareaRef}
          className="wc-ta-expand__field"
          data-error={error ? "true" : undefined}
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          rows={initialRows}
          disabled={disabled}
        />
        <WcButtonIcon
          icon="icon-maximize"
          variant="outline"
          shape="circle"
          size="sm"
          onClick={() => setIsExpanded(true)}
          disabled={disabled}
          title="Expandir editor"
          aria-label="Expandir editor"
          style={{
            position: "absolute",
            right: "8px",
            bottom: "12px",
            zIndex: 2,
          }}
        />
      </div>

      {error && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-danger)",
            marginTop: "4px",
            display: "block",
          }}
        >
          {error}
        </span>
      )}

      {expandedOverlay}
    </div>
  );
}
