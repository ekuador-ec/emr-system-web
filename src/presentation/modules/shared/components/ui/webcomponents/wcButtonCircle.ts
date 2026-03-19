import React from 'react';

const ATRIBUTOS = {
  VARIANT: 'variant',
  DISABLED: 'disabled',
  ICON: 'icon',
  TITLE: 'title'
} as const;

class wcButtonCircle extends HTMLElement {
  private isHovering = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [ATRIBUTOS.VARIANT, ATRIBUTOS.DISABLED, ATRIBUTOS.ICON, ATRIBUTOS.TITLE];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (!name) return;
    if (oldValue === newValue) return;
    this.render();
  }

  private setupEventListeners() {
    const button = this.shadowRoot?.querySelector('button');
    if (button) {
      button.addEventListener('mouseenter', () => this.handleMouseEnter());
      button.addEventListener('mouseleave', () => this.handleMouseLeave());
    }
  }

  private removeEventListeners() {
    const button = this.shadowRoot?.querySelector('button');
    if (button) {
      button.removeEventListener('mouseenter', () => this.handleMouseEnter());
      button.removeEventListener('mouseleave', () => this.handleMouseLeave());
    }
  }

  private handleMouseEnter() {
    this.isHovering = true;
    this.updateButtonStyle();
  }

  private handleMouseLeave() {
    this.isHovering = false;
    this.updateButtonStyle();
  }

  private updateButtonStyle() {
    const button = this.shadowRoot?.querySelector('button');
    if (!button) return;

    const variant = this.getAttribute(ATRIBUTOS.VARIANT) || 'primary';
    
    if (variant === 'primary') {
      if (this.isHovering) {
        button.style.backgroundColor = 'var(--color-primary-hover)';
        button.style.color = 'white';
      } else {
        button.style.backgroundColor = 'var(--color-primary)';
        button.style.color = 'var(--color-primary-foreground)';
      }
    } else if (variant === 'danger') {
      if (this.isHovering) {
        button.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
        button.style.color = 'white';
      } else {
        button.style.backgroundColor = 'var(--color-danger)';
        button.style.color = 'white';
      }
    }
  }

  render() {
    const variant = this.getAttribute(ATRIBUTOS.VARIANT) || 'primary';
    const isDisabled = this.hasAttribute(ATRIBUTOS.DISABLED);
    const icon = this.getAttribute(ATRIBUTOS.ICON) || 'icon-camera';
    const title = this.getAttribute(ATRIBUTOS.TITLE) || '';

    const backgroundColorPrimary = 'var(--color-primary)';
    const backgroundColorDanger = 'var(--color-danger)';
    const textColorPrimary = 'var(--color-primary-foreground)';
    const textColorDanger = 'white';

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
          transition: all 0.2s ease;
          opacity: ${isDisabled ? 0.7 : 1};
          background-color: ${variant === 'primary' ? backgroundColorPrimary : backgroundColorDanger};
          color: ${variant === 'primary' ? textColorPrimary : textColorDanger};
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        svg {
          width: 16px;
          height: 16px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      </style>
      
      <button ${isDisabled ? 'disabled' : ''} title="${title}">
        <svg aria-hidden="true">
          <use href="/icons/system-icons.svg#${icon}" />
        </svg>
      </button>
    `;

    // Configurar event listeners después de renderizar
    setTimeout(() => this.setupEventListeners(), 0);
  }
}

customElements.define('wc-button-circle', wcButtonCircle);

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wc-button-circle': React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'danger';
          icon?: string;
          title?: string;
        },
        HTMLElement
      >;
    }
  }
}
