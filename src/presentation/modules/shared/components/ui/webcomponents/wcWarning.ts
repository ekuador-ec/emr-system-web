import React from 'react';
import './wcButton';

const ATRIBUTOS = {
  TITLE: 'title',
  MESSAGE: 'message',
  CONFIRM_TEXT: 'confirm-text',
  CANCEL_TEXT: 'cancel-text',
  IS_OPEN: 'is-open',
  TYPE: 'type'
} as const;

type WarningType = 'warning' | 'error' | 'success' | 'info';

class wcWarning extends HTMLElement {
  private confirmCallback: (() => void) | null = null;
  private cancelCallback: (() => void) | null = null;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleConfirm: () => void;
  private boundHandleCancel: () => void;
  private boundHandleBackdropClick: (e: MouseEvent) => void;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Bind methods to preserve 'this' context
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleConfirm = this.handleConfirm.bind(this);
    this.boundHandleCancel = this.handleCancel.bind(this);
    this.boundHandleBackdropClick = this.handleBackdropClick.bind(this);
  }

  static get observedAttributes() {
    return [ATRIBUTOS.IS_OPEN, ATRIBUTOS.TYPE];
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.removeEvents();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === ATRIBUTOS.IS_OPEN || name === ATRIBUTOS.TYPE) {
      this.render();
    }
  }

  private setupEvents() {
    this.removeEvents(); // Ensure no duplicate listeners

    const confirmBtn = this.shadowRoot?.querySelector('wc-button[data-action="confirm"]') as HTMLElement;
    const cancelBtn = this.shadowRoot?.querySelector('wc-button[data-action="cancel"]') as HTMLElement;
    const backdrop = this.shadowRoot?.querySelector('.wc-warning-backdrop') as HTMLElement;

    confirmBtn?.addEventListener('click', this.boundHandleConfirm);
    cancelBtn?.addEventListener('click', this.boundHandleCancel);
    backdrop?.addEventListener('click', this.boundHandleBackdropClick);
    document.addEventListener('keydown', this.boundHandleKeyDown);
  }

  private removeEvents() {
    const confirmBtn = this.shadowRoot?.querySelector('wc-button[data-action="confirm"]') as HTMLElement;
    const cancelBtn = this.shadowRoot?.querySelector('wc-button[data-action="cancel"]') as HTMLElement;
    const backdrop = this.shadowRoot?.querySelector('.wc-warning-backdrop') as HTMLElement;

    confirmBtn?.removeEventListener('click', this.boundHandleConfirm);
    cancelBtn?.removeEventListener('click', this.boundHandleCancel);
    backdrop?.removeEventListener('click', this.boundHandleBackdropClick);
    document.removeEventListener('keydown', this.boundHandleKeyDown);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.getIsOpen()) return;
    
    if (e.key === 'Escape') {
      e.preventDefault();
      this.handleCancel();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleConfirm();
    }
  }

  private handleConfirm() {
    this.confirmCallback?.();
    this.close();
  }

  private handleCancel() {
    this.cancelCallback?.();
    this.close();
  }

  private handleBackdropClick(e: MouseEvent) {
    if (e.target === this.shadowRoot?.querySelector('.wc-warning-backdrop')) {
      this.handleCancel();
    }
  }

  public open(
    confirmCallback?: () => void,
    cancelCallback?: () => void
  ) {
    this.confirmCallback = confirmCallback || null;
    this.cancelCallback = cancelCallback || null;
    this.setAttribute(ATRIBUTOS.IS_OPEN, 'true');
    document.body.style.overflow = 'hidden';
  }

  public close() {
    this.removeAttribute(ATRIBUTOS.IS_OPEN);
    this.confirmCallback = null;
    this.cancelCallback = null;
    document.body.style.overflow = 'auto';
  }

  private getIsOpen(): boolean {
    return this.hasAttribute(ATRIBUTOS.IS_OPEN);
  }

  private getType(): WarningType {
    const type = this.getAttribute(ATRIBUTOS.TYPE) as WarningType;
    return ['warning', 'error', 'success', 'info'].includes(type) ? type : 'warning';
  }

  private getTitle(): string {
    return this.getAttribute(ATRIBUTOS.TITLE) || 'Confirmación';
  }

  private getMessage(): string {
    return this.getAttribute(ATRIBUTOS.MESSAGE) || '¿Estás seguro?';
  }

  private getConfirmText(): string {
    return this.getAttribute(ATRIBUTOS.CONFIRM_TEXT) || 'Confirmar';
  }

  private getCancelText(): string {
    return this.getAttribute(ATRIBUTOS.CANCEL_TEXT) || 'Cancelar';
  }

  private getIconInfo(): { name: string; color: string } {
    const type = this.getType();
    const iconMap = {
      warning: { name: 'icon-warning', color: 'var(--color-warning)' },
      error: { name: 'icon-alert-circle', color: 'var(--color-danger)' },
      success: { name: 'icon-check', color: 'var(--color-success)' },
      info: { name: 'icon-info-circle', color: 'var(--color-primary)' }
    };
    return iconMap[type];
  }

  private renderStyles(): string {
    return `
      <style>
        .wc-warning-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s ease;
          padding: clamp(var(--space-3), 5vw, var(--space-4));
        }

        :host([is-open]) .wc-warning-backdrop {
          opacity: 1;
          visibility: visible;
        }

        .wc-warning-dialog {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 18px;
          padding: 0;
          max-width: clamp(280px, 90vw, 440px);
          width: 100%;
          box-shadow: 
            0 25px 70px rgba(0, 0, 0, 0.16),
            0 5px 20px rgba(0, 0, 0, 0.08);
          transform: scale(0.92) translateY(15px);
          opacity: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        :host([is-open]) .wc-warning-dialog {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        
        .wc-warning-header {
          padding: 24px 24px 20px 24px;
          display: flex;
          gap: 0;
          align-items: flex-start;
        }

        .wc-warning-icon {
          flex-shrink: 0;
          color: ${this.getIconInfo().color};
          display: none;
          align-items: center;
          justify-content: center;
        }

        .wc-warning-icon svg {
          width: 36px;
          height: 36px;
          stroke-width: 1.6;
        }

        .wc-warning-heading {
          flex: 1;
          padding-top: 2px;
        }

        .wc-warning-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text);
          line-height: 1.35;
          letter-spacing: -0.3px;
        }

        .wc-warning-content {
          padding: 8px 24px 20px 24px;
          min-height: auto;
        }

        .wc-warning-message {
          margin: 0;
          font-size: 0.975rem;
          color: var(--color-text-secondary);
          line-height: 1.65;
          letter-spacing: 0.1px;
        }

        .wc-warning-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 16px 24px 20px 24px;
          border-top: 1px solid var(--color-border);
          background: var(--color-bg);
        }

        /* Desktop: 1024px and above */
        @media (min-width: 1024px) {
          .wc-warning-dialog {
            max-width: 440px;
          }
          .wc-warning-header {
            padding: 24px 24px 20px 24px;
          }
          .wc-warning-icon svg {
            width: 36px;
            height: 36px;
          }
          .wc-warning-title {
            font-size: 1.25rem;
          }
          .wc-warning-message {
            font-size: 0.975rem;
          }
        }

        /* Tablet: 768px to 1023px */
        @media (max-width: 1023px) and (min-width: 768px) {
          .wc-warning-dialog {
            max-width: 420px;
          }
          .wc-warning-header {
            padding: 22px 22px 18px 22px;
            gap: 15px;
          }
          .wc-warning-content {
            padding: 7px 22px 18px 22px;
          }
          .wc-warning-actions {
            padding: 15px 22px 18px 22px;
          }
          .wc-warning-icon svg {
            width: 34px;
            height: 34px;
          }
          .wc-warning-title {
            font-size: 1.175rem;
          }
          .wc-warning-message {
            font-size: 0.95rem;
          }
        }

        /* Mobile Landscape / Tablet Small: 640px to 767px */
        @media (max-width: 767px) and (min-width: 640px) {
          .wc-warning-dialog {
            border-radius: 16px;
            max-width: 95vw;
          }
          .wc-warning-header {
            padding: 20px 20px 16px 20px;
            gap: 14px;
          }
          .wc-warning-icon svg {
            width: 32px;
            height: 32px;
          }
          .wc-warning-content {
            padding: 6px 20px 18px 20px;
          }
          .wc-warning-actions {
            padding: 14px 20px 18px 20px;
            flex-direction: row;
            gap: 10px;
            justify-content: flex-end;
          }
          .wc-warning-title {
            font-size: 1.125rem;
          }
          .wc-warning-message {
            font-size: 0.925rem;
          }
        }

        /* Mobile: 480px to 639px */
        @media (max-width: 639px) and (min-width: 480px) {
          .wc-warning-dialog {
            border-radius: 15px;
            max-width: 96vw;
          }
          .wc-warning-header {
            padding: 18px 18px 14px 18px;
            gap: 12px;
          }
          .wc-warning-icon svg {
            width: 30px;
            height: 30px;
          }
          .wc-warning-content {
            padding: 5px 18px 16px 18px;
          }
          .wc-warning-actions {
            padding: 13px 18px 16px 18px;
            flex-direction: row;
            gap: 9px;
            justify-content: flex-end;
          }
          .wc-warning-title {
            font-size: 1.05rem;
          }
          .wc-warning-message {
            font-size: 0.9rem;
          }
        }

        /* Small Mobile: below 480px */
        @media (max-width: 479px) {
          .wc-warning-dialog {
            border-radius: 14px;
            max-width: 97vw;
          }
          .wc-warning-header {
            padding: 16px 16px 12px 16px;
            gap: 11px;
          }
          .wc-warning-icon svg {
            width: 28px;
            height: 28px;
          }
          .wc-warning-content {
            padding: 4px 16px 14px 16px;
          }
          .wc-warning-actions {
            padding: 12px 16px 14px 16px;
            flex-direction: row;
            gap: 8px;
            justify-content: flex-end;
          }
          .wc-warning-title {
            font-size: 0.975rem;
          }
          .wc-warning-message {
            font-size: 0.85rem;
          }
        }

        /* Tiny Mobile: below 360px */
        @media (max-width: 359px) {
          .wc-warning-backdrop {
            padding: var(--space-2);
          }
          .wc-warning-dialog {
            border-radius: 12px;
            max-width: 98vw;
          }
          .wc-warning-header {
            padding: 14px 14px 10px 14px;
            gap: 10px;
          }
          .wc-warning-icon svg {
            width: 24px;
            height: 24px;
          }
          .wc-warning-content {
            padding: 3px 14px 12px 14px;
          }
          .wc-warning-actions {
            padding: 10px 14px 12px 14px;
            flex-direction: row;
            gap: 7px;
            justify-content: flex-end;
          }
          .wc-warning-title {
            font-size: 0.9rem;
          }
          .wc-warning-message {
            font-size: 0.8rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wc-warning-backdrop,
          .wc-warning-dialog {
            animation: none !important;
            transition: none !important;
          }
        }

        /* Landscape orientation adjustments */
        @media (orientation: landscape) and (max-height: 600px) {
          .wc-warning-dialog {
            max-height: 95vh;
          }
          .wc-warning-header {
            padding-bottom: 12px;
          }
          .wc-warning-content {
            padding-bottom: 12px;
          }
          .wc-warning-actions {
            padding: 10px 20px;
          }
        }
      </style>
    `;
  }

  private renderDialog(): string {
    const title = this.getTitle();
    const message = this.getMessage();
    const confirmText = this.getConfirmText();
    const cancelText = this.getCancelText();

    return `
      <div class="wc-warning-backdrop">
        <div class="wc-warning-dialog" role="alertdialog" aria-modal="true" aria-labelledby="warning-title" aria-describedby="warning-message">
          <div class="wc-warning-header">
            <div class="wc-warning-heading">
              <h2 class="wc-warning-title" id="warning-title">${this.escapeHtml(title)}</h2>
            </div>
          </div>
          <div class="wc-warning-content">
            <p class="wc-warning-message" id="warning-message">${this.escapeHtml(message)}</p>
          </div>
          <div class="wc-warning-actions">
            <wc-button variant="terciary" data-action="cancel" title="${this.escapeHtml(cancelText)}">${this.escapeHtml(cancelText)}</wc-button>
            <wc-button variant="danger" data-action="confirm" title="${this.escapeHtml(confirmText)}">${this.escapeHtml(confirmText)}</wc-button>
          </div>
        </div>
      </div>
    `;
  }
  
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  render() {
    this.shadowRoot!.innerHTML = this.renderStyles() + this.renderDialog();
    setTimeout(() => this.setupEvents(), 0);
  }
}

customElements.define('wc-warning', wcWarning);

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wc-warning': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          title?: string;
          message?: string;
          'confirm-text'?: string;
          'cancel-text'?: string;
          'is-open'?: boolean | string;
          type?: 'warning' | 'error' | 'success' | 'info';
        },
        HTMLElement
      >;
    }
  }
}

