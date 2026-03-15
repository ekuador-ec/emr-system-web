import React from 'react';

const ATRIBUTOS = {
  VARIANT: 'variant',
  DISABLED: 'disabled'
} as const;

class WcButton extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [ATRIBUTOS.VARIANT, ATRIBUTOS.DISABLED];
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    // Cleanup if needed
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (!name) return;
    if (oldValue === newValue) return;
    this.render();
  }

  private getVariant(): string {
    return this.getAttribute(ATRIBUTOS.VARIANT) || 'primary';
  }

  private isDisabled(): boolean {
    return this.hasAttribute(ATRIBUTOS.DISABLED);
  }

  private renderStyles(): string {
    return `
      <style>
        /* :host representa al objeto Web Component en sí mismo desde fuera */
        :host {
          display: inline-block;
        }
        :host([variant="tab"]) {
          margin-bottom: -1px; /* Permite que el borde inferior se superponga al del contenedor */
        }
        /* Estilos base que comparten todos los botones de nuestro sistema */
        button {
          padding: 8px 16px;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          border: none;
        }
        /* Variante primaria */
        button.primary { background-color: var(--color-primary); color: var(--color-surface); }
        button.primary:hover { background-color: var(--color-primary-hover); color: white; }
        
        /* Variante secundaria */
        button.secondary { background-color: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }
        button.secondary:hover { background-color: var(--color-danger); color: white; }

        /* Variante terciaria */
        button.terciary { background-color: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }
        button.terciary:hover { background-color: var(--color-primary-hover); color: white; }

        /* Variante de peligro */
        button.danger { background-color: var(--color-danger); color: white; }
        button.danger:hover { opacity: 0.9; }

        /* Variante tab */
        button.tab {
          background-color: transparent;
          color: inherit;
          border-radius: 6px 6px 0 0;
          border-bottom: 2px solid transparent;
          padding: 8px 16px;
          width: 100%;
          height: 100%;
        }
        button.tab:hover {
          color: inherit;
          background-color: transparent;
          border-bottom-color: transparent;
        }

        :host([slot="tab"][aria-selected="false"]) button.tab {
          color: var(--color-text-secondary);
        }

        :host([slot="tab"][aria-selected="true"]) button.tab {
          color: inherit;
          border-bottom-color: transparent;
          background-color: transparent;
        }

        /* Comportamiento visual de estado bloqueado */
        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
      </style>
    `;
  }

  private renderButton(): string {
    const variant = this.getVariant();
    const isDisabled = this.isDisabled();
    
    return `
      <button class="${variant}" ${isDisabled ? 'disabled' : ''}>
        <slot></slot>
      </button>
    `;
  }

  render() {
    this.shadowRoot!.innerHTML = this.renderStyles() + this.renderButton();
  }
}

customElements.define('wc-button', WcButton);

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wc-button': React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary' | 'danger' | 'terciary' | 'outline' | 'tab';
        },
        HTMLElement
      >;
    }
  }
}