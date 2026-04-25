import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder.css";

export interface WcTabsFolderItem {
  name: string;
  icon?: ReactNode;
  content: ReactNode;
  hasError?: boolean;
}

interface WcTabsFolderProps {
  tabs: WcTabsFolderItem[];
  headerExtra?: ReactNode;
  activeIndex?: number;
  onChange?: (index: number) => void;
  mobileVisibleCount?: number;
}

export function WcTabsFolder({
  tabs,
  headerExtra,
  activeIndex: propsActiveIndex,
  onChange,
}: WcTabsFolderProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex =
    propsActiveIndex !== undefined ? propsActiveIndex : internalActiveIndex;

  const handleTabClick = (index: number) => {
    if (propsActiveIndex === undefined) {
      setInternalActiveIndex(index);
    }
    onChange?.(index);
  };

  if (tabs.length === 0) {
    return null;
  }

  const isStaticTabs = tabs.length <= 1;
  const safeActiveIndex = activeIndex >= tabs.length ? 0 : activeIndex;
  const activeTab = tabs[safeActiveIndex];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const button = tabRefs.current[safeActiveIndex];
    if (button) {
      button.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [safeActiveIndex]);

  return (
    <section className="wc-tabs-folder">
      <div className="wc-tabs-folder__header-row">
        <div
          className="wc-tabs-folder__header"
          role="tablist"
          aria-label="Pestanas"
        >
          {tabs.map((tab, index) => {
            const isActive = index === safeActiveIndex;

            return (
              <button
                key={`tab-${tab.name}-${index}`}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-disabled={isStaticTabs}
                disabled={isStaticTabs}
                className={[
                  "wc-tabs-folder__tab",
                  isActive ? "wc-tabs-folder__tab--active" : "",
                  tab.hasError ? "wc-tabs-folder__tab--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                tabIndex={isStaticTabs ? -1 : 0}
                onClick={isStaticTabs ? undefined : () => handleTabClick(index)}
              >
                {tab.icon}
                <span className="wc-tabs-folder__tab-label">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {headerExtra ? (
          <div className="wc-tabs-folder__header-extra">{headerExtra}</div>
        ) : null}
      </div>

      <div className="wc-tabs-folder__body" role="tabpanel">
        {activeTab.content}
      </div>
    </section>
  );
}
