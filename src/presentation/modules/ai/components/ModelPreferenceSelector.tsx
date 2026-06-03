import { useState, useRef, useEffect } from "react";
import type { AiModelPreference } from "@/domain/modules/ai/models/Summary";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

interface ModelPreferenceSelectorProps {
  value: AiModelPreference;
  onChange: (preference: AiModelPreference) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{ value: AiModelPreference; label: string; description: string }> = [
  {
    value: "auto",
    label: "Auto (OpenRouter)",
    description: "Rotación automática entre varios LLMs",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    description: "Modelo fijo DeepSeek",
  },
];

function optionLabel(val: AiModelPreference): string {
  return OPTIONS.find((o) => o.value === val)?.label ?? val;
}

export function ModelPreferenceSelector({
  value,
  onChange,
  disabled,
}: ModelPreferenceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, true);
    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
    };
  }, [isOpen]);

  const handleSelect = (preference: AiModelPreference) => {
    onChange(preference);
    setIsOpen(false);
  };

  return (
    <div className="ai-model-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`ai-model-dropdown__trigger ${isOpen ? "ai-model-dropdown__trigger--open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Modelo preferido para el asistente"
      >
        <span className="ai-model-dropdown__trigger-icon">
          <Icon name="icon-ia-model" size={14} />
        </span>
        <span>Modelo: {optionLabel(value)}</span>
        <span className="ai-model-dropdown__trigger-caret">{isOpen ? "▴" : "▾"}</span>
      </button>

      {isOpen && (
        <div className="ai-model-dropdown__menu" role="listbox">
          {OPTIONS.map((option) => {
            const isActive = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`ai-model-dropdown__option ${
                  isActive ? "ai-model-dropdown__option--active" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="ai-model-dropdown__option-title">{option.label}</span>
                <span className="ai-model-dropdown__option-desc">{option.description}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
