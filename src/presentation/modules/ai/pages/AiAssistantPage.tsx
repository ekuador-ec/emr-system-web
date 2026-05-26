import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";
import { ChatPanel } from "@/presentation/modules/ai/components/ChatPanel";
import { AiConversationList } from "@/presentation/modules/ai/components/AiConversationList";
import { AiContextBanner } from "@/presentation/modules/ai/components/AiContextBanner";
import {
  useAiConversation,
  useAiConversations,
  useDeleteAiConversation,
  useStartAiConversation,
} from "@/presentation/modules/ai/hooks/useAiConversations";
import { useAiAssistantStore } from "@/presentation/modules/ai/stores/useAiAssistantStore";
import { aiServiceConfigured } from "@/infrastructure/modules/ai/config";
import "@/presentation/modules/ai/pages/AiAssistantPage.css";

const KIND_LABEL: Record<string, string> = {
  medical_record: "Historia clinica",
  evolution: "Evolucion medica",
  general: "Consulta general",
};

export function AiAssistantPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToastStore();
  const { confirm, DialogComponent } = useConfirmDialog();

  const preference = useAiAssistantStore((s) => s.preference);

  const initialIdFromUrl = searchParams.get("c");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialIdFromUrl,
  );
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const [isGuardrailDismissed, setIsGuardrailDismissed] = useState(() => {
    return localStorage.getItem("emr:ai-assistant:guardrail-dismissed") === "true";
  });

  const handleDismissGuardrail = () => {
    setIsGuardrailDismissed(true);
    localStorage.setItem("emr:ai-assistant:guardrail-dismissed", "true");
  };

  useEffect(() => {
    if (!isMobileListOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileListOpen(false);
      }
    };
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, true);
    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
    };
  }, [isMobileListOpen]);

  const conversationsQuery = useAiConversations(aiServiceConfigured);
  const activeQuery = useAiConversation(activeConversationId);
  const startMutation = useStartAiConversation();
  const deleteMutation = useDeleteAiConversation();

  const conversations = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  );

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && !initialIdFromUrl) {
      const first = conversations[0];
      if (first) setActiveConversationId(first.id);
    }
  }, [conversations, activeConversationId, initialIdFromUrl]);

  useEffect(() => {
    if (activeConversationId) {
      setSearchParams({ c: activeConversationId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeConversationId, setSearchParams]);

  const handleSelect = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  const handleNewGeneralChat = useCallback(async () => {
    if (!aiServiceConfigured) return;
    try {
      const conversation = await startMutation.mutateAsync({
        kind: "general",
        entityId: null,
        modelPreference: preference,
        title: `Consulta ${new Date().toLocaleDateString()}`,
      });
      setActiveConversationId(conversation.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      addToast({ type: "error", message, duration: 6000 });
    }
  }, [preference, startMutation, addToast]);

  const handleDelete = useCallback(
    async (conversationId: string) => {
      const ok = await confirm({
        title: "Eliminar conversacion",
        message: "Esta accion eliminara la conversacion y todos sus mensajes. No se puede deshacer.",
        confirmText: "Eliminar",
        type: "danger",
      });
      if (!ok) return;
      try {
        await deleteMutation.mutateAsync(conversationId);
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        addToast({ type: "error", message, duration: 6000 });
      }
    },
    [confirm, deleteMutation, activeConversationId, addToast],
  );

  const activeConversation = activeQuery.data?.conversation ?? null;

  if (!aiServiceConfigured) {
    return (
      <div className="ai-assistant-page">
        <div
          style={{
            padding: "var(--space-6)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md, 8px)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-secondary)",
          }}
        >
          El asistente IA no esta configurado. Faltan las variables de entorno
          <code> VITE_AI_SERVICE_URL </code> y <code> VITE_AI_SERVICE_API_KEY </code>.
          Contacta al administrador del sistema.
        </div>
      </div>
    );
  }

  const emptyTitleForActive = activeConversation
    ? activeConversation.kind === "general"
      ? "Pregunta lo que necesites sobre medicina"
      : "Continua la conversacion clinica"
    : "Hola, en que puedo ayudarte?";
  const emptyHintForActive = activeConversation
    ? activeConversation.kind === "general"
      ? "Diagnosticos diferenciales, farmacologia, protocolos, CIE-10."
      : "El asistente tiene el contexto del resumen clinico cargado. Pregunta lo que quieras profundizar."
    : "Selecciona una conversacion o inicia una nueva.";

  return (
    <div className="ai-assistant-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "var(--color-text)" }}>Asistente IA clinico</h2>
          <p
            style={{
              margin: 0,
              marginTop: "4px",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
            }}
          >
            Consulta dudas medicas o continua conversaciones abiertas sobre historias clinicas y evoluciones.
          </p>
        </div>
        <WcButton variant="terciary" onClick={() => navigate(-1)}>
          <Icon name="icon-arrow-left" size={16} />
          Volver
        </WcButton>
      </div>

      {!isGuardrailDismissed && (
        <div className="ai-assistant-page__guardrail">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: "var(--color-text)" }}>Aviso importante:</strong> el asistente solo responde
              consultas médicas, clínicas y de salud. No reemplaza el juicio clínico ni la evaluación
              presencial del paciente. Las conversaciones generales no se vinculan a ningún paciente y
              no deben contener datos identificables (nombres, cédulas, direcciones).
            </div>
            <button
              type="button"
              onClick={handleDismissGuardrail}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                padding: "2px",
                display: "inline-flex",
                alignItems: "center",
                opacity: 0.7,
                transition: "opacity 0.15s ease",
              }}
              title="Cerrar aviso"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <Icon name="icon-x" size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="ai-assistant-page__layout">
        <aside className="ai-assistant-page__sidebar">
          <div className="ai-assistant-page__sidebar-header">
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>
              Conversaciones
            </div>
            <WcButton
              variant="primary"
              onClick={() => void handleNewGeneralChat()}
              disabled={startMutation.isPending}
            >
              <Icon name="icon-plus-solid" size={14} />
              Nueva
            </WcButton>
          </div>
          <div className="ai-assistant-page__sidebar-body">
            <AiConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelect={handleSelect}
              onDelete={(id) => void handleDelete(id)}
              isLoading={conversationsQuery.isLoading}
            />
          </div>
        </aside>

        <section className="ai-assistant-page__main">
          <div className="ai-assistant-page__main-header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minWidth: 0, flex: 1 }}>
              {/* Dropdown for conversations on mobile */}
              <div className="ai-mobile-conversations-dropdown" ref={mobileMenuRef}>
                <button
                  type="button"
                  className={`ai-mobile-conversations-btn ${isMobileListOpen ? "is-open" : ""}`}
                  onClick={() => setIsMobileListOpen((v) => !v)}
                  title="Listado de conversaciones"
                >
                  <Icon name="icon-messages" size={16} />
                  <span>Chats</span>
                  <span className="ai-mobile-conversations-caret">{isMobileListOpen ? "▴" : "▾"}</span>
                </button>
                {isMobileListOpen && (
                  <div className="ai-mobile-conversations-popover card">
                    <div className="ai-mobile-conversations-popover__header">
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Conversaciones</span>
                      <WcButton
                        variant="primary"
                        onClick={() => {
                          void handleNewGeneralChat();
                          setIsMobileListOpen(false);
                        }}
                        disabled={startMutation.isPending}
                        style={{ padding: "4px 8px", fontSize: "0.75rem", minHeight: "28px" }}
                      >
                        <Icon name="icon-plus-solid" size={10} />
                        Nueva
                      </WcButton>
                    </div>
                    <div className="ai-mobile-conversations-popover__body">
                      <AiConversationList
                        conversations={conversations}
                        activeConversationId={activeConversationId}
                        onSelect={(id) => {
                          handleSelect(id);
                          setIsMobileListOpen(false);
                        }}
                        onDelete={(id) => void handleDelete(id)}
                        isLoading={conversationsQuery.isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeConversation?.title ?? "Selecciona una conversacion"}
                </div>
                {activeConversation && (
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    {KIND_LABEL[activeConversation.kind] ?? activeConversation.kind}
                  </div>
                )}
              </div>
            </div>
          </div>
          {activeConversation && <AiContextBanner conversation={activeConversation} />}
          <div className="ai-assistant-page__main-body">
            <ChatPanel
              conversationId={activeConversationId}
              emptyTitle={emptyTitleForActive}
              emptyHint={emptyHintForActive}
            />
          </div>
        </section>
      </div>
      {DialogComponent}
    </div>
  );
}
