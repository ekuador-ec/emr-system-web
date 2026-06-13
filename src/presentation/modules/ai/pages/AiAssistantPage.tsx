import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { useToastStore } from "@/presentation/modules/shared/components/Toaster";
import { useConfirmDialog } from "@/presentation/modules/shared/components/ui/useConfirmDialog";
import { ChatPanel } from "@/presentation/modules/ai/components/ChatPanel";
import { AiContextBanner } from "@/presentation/modules/ai/components/AiContextBanner";
import { AiConversationsModal } from "@/presentation/modules/ai/components/AiConversationsModal";
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

interface RailButton {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

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
  const [isConvModalOpen, setIsConvModalOpen] = useState(false);
  const ensuredRef = useRef(false);

  const [isGuardrailDismissed, setIsGuardrailDismissed] = useState(() => {
    return localStorage.getItem("emr:ai-assistant:guardrail-dismissed") === "true";
  });

  const handleDismissGuardrail = () => {
    setIsGuardrailDismissed(true);
    localStorage.setItem("emr:ai-assistant:guardrail-dismissed", "true");
  };

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
        title: null,
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
          ensuredRef.current = false;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        addToast({ type: "error", message, duration: 6000 });
      }
    },
    [confirm, deleteMutation, activeConversationId, addToast],
  );

  const activeConversation = activeQuery.data?.conversation ?? null;
  const activeMessages = activeQuery.data?.messages ?? [];
  const activeIsEmptyGeneral =
    !!activeConversation &&
    activeConversation.kind === "general" &&
    activeMessages.length === 0;

  const handleNewChatClick = useCallback(() => {
    if (activeIsEmptyGeneral) return;
    void handleNewGeneralChat();
  }, [activeIsEmptyGeneral, handleNewGeneralChat]);

  useEffect(() => {
    if (!aiServiceConfigured) return;
    if (conversationsQuery.isLoading) return;
    if (activeConversationId) return;
    if (conversations.length > 0) return;
    if (ensuredRef.current || startMutation.isPending) return;
    ensuredRef.current = true;
    void handleNewGeneralChat();
  }, [
    conversationsQuery.isLoading,
    activeConversationId,
    conversations.length,
    startMutation.isPending,
    handleNewGeneralChat,
  ]);

  if (!aiServiceConfigured) {
    return (
      <div className="ai-assistant-page">
        <div className="ai-assistant-page__not-configured">
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

  const railButtons: RailButton[] = [
    {
      icon: "icon-message-plus",
      label: "Nueva conversación",
      onClick: handleNewChatClick,
      disabled: startMutation.isPending,
    },
    {
      icon: "icon-messages",
      label: "Conversaciones",
      onClick: () => setIsConvModalOpen(true),
      active: isConvModalOpen,
    },
  ];

  return (
    <div className="ai-assistant-page">
      <nav className="ai-rail" aria-label="Acciones del asistente">
        <div className="ai-rail__group">
          {railButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              className={`ai-rail__btn ${btn.active ? "is-active" : ""}`}
              onClick={btn.onClick}
              disabled={btn.disabled}
              aria-label={btn.label}
            >
              <Icon name={btn.icon} size={20} />
              <span className="ai-rail__tooltip">{btn.label}</span>
            </button>
          ))}
        </div>
        <div className="ai-rail__group">
          <button
            type="button"
            className="ai-rail__btn"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <Icon name="icon-arrow-left" size={20} />
            <span className="ai-rail__tooltip">Volver</span>
          </button>
        </div>
      </nav>

      <section className="ai-chat-area">
        <header className="ai-chat-area__topbar">
          <div className="ai-chat-area__title">
            {activeConversation
              ? activeConversation.title ?? KIND_LABEL[activeConversation.kind] ?? "Nueva consulta"
              : "Asistente IA"}
          </div>
          <span
            className="ai-chat-area__beta"
            title="Funcion en fase Beta. Las respuestas son referenciales, pueden contener errores y tener limites."
          >
            Beta
          </span>
        </header>

        {!isGuardrailDismissed && (
          <div className="ai-chat-area__guardrail">
            <span>
              El asistente solo responde consultas médicas y no reemplaza el juicio clínico. No incluyas
              datos identificables del paciente en consultas generales.
            </span>
            <button
              type="button"
              onClick={handleDismissGuardrail}
              className="ai-chat-area__guardrail-close"
              title="Cerrar aviso"
              aria-label="Cerrar aviso"
            >
              <Icon name="icon-x" size={14} />
            </button>
          </div>
        )}

        {activeConversation && <AiContextBanner conversation={activeConversation} />}

        <div className="ai-chat-area__body">
          <ChatPanel
            conversationId={activeConversationId}
            emptyTitle={emptyTitleForActive}
            emptyHint={emptyHintForActive}
          />
        </div>
      </section>

      <AiConversationsModal
        isOpen={isConvModalOpen}
        onClose={() => setIsConvModalOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={handleSelect}
        onDelete={(id) => void handleDelete(id)}
        onNew={() => {
          setIsConvModalOpen(false);
          void handleNewGeneralChat();
        }}
        isLoading={conversationsQuery.isLoading}
        isCreating={startMutation.isPending}
      />
      {DialogComponent}
    </div>
  );
}
