import { useEffect } from "react";
import type { ReactNode } from "react";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import "@/presentation/modules/shared/components/ui/webcomponents/Modals/WcModal.css";

interface WcModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseAttempt?: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  disableBackdropClick?: boolean;
  showHeaderDivider?: boolean;
  showFooterDivider?: boolean;
  contentClassName?: string;
}

export function WcModal({
  isOpen,
  onClose,
  onCloseAttempt,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "600px",
  disableBackdropClick = false,
  showHeaderDivider = true,
  showFooterDivider = true,
  contentClassName,
}: WcModalProps) {
  const handleCloseRequest = onCloseAttempt ?? onClose;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableBackdropClick) {
        handleCloseRequest();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleCloseRequest, disableBackdropClick]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!disableBackdropClick) {
      handleCloseRequest();
    }
  };

  return (
    <div
      className="wc-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wc-modal-title"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="wc-modal-container card"
        style={{ maxWidth }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`wc-modal-header ${showHeaderDivider ? "" : "wc-modal-header--no-divider"}`}>
          <div className="wc-modal-title-wrap">
            <h2 id="wc-modal-title" className="wc-modal-title">
              {title}
            </h2>
            {subtitle ? <p className="wc-modal-subtitle">{subtitle}</p> : null}
          </div>
          <div className="wc-modal-close">
            <WcButtonIcon
              variant="ghost"
              icon="icon-x"
              onClick={handleCloseRequest}
              disabled={disableBackdropClick}
              aria-label="Cerrar modal"
            />
          </div>
        </div>

        <div className={["wc-modal-content", contentClassName].filter(Boolean).join(" ")}>
          {children}
        </div>

        {footer ? (
          <div className={`wc-modal-footer ${showFooterDivider ? "" : "wc-modal-footer--no-divider"}`}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
