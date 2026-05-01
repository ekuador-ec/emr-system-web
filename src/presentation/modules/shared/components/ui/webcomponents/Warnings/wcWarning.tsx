import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import "@/presentation/modules/shared/components/ui/webcomponents/Warnings/wcWarning.css";

export type WcWarningType = "destructive" | "warning" | "info";
export type WcWarningSize = "sm" | "md" | "lg";

export interface WcWarningHandle {
  open: (onConfirm?: () => void, onCancel?: () => void) => void;
  close: () => void;
}

interface WcWarningProps {
  title?: string;
  message?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: WcWarningType;
  size?: WcWarningSize;
  icon?: ReactNode;
  showIcon?: boolean;
  hideCancelButton?: boolean;
  hideConfirmButton?: boolean;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  isConfirmLoading?: boolean;
  loadingText?: string;
  closeOnBackdrop?: boolean;
  closeOnConfirm?: boolean;
  closeOnCancel?: boolean;
  closeOnEscape?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  footerContent?: ReactNode;
  className?: string;
}

const DEFAULT_TITLE = "Confirmacion";
const DEFAULT_MESSAGE = "Estas seguro de continuar?";
const DEFAULT_CONFIRM_TEXT = "Confirmar";
const DEFAULT_CANCEL_TEXT = "Cancelar";
const DEFAULT_LOADING_TEXT = "Procesando...";
const DEFAULT_ICON_BY_TYPE: Record<WcWarningType, string> = {
  destructive: "icon-trash-solid",
  warning: "icon-warning-solid",
  info: "icon-check-solid",
};

const WcWarning = forwardRef<WcWarningHandle, WcWarningProps>((props, ref) => {
  const {
    title = DEFAULT_TITLE,
    message = DEFAULT_MESSAGE,
    description,
    children,
    confirmText = DEFAULT_CONFIRM_TEXT,
    cancelText = DEFAULT_CANCEL_TEXT,
    type = "warning",
    size = "md",
    icon,
    showIcon = true,
    hideCancelButton = false,
    hideConfirmButton = false,
    confirmDisabled = false,
    cancelDisabled = false,
    isConfirmLoading = false,
    loadingText = DEFAULT_LOADING_TEXT,
    closeOnBackdrop = true,
    closeOnConfirm = true,
    closeOnCancel = true,
    closeOnEscape = true,
    isOpen,
    onOpenChange,
    onConfirm,
    onCancel,
    footerContent,
    className,
  } = props;

  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const confirmCallbackRef = useRef<(() => void) | null>(null);
  const cancelCallbackRef = useRef<(() => void) | null>(null);
  const previousBodyOverflowRef = useRef<string>("");
  const isControlled = typeof isOpen === "boolean";
  const isVisible = isControlled ? Boolean(isOpen) : isInternalOpen;
  const defaultIconName = DEFAULT_ICON_BY_TYPE[type];
  const confirmVariant = type === "info" ? "primary" : "danger";

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setIsInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    confirmCallbackRef.current = null;
    cancelCallbackRef.current = null;
  }, [setOpen]);

  const handleConfirm = useCallback(() => {
    const callback = confirmCallbackRef.current ?? onConfirm;
    callback?.();
    if (closeOnConfirm) {
      close();
    }
  }, [close, closeOnConfirm, onConfirm]);

  const handleCancel = useCallback(() => {
    const callback = cancelCallbackRef.current ?? onCancel;
    callback?.();
    if (closeOnCancel) {
      close();
    }
  }, [close, closeOnCancel, onCancel]);

  useImperativeHandle(
    ref,
    () => ({
      open: (onConfirm, onCancel) => {
        confirmCallbackRef.current = onConfirm ?? null;
        cancelCallbackRef.current = onCancel ?? null;
        setOpen(true);
      },
      close,
    }),
    [close, setOpen],
  );

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!closeOnEscape) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
  }, [closeOnEscape, handleCancel, handleConfirm, isVisible]);

  if (!isVisible) {
    return null;
  }

  const composedClassName = `wc-warning is-${type} is-${size} ${className ?? ""}`.trim();

  return (
    <div
      className="wc-warning-backdrop"
      onClick={closeOnBackdrop ? handleCancel : undefined}
      role="presentation"
    >
      <div
        className={composedClassName}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="wc-warning-title"
        aria-describedby="wc-warning-message"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="wc-warning__header">
          {showIcon ? (
            <span className="wc-warning__icon" aria-hidden="true">
              {icon ?? <Icon name={defaultIconName} size={24} />}
            </span>
          ) : null}

          <div className="wc-warning__heading">
            <h2 id="wc-warning-title" className="wc-warning__title">
              {title}
            </h2>
            {description ? (
              <p className="wc-warning__description">{description}</p>
            ) : null}
          </div>

        </header>

        <div id="wc-warning-message" className="wc-warning__content">
          {children ?? message}
        </div>

        <footer className="wc-warning__actions">
          {footerContent ?? (
            <>
              {!hideCancelButton ? (
                <WcButton
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={cancelDisabled}
                  className="wc-warning__button wc-warning__button--cancel"
                >
                  {cancelText}
                </WcButton>
              ) : null}

              {!hideConfirmButton ? (
                <WcButton
                  variant={confirmVariant}
                  onClick={handleConfirm}
                  disabled={confirmDisabled || isConfirmLoading}
                  className="wc-warning__button wc-warning__button--confirm"
                >
                  {isConfirmLoading ? loadingText : confirmText}
                </WcButton>
              ) : null}
            </>
          )}
        </footer>
      </div>
    </div>
  );
});

WcWarning.displayName = "WcWarning";

export default WcWarning;
