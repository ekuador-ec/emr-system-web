import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ChangeEvent, RefObject } from "react";
import type { AiModelPreference } from "@/domain/modules/ai/models/Summary";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/ai/components/ChatComposer.css";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onAbort?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  preference: AiModelPreference;
  onChangePreference?: (preference: AiModelPreference) => void;
  isUpdatingPreference?: boolean;
  placeholder?: string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

const MODEL_OPTIONS: Array<{ value: AiModelPreference; label: string; description: string }> = [
  {
    value: "auto",
    label: "Auto",
    description: "Router automatico de OpenRouter entre modelos gratuitos",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    description: "Modelo fijo DeepSeek directo",
  },
];

function modelLabel(pref: AiModelPreference): string {
  return MODEL_OPTIONS.find((m) => m.value === pref)?.label ?? pref;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onAbort,
  isStreaming,
  disabled,
  preference,
  onChangePreference,
  isUpdatingPreference,
  placeholder,
  textareaRef,
}: ChatComposerProps) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const taRef = textareaRef ?? internalRef;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const autoResize = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [taRef]);

  useLayoutEffect(() => {
    autoResize();
  }, [value, autoResize]);

  useEffect(() => {
    window.addEventListener("resize", autoResize);
    return () => window.removeEventListener("resize", autoResize);
  }, [autoResize]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, true);
    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
    };
  }, [menuOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isStreaming && value.trim().length > 0) void onSubmit();
    }
  };

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
    autoResize();
  };

  const canSend = !isStreaming && value.trim().length > 0 && !disabled;
  const showStop = isStreaming && !!onAbort;

  return (
    <div className="ai-composer">
      <textarea
        ref={taRef}
        className="ai-composer__textarea"
        value={value}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Escribe tu pregunta..."}
        rows={1}
        disabled={disabled}
      />
      <div className="ai-composer__toolbar">
        <div className="ai-composer__toolbar-left">
          <button
            type="button"
            className="ai-composer__tool"
            disabled
            title="Adjuntar archivo (proximamente)"
            aria-label="Adjuntar archivo (proximamente)"
          >
            <Icon name="icon-clip" size={18} />
          </button>
          {onChangePreference ? (
            <div className="ai-composer__model-wrap" ref={menuRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="ai-composer__model"
                onClick={() => setMenuOpen((v) => !v)}
                disabled={isUpdatingPreference}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="Modelo del asistente"
              >
                <Icon name="icon-ia-model" size={14} />
                <span>{modelLabel(preference)}</span>
                <span className="ai-composer__model-caret">{menuOpen ? "▴" : "▾"}</span>
              </button>
              {menuOpen && (
                <div className="ai-composer__model-menu" role="menu">
                  {MODEL_OPTIONS.map((opt) => {
                    const isActive = opt.value === preference;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`ai-composer__model-option ${isActive ? "ai-composer__model-option--active" : ""}`}
                        onClick={() => {
                          if (!isActive) onChangePreference(opt.value);
                          setMenuOpen(false);
                        }}
                        role="menuitemradio"
                        aria-checked={isActive}
                      >
                        <span style={{ fontWeight: isActive ? 600 : 500 }}>{opt.label}</span>
                        <span className="ai-composer__model-option-desc">{opt.description}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="ai-composer__model-badge" title="Modelo activo">
              <Icon name="icon-ia-model" size={13} />
              <span>{modelLabel(preference)}</span>
            </div>
          )}
        </div>

        <div className="ai-composer__toolbar-right">
          {showStop ? (
            <button
              type="button"
              className="ai-composer__send ai-composer__stop"
              onClick={() => onAbort?.()}
              title="Detener respuesta"
              aria-label="Detener respuesta"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              <span style={{ display: "block", width: 12, height: 12, backgroundColor: "currentColor", borderRadius: 2 }} />
            </button>
          ) : (
            <button
              type="button"
              className="ai-composer__send"
              onClick={() => void onSubmit()}
              disabled={!canSend}
              title="Enviar"
              aria-label="Enviar"
            >
              <Icon name="icon-send" size={22} className="ai-composer__send-icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
