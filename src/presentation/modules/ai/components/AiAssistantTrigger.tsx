import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import {
  useAiAssistantStore,
  type AiAssistantTarget,
} from "@/presentation/modules/ai/stores/useAiAssistantStore";

interface AiAssistantTriggerProps {
  target: AiAssistantTarget | null;
  label?: string;
  variant?: "primary" | "secondary" | "terciary";
  disabled?: boolean;
}

export function AiAssistantTrigger({
  target,
  label = "Resumir con IA",
  variant = "secondary",
  disabled,
}: AiAssistantTriggerProps) {
  const open = useAiAssistantStore((s) => s.open);

  return (
    <WcButton
      variant={variant}
      onClick={() => target && open(target)}
      disabled={disabled || !target}
      title={!target ? "Cargando datos..." : "Abrir asistente clinico IA"}
    >
      <Icon name="icon-ia-chat" size={16} />
      {label}
    </WcButton>
  );
}
