import { lazy, Suspense, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { sendMessageSchema } from "@/presentation/modules/messaging/schemas/message.schema";
import { useMessageDraft } from "@/presentation/modules/messaging/hooks/useMessageDraft";
import { useThemeStore } from "@/presentation/modules/shared/stores/themeStore";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface MessageComposerProps {
  conversationId: string;
  disabled?: boolean;
  onSend: (content: string) => Promise<void> | void;
  onTyping?: () => void;
  isSending?: boolean;
  autoFocus?: boolean;
}

export function MessageComposer({
  conversationId,
  disabled = false,
  onSend,
  onTyping,
  isSending = false,
  autoFocus = false,
}: MessageComposerProps) {
  const { draft, setDraft, clearDraft } = useMessageDraft(conversationId);
  const [error, setError] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiContainerRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, conversationId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [draft]);

  useEffect(() => {
    if (!isEmojiPickerOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (
        emojiContainerRef.current &&
        target &&
        !emojiContainerRef.current.contains(target)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setIsEmojiPickerOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEmojiPickerOpen]);

  const handleChange = (value: string) => {
    setDraft(value);
    if (error) setError(null);
    if (onTyping && value.length > 0) onTyping();
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleChange(draft + emoji);
      return;
    }
    const start = textarea.selectionStart ?? draft.length;
    const end = textarea.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    handleChange(next);
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      textarea.focus();
      try {
        textarea.setSelectionRange(pos, pos);
      } catch {
        /* setSelectionRange can throw on certain input types; ignore */
      }
    });
  };

  const submit = async () => {
    const result = sendMessageSchema.safeParse({ content: draft });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Mensaje invalido");
      return;
    }
    const content = result.data.content;
    try {
      await onSend(content);
      clearDraft();
      setIsEmojiPickerOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo enviar";
      setError(message);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled || isSending) return;
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (disabled || isSending) return;
      submit();
    }
  };

  return (
    <>
      {error && <div className="msg-composer-error">{error}</div>}
      <form className="msg-composer" onSubmit={handleSubmit}>
        <div className="msg-composer-emoji-wrapper" ref={emojiContainerRef}>
          <WcButtonIcon
            icon="icon-smile"
            variant="ghost"
            shape="circle"
            type="button"
            disabled={disabled || isSending}
            onClick={() => setIsEmojiPickerOpen((open) => !open)}
            aria-label="Insertar emoji"
            title="Insertar emoji"
          />
          {isEmojiPickerOpen && (
            <div className="msg-composer-emoji-popover">
              <Suspense fallback={<div className="msg-composer-emoji-loading">Cargando...</div>}>
                <EmojiPicker
                  onEmojiClick={(data) => insertEmoji(data.emoji)}
                  theme={theme === "dark" ? ("dark" as never) : ("light" as never)}
                  width="100%"
                  height={300}
                  searchPlaceHolder="Buscar emoji"
                  lazyLoadEmojis
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled
                />
              </Suspense>
            </div>
          )}
        </div>
        <textarea
          ref={textareaRef}
          className={`msg-composer-textarea${error ? " error" : ""}`}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          maxLength={4000}
          disabled={disabled || isSending}
        />
        <WcButtonIcon
          icon="icon-send"
          variant="primary"
          shape="circle"
          type="submit"
          disabled={disabled || isSending || draft.trim().length === 0}
          aria-label="Enviar mensaje"
        />
      </form>
    </>
  );
}
