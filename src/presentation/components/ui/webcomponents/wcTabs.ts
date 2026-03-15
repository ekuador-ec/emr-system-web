import React from 'react';

const ATRIBUTOS = {
  SELECTED_INDEX: 'selected-index'
} as const;

class wcTabs extends HTMLElement {
  private tabSlot?: HTMLSlotElement | null;
  private panelSlot?: HTMLSlotElement | null;

  private readonly onHostClick = (e: Event) => {
    const target = (e.target as HTMLElement | null)?.closest('[slot="tab"]');
    if (!target) return;

    const tabs = this.getTabs();
    const index = tabs.indexOf(target as HTMLElement);
    if (index > -1) {
      this.setSelectedIndex(index, false);
    }
  };

  private readonly onHostKeyDown = (e: KeyboardEvent) => {
    const target = (e.target as HTMLElement | null)?.closest('[slot="tab"]');
    if (!target) return;

    const tabs = this.getTabs();
    if (tabs.length === 0) return;

    const currentIndex = tabs.indexOf(target as HTMLElement);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        this.setSelectedIndex(currentIndex, true);
        e.preventDefault();
        return;
      default:
        return;
    }

    e.preventDefault();
    this.setSelectedIndex(nextIndex, true);
  };

  private readonly onSlotChange = () => {
    this.updateTabs();
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return [ATRIBUTOS.SELECTED_INDEX];
  }

  connectedCallback() {
    this.render();
    this.setupEvents();

    if (!this.hasAttribute(ATRIBUTOS.SELECTED_INDEX)) {
      this.setAttribute(ATRIBUTOS.SELECTED_INDEX, '0');
    }

    this.updateTabs();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onHostClick);
    this.removeEventListener('keydown', this.onHostKeyDown);
    this.tabSlot?.removeEventListener('slotchange', this.onSlotChange);
    this.panelSlot?.removeEventListener('slotchange', this.onSlotChange);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === ATRIBUTOS.SELECTED_INDEX) {
      this.updateTabs();
      this.dispatchEvent(
        new CustomEvent('tab-change', {
          detail: {
            selectedIndex: this.getSelectedIndex(),
          },
          bubbles: true,
        })
      );
    }
  }

  private setupEvents() {
    this.addEventListener('click', this.onHostClick);
    this.addEventListener('keydown', this.onHostKeyDown);

    this.tabSlot = this.shadowRoot?.querySelector('slot[name="tab"]');
    this.panelSlot = this.shadowRoot?.querySelector('slot[name="panel"]');
    this.tabSlot?.addEventListener('slotchange', this.onSlotChange);
    this.panelSlot?.addEventListener('slotchange', this.onSlotChange);
  }

  private getTabs() {
    return Array.from(this.querySelectorAll<HTMLElement>('[slot="tab"]'));
  }

  private getPanels() {
    return Array.from(this.querySelectorAll<HTMLElement>('[slot="panel"]'));
  }

  private getSelectedIndex() {
    const totalTabs = this.getTabs().length;
    if (totalTabs === 0) return 0;

    const rawIndex = parseInt(this.getAttribute(ATRIBUTOS.SELECTED_INDEX) || '0', 10);
    if (Number.isNaN(rawIndex)) return 0;
    return Math.min(Math.max(rawIndex, 0), totalTabs - 1);
  }

  private setSelectedIndex(index: number, focusTab: boolean) {
    const tabs = this.getTabs();
    if (tabs.length === 0) return;

    const safeIndex = Math.min(Math.max(index, 0), tabs.length - 1);
    const current = this.getSelectedIndex();

    if (safeIndex !== current) {
      this.setAttribute(ATRIBUTOS.SELECTED_INDEX, safeIndex.toString());
    } else {
      this.updateTabs();
    }

    if (focusTab) {
      tabs[safeIndex]?.focus();
    }
  }

  private updateTabs() {
    const tabs = this.getTabs();
    const panels = this.getPanels();
    if (tabs.length === 0) return;

    const index = this.getSelectedIndex();
    const hostId = this.id || 'wc-tabs';

    if ((this.getAttribute(ATRIBUTOS.SELECTED_INDEX) || '0') !== index.toString()) {
      this.setAttribute(ATRIBUTOS.SELECTED_INDEX, index.toString());
      return;
    }

    tabs.forEach((tab, i) => {
      const panel = panels[i];
      const tabId = tab.id || `${hostId}-tab-${i}`;
      const panelId = panel?.id || `${hostId}-panel-${i}`;

      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', (i === index).toString());
      tab.setAttribute('tabindex', i === index ? '0' : '-1');
      if (panel) {
        tab.setAttribute('aria-controls', panelId);
      } else {
        tab.removeAttribute('aria-controls');
      }
    });

    panels.forEach((panel, i) => {
      const tabId = tabs[i]?.id || `${hostId}-tab-${i}`;
      const panelId = panel.id || `${hostId}-panel-${i}`;
      const isActive = i === index;

      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);

      if (i === index) {
        panel.classList.add('active');
        panel.removeAttribute('hidden');
      } else {
        panel.classList.remove('active');
        panel.setAttribute('hidden', 'true');
      }

      if (isActive) {
        panel.classList.add('is-visible');
      } else {
        panel.classList.remove('is-visible');
      }
    });

    this.setAttribute('data-ready', 'true');
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .tabs-header {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-1);
          border-radius: 6px;
          background-color: var(--color-primary-light);
          border-bottom: 1px solid var(--color-border);
          margin-bottom: var(--space-6);
          overflow-x: auto;
          scrollbar-width: thin;
        }

        ::slotted([slot="tab"]) {
          flex: 1;
          min-width: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border: 1px solid transparent;
          border-radius: 6px;
          background-color: transparent;
          color: var(--color-text-secondary);
          font-family: inherit;
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: 600;
          cursor: pointer;
          transition:
            background-color var(--transition-fast, 150ms ease),
            color var(--transition-fast, 150ms ease),
            border-color var(--transition-fast, 150ms ease),
            transform var(--transition-fast, 150ms ease),
            box-shadow var(--transition-fast, 150ms ease);
        }

        ::slotted([slot="tab"][aria-selected="true"]) {
          color: var(--color-primary-foreground);
          background-color: var(--color-primary);
          border-color: var(--color-primary);
          box-shadow: var(--shadow-sm);
        }

        ::slotted([slot="tab"][aria-selected="false"]:hover) {
          color: var(--color-text);
          background-color: var(--color-surface);
          border-color: var(--color-border);
        }

        ::slotted([slot="tab"]:focus-visible) {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        ::slotted([slot="tab"]:active) {
          transform: translateY(1px);
        }

        .panels-container {
          display: block;
        }

        ::slotted([slot="panel"]) {
          animation: tab-fade-in 220ms ease;
        }

        ::slotted([slot="panel"]:not(.active)) {
          display: none;
        }

        @keyframes tab-fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          ::slotted([slot="tab"]) {
            transition: none;
          }

          ::slotted([slot="panel"]) {
            animation: none;
          }
        }

        @media (max-width: 720px) {
          .tabs-header {
            gap: var(--space-1);
            margin-bottom: var(--space-4);
          }

          ::slotted([slot="tab"]) {
            min-width: 96px;
            padding: var(--space-2) var(--space-3);
            font-size: var(--font-size-xs, 0.75rem);
          }
        }

        @media (max-width: 640px) {
          .tabs-header {
            gap: var(--space-1);
            padding: 6px;
            margin-bottom: var(--space-3);
            border-radius: 4px;
          }

          ::slotted([slot="tab"]) {
            min-width: 80px;
            padding: var(--space-2) var(--space-2);
            font-size: 0.75rem;
            font-weight: 600;
          }

          ::slotted([slot="tab"][aria-selected="true"]) {
            box-shadow: none;
          }
        }

        @media (max-width: 480px) {
          .tabs-header {
            gap: 4px;
            padding: 4px;
            margin-bottom: var(--space-2);
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          ::slotted([slot="tab"]) {
            min-width: 70px;
            padding: 6px 8px;
            font-size: 0.7rem;
            flex-shrink: 0;
          }

          ::slotted([slot="tab"]:focus-visible) {
            outline-width: 1px;
            outline-offset: 1px;
          }
        }

        @media (max-width: 360px) {
          .tabs-header {
            gap: 2px;
            padding: 2px;
          }

          ::slotted([slot="tab"]) {
            min-width: 60px;
            padding: 4px 6px;
            font-size: 0.65rem;
          }
        }
      </style>

      <div class="tabs-header" role="tablist" aria-label="Navegacion de pestanas">
        <slot name="tab"></slot>
      </div>
      <div class="panels-container">
        <slot name="panel"></slot>
      </div>
    `;
  }
}

customElements.define('wc-tabs', wcTabs);

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wc-tabs': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'selected-index'?: string | number;
        },
        HTMLElement
      >;
    }
  }
}