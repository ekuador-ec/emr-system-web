import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "./EvolutionTabsNav.css";

export interface EvolutionNavTab {
  label: string;
  icon: string;
  hasError?: boolean;
}

interface EvolutionTabsNavProps {
  tabs: EvolutionNavTab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const MOBILE_QUERY = "(max-width: 480px)";
const MOBILE_VISIBLE_COUNT = 3;

export function EvolutionTabsNav({ tabs, activeIndex, onChange }: EvolutionTabsNavProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    function handlePointer(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target || !moreRef.current) return;
      if (!moreRef.current.contains(target)) setMoreOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [moreOpen]);

  const { visibleIndexes, overflowIndexes } = useMemo(() => {
    if (!isMobile) {
      return { visibleIndexes: tabs.map((_, i) => i), overflowIndexes: [] as number[] };
    }
    const headIndexes = tabs.slice(0, MOBILE_VISIBLE_COUNT).map((_, i) => i);
    const includeActive = headIndexes.includes(activeIndex)
      ? headIndexes
      : [activeIndex, ...headIndexes.slice(0, MOBILE_VISIBLE_COUNT - 1)];
    const visible = Array.from(new Set(includeActive)).sort((a, b) => a - b);
    const visibleSet = new Set(visible);
    const overflow = tabs
      .map((_, i) => i)
      .filter((i) => !visibleSet.has(i));
    return { visibleIndexes: visible, overflowIndexes: overflow };
  }, [tabs, activeIndex, isMobile]);

  const handleSelect = useCallback(
    (index: number) => {
      onChange(index);
      setMoreOpen(false);
    },
    [onChange],
  );

  const overflowHasError = overflowIndexes.some((i) => tabs[i]?.hasError);
  const overflowHasActive = overflowIndexes.includes(activeIndex);

  return (
    <nav className="evol-tabs-nav" role="tablist" aria-orientation={isMobile ? "horizontal" : "vertical"}>
      {visibleIndexes.map((index) => {
        const tab = tabs[index];
        if (!tab) return null;
        const isActive = index === activeIndex;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-active={isActive ? "true" : undefined}
            data-error={tab.hasError ? "true" : undefined}
            className="evol-tabs-nav__item"
            onClick={() => handleSelect(index)}
          >
            <span className="evol-tabs-nav__icon" aria-hidden="true">
              <Icon name={tab.icon} size={16} />
            </span>
            <span className="evol-tabs-nav__label">{tab.label}</span>
            {tab.hasError ? (
              <span className="evol-tabs-nav__dot" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}

      {overflowIndexes.length > 0 ? (
        <div className="evol-tabs-nav__more" ref={moreRef}>
          <button
            type="button"
            className="evol-tabs-nav__more-trigger"
            onClick={() => setMoreOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            data-has-error={overflowHasError ? "true" : undefined}
            data-active={overflowHasActive ? "true" : undefined}
          >
            <span>{overflowHasActive ? tabs[activeIndex]?.label : "Más"}</span>
            <span className="evol-tabs-nav__more-trigger-chevron" aria-hidden="true">
              <Icon name="icon-chevron-down" size={14} />
            </span>
          </button>
          {moreOpen ? (
            <div role="menu" className="evol-tabs-nav__more-menu">
              {overflowIndexes.map((index) => {
                const tab = tabs[index];
                if (!tab) return null;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    role="menuitem"
                    data-active={isActive ? "true" : undefined}
                    data-error={tab.hasError ? "true" : undefined}
                    className="evol-tabs-nav__menu-item"
                    onClick={() => handleSelect(index)}
                  >
                    <span className="evol-tabs-nav__icon" aria-hidden="true">
                      <Icon name={tab.icon} size={16} />
                    </span>
                    <span>{tab.label}</span>
                    {tab.hasError ? (
                      <span className="evol-tabs-nav__dot" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
