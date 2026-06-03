import { useCallback } from "react";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useAiAssistantStore } from "@/presentation/modules/ai/stores/useAiAssistantStore";
import {
  useGenerateAiSummary,
  useLatestAiSummary,
} from "@/presentation/modules/ai/hooks/useAiSummary";
import { useStartAiConversation } from "@/presentation/modules/ai/hooks/useAiConversations";
import { aiServiceConfigured } from "@/infrastructure/modules/ai/config";
import { MarkdownRenderer } from "@/presentation/modules/ai/components/MarkdownRenderer";
import { ModelPreferenceSelector } from "@/presentation/modules/ai/components/ModelPreferenceSelector";
import { ChatPanel } from "@/presentation/modules/ai/components/ChatPanel";
import type {
  GenerateSummaryInput,
} from "@/domain/modules/ai/repositories/AiServiceRepository";
import type { AiSummaryKind } from "@/domain/modules/ai/models/Summary";
import "@/presentation/modules/ai/components/AiAssistantModal.css";

interface AiAssistantModalProps {
  payloadBuilder: () => Record<string, unknown> | null;
}

export function AiAssistantModal({ payloadBuilder }: AiAssistantModalProps) {
  const isOpen = useAiAssistantStore((s) => s.isOpen);
  const target = useAiAssistantStore((s) => s.target);
  const preference = useAiAssistantStore((s) => s.preference);
  const setPreference = useAiAssistantStore((s) => s.setPreference);
  const activeConversationId = useAiAssistantStore((s) => s.activeConversationId);
  const setActiveConversation = useAiAssistantStore((s) => s.setActiveConversation);
  const close = useAiAssistantStore((s) => s.close);

  const { addToast } = useToastStore();

  const isContextBound = !!target && target.kind !== "general" && !!target.entityId;
  const summaryKind: AiSummaryKind | null = isContextBound
    ? (target.kind as AiSummaryKind)
    : null;
  const summaryEntityId = isContextBound ? target.entityId : null;

  const latestSummary = useLatestAiSummary(
    summaryKind ?? "medical_record",
    summaryEntityId,
  );
  const generateMutation = useGenerateAiSummary();
  const startConversationMutation = useStartAiConversation();

  const summary = isContextBound ? latestSummary.data ?? null : null;

  const handleGenerate = useCallback(
    async (forceRefresh: boolean) => {
      if (!target || !summaryKind || !summaryEntityId) return;
      const payload = payloadBuilder();
      if (!payload) {
        addToast({
          type: "error",
          message: "No hay datos suficientes para generar el resumen",
          duration: 5000,
        });
        return;
      }
      try {
        const input: GenerateSummaryInput = {
          kind: summaryKind,
          entityId: summaryEntityId,
          payload,
          preference,
          forceRefresh,
        };
        const result = await generateMutation.mutateAsync(input);
        addToast({
          type: "success",
          message: result.cached ? "Resumen recuperado del cache" : "Resumen generado",
          duration: 3500,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        addToast({ type: "error", message, duration: 6000 });
      }
    },
    [target, summaryKind, summaryEntityId, payloadBuilder, preference, generateMutation, addToast],
  );

  const handleStartConversation = useCallback(async () => {
    if (!target || !summary || !summaryKind || !summaryEntityId) return;
    try {
      const conversation = await startConversationMutation.mutateAsync({
        kind: summaryKind,
        entityId: summaryEntityId,
        summaryId: summary.id,
        modelPreference: preference,
        title: target.label,
      });
      setActiveConversation(conversation.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      addToast({ type: "error", message, duration: 6000 });
    }
  }, [
    target,
    summary,
    summaryKind,
    summaryEntityId,
    preference,
    startConversationMutation,
    setActiveConversation,
    addToast,
  ]);

  if (!isOpen || !target) return null;

  if (!aiServiceConfigured) {
    return (
      <WcModal
        isOpen={isOpen}
        onClose={close}
        title="Asistente IA"
        subtitle="Configuracion incompleta"
        maxWidth="540px"
      >
        <div className="ai-assistant-warning">
          El servicio de IA no esta configurado. Falta definir
          <code> VITE_AI_SERVICE_URL </code>
          y
          <code> VITE_AI_SERVICE_API_KEY </code>
          en las variables de entorno. Contacta al administrador del sistema.
        </div>
      </WcModal>
    );
  }

  return (
    <WcModal
      isOpen={isOpen}
      onClose={close}
      title={`Asistente IA - ${target.label}`}
      subtitle="Los datos enviados a la IA estan anonimizados. Solo se envia informacion clinica y identificadores internos."
      maxWidth="1200px"
    >
      <div className="ai-modal-layout">
        {/* Left Column: Summary, actions, and selector */}
        <div className="ai-modal-layout__left">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <ModelPreferenceSelector
              value={preference}
              onChange={setPreference}
              disabled={generateMutation.isPending}
            />
            {summary && (
              <div className="ai-assistant-meta">
                <span className="ai-assistant-meta__pill">Modelo: {summary.model}</span>
                <span className="ai-assistant-meta__pill">
                  {new Date(summary.createdAt).toLocaleString()}
                </span>
                {summary.tokensOutput !== null && (
                  <span className="ai-assistant-meta__pill">{summary.tokensOutput} tokens</span>
                )}
              </div>
            )}
          </div>

          <div className="ai-assistant-summary">
            {latestSummary.isLoading ? (
              <div style={{ color: "var(--color-text-secondary)" }}>Cargando resumen previo...</div>
            ) : summary ? (
              <>
                <MarkdownRenderer source={summary.content} />
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                  <WcButton
                    variant="secondary"
                    onClick={() => void handleGenerate(true)}
                    disabled={generateMutation.isPending}
                  >
                    <Icon name="icon-refresh" size={16} />
                    Regenerar
                  </WcButton>
                  {!activeConversationId && (
                    <WcButton
                      variant="primary"
                      onClick={() => void handleStartConversation()}
                      disabled={startConversationMutation.isPending}
                    >
                      <Icon name="icon-messages" size={16} />
                      {startConversationMutation.isPending ? "Iniciando..." : "Iniciar conversacion"}
                    </WcButton>
                  )}
                </div>
              </>
            ) : (
              <div className="ai-assistant-summary--empty">
                <Icon name="icon-chat-bot" size={36} />
                <div style={{ fontSize: "0.9rem", maxWidth: "440px" }}>
                  Aun no hay un resumen para {target.label}. Genera uno para que el sistema pueda
                  ofrecer apoyo clinico basado en los datos anonimizados.
                </div>
                <WcButton
                  variant="primary"
                  onClick={() => void handleGenerate(false)}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? "Generando..." : "Generar resumen"}
                </WcButton>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Panel */}
        <div className="ai-modal-layout__right">
          <ChatPanel
            conversationId={activeConversationId}
            emptyHint={
              activeConversationId
                ? "Escribe tu pregunta sobre el caso..."
                : "Haz clic en 'Iniciar conversacion' a la izquierda para empezar a profundizar en este caso."
            }
            emptyTitle="Pregunta al Asistente"
            allowModelChange={false}
          />
        </div>
      </div>
    </WcModal>
  );
}
