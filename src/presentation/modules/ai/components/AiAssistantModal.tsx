import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WcModal } from "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useAiAssistantStore } from "@/presentation/modules/ai/stores/useAiAssistantStore";
import {
  useGenerateAiSummary,
  useLatestAiSummary,
} from "@/presentation/modules/ai/hooks/useAiSummary";
import {
  useAiConversation,
  useStartAiConversation,
} from "@/presentation/modules/ai/hooks/useAiConversations";
import { useStreamAiChat } from "@/presentation/modules/ai/hooks/useStreamAiChat";
import { aiServiceConfigured } from "@/infrastructure/modules/ai/config";
import { MarkdownRenderer } from "@/presentation/modules/ai/components/MarkdownRenderer";
import { ModelPreferenceSelector } from "@/presentation/modules/ai/components/ModelPreferenceSelector";
import { ChatBubble } from "@/presentation/modules/ai/components/ChatBubble";
import type { GenerateSummaryInput } from "@/domain/modules/ai/repositories/AiServiceRepository";
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

  const latestSummary = useLatestAiSummary(target?.kind ?? "medical_record", target?.entityId);
  const generateMutation = useGenerateAiSummary();
  const startConversationMutation = useStartAiConversation();
  const conversationQuery = useAiConversation(activeConversationId);

  const chat = useStreamAiChat(activeConversationId);
  const [draft, setDraft] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const summary = latestSummary.data ?? null;

  useEffect(() => {
    if (!isOpen) setDraft("");
  }, [isOpen]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [conversationQuery.data?.messages.length, chat.streamingDraft]);

  const handleGenerate = useCallback(
    async (forceRefresh: boolean) => {
      if (!target) return;
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
          kind: target.kind,
          entityId: target.entityId,
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
    [target, payloadBuilder, preference, generateMutation, addToast],
  );

  const handleStartConversation = useCallback(async () => {
    if (!target || !summary) return;
    try {
      const conversation = await startConversationMutation.mutateAsync({
        kind: target.kind,
        entityId: target.entityId,
        summaryId: summary.id,
        modelPreference: preference,
        title: `Chat ${target.label}`,
      });
      setActiveConversation(conversation.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      addToast({ type: "error", message, duration: 6000 });
    }
  }, [target, summary, preference, startConversationMutation, setActiveConversation, addToast]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || !activeConversationId || chat.isStreaming) return;
    setDraft("");
    await chat.send(trimmed);
  }, [draft, activeConversationId, chat]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const messages = useMemo(() => conversationQuery.data?.messages ?? [], [conversationQuery.data]);

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
      maxWidth="720px"
    >
      <div className="ai-assistant-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <ModelPreferenceSelector
            value={preference}
            onChange={setPreference}
            disabled={generateMutation.isPending || chat.isStreaming}
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
              <Icon name="icon-stethoscope" size={36} />
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

        {activeConversationId && (
          <div className="ai-assistant-chat">
            <div className="ai-assistant-chat__messages" ref={messagesRef}>
              {conversationQuery.isLoading ? (
                <div style={{ color: "var(--color-text-secondary)", padding: "var(--space-3)" }}>
                  Cargando mensajes...
                </div>
              ) : messages.length === 0 && !chat.isStreaming ? (
                <div
                  style={{
                    color: "var(--color-text-secondary)",
                    padding: "var(--space-3)",
                    fontSize: "0.85rem",
                  }}
                >
                  Empieza a preguntar lo que necesites profundizar del caso.
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <ChatBubble key={m.id} role={m.role} content={m.content} />
                  ))}
                  {chat.isStreaming && chat.streamingDraft && (
                    <ChatBubble role="assistant" content={chat.streamingDraft} isStreaming />
                  )}
                  {chat.isStreaming && !chat.streamingDraft && (
                    <div style={{ padding: "var(--space-2)", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                      Procesando respuesta...
                    </div>
                  )}
                </>
              )}
              {chat.error && (
                <div
                  style={{
                    margin: "var(--space-2) 0",
                    padding: "var(--space-2)",
                    color: "var(--color-danger)",
                    fontSize: "0.85rem",
                  }}
                >
                  {chat.error}
                </div>
              )}
            </div>

            <div className="ai-assistant-chat__composer">
              <textarea
                className="ai-assistant-chat__textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta algo sobre este caso..."
                disabled={chat.isStreaming}
                rows={1}
              />
              <WcButton
                variant="primary"
                onClick={() => void handleSendMessage()}
                disabled={chat.isStreaming || draft.trim().length === 0}
              >
                <Icon name="icon-send" size={16} />
                Enviar
              </WcButton>
            </div>
          </div>
        )}
      </div>
    </WcModal>
  );
}
