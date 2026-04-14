import { useState } from "react";
import type { ReactNode } from "react";
import "@/presentation/modules/shared/components/ui/webcomponents/Tabs/wcTabsFolder.css";

export interface WcTabsFolderItem {
  name: string;
  icon: ReactNode;
  content: ReactNode;
}

interface WcTabsFolderProps {
  tabs: WcTabsFolderItem[];
  headerExtra?: ReactNode;
}

export function WcTabsFolder({ tabs, headerExtra }: WcTabsFolderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isStaticTabs = tabs.length <= 1;

  if (tabs.length === 0) {
    return null;
  }

  const safeActiveIndex = activeIndex >= tabs.length ? 0 : activeIndex;
  const activeTab = tabs[safeActiveIndex];

  return (
    <section className="wc-tabs-folder">
      <div className="wc-tabs-folder__header-row">
        <div className="wc-tabs-folder__header" role="tablist" aria-label="Pestanas">
          {tabs.map((tab, index) => {
            const isActive = index === safeActiveIndex;
            const isStatic = isStaticTabs;

            return (
              <button
                key={`${tab.name}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-disabled={isStatic}
                disabled={isStatic}
                className={`wc-tabs-folder__tab${isActive ? " wc-tabs-folder__tab--active" : ""}`}
                tabIndex={isStatic ? -1 : 0}
                onClick={isStatic ? undefined : () => setActiveIndex(index)}
              >
                {tab.icon}
                {tab.name}
              </button>
            );
          })}
        </div>
        {headerExtra ? (
          <div className="wc-tabs-folder__header-extra">
            {headerExtra}
          </div>
        ) : null}
      </div>

      <div className="wc-tabs-folder__body" role="tabpanel">
        {activeTab.content}
      </div>
    </section>
  );
}
