import type { AiModelPreference } from "@/domain/modules/ai/models/Summary";

interface ModelPreferenceSelectorProps {
  value: AiModelPreference;
  onChange: (preference: AiModelPreference) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{ value: AiModelPreference; label: string; description: string }> = [
  {
    value: "auto",
    label: "Auto (OpenRouter)",
    description: "Rotacion automatica entre varios LLMs",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    description: "Modelo fijo DeepSeek",
  },
];

export function ModelPreferenceSelector({
  value,
  onChange,
  disabled,
}: ModelPreferenceSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Preferencia de modelo"
      style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md, 8px)",
              border: isActive
                ? "1px solid var(--color-primary)"
                : "1px solid var(--color-border)",
              backgroundColor: isActive ? "var(--color-primary-soft, var(--color-bg))" : "var(--color-surface)",
              color: isActive ? "var(--color-primary)" : "var(--color-text)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              fontSize: "0.85rem",
              fontWeight: isActive ? 600 : 500,
              textAlign: "left",
              minWidth: "180px",
            }}
          >
            <div>{option.label}</div>
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 400,
                color: "var(--color-text-secondary)",
                marginTop: "2px",
              }}
            >
              {option.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
