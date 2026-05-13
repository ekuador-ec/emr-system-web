import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "./WcSelect.css";

export interface WcSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface WcSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: WcSelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function WcSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  error,
  disabled,
  id,
  name,
  searchable = false,
  clearable = false,
  className,
  ariaLabel,
}: WcSelectProps) {
  const reactId = useId();
  const triggerId = id ?? `wc-select-${reactId}`;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [query, setQuery] = useState("");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const filteredOptions = useMemo(() => {
    if (!searchable || query.trim() === "") return options;
    const needle = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query, searchable]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const closeMenu = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    const selectedIdx = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
  }, [disabled, options, value]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current && !rootRef.current.contains(target)) {
        closeMenu();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    if (searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const list = listboxRef.current;
    if (!list) return;
    const activeEl = list.querySelector<HTMLDivElement>(
      `[data-option-index="${activeIndex}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex, filteredOptions]);

  const moveActive = useCallback(
    (delta: number) => {
      if (filteredOptions.length === 0) return;
      setActiveIndex((current) => {
        const start = current < 0 ? 0 : current;
        let next = start;
        for (let i = 0; i < filteredOptions.length; i += 1) {
          next = (next + delta + filteredOptions.length) % filteredOptions.length;
          if (!filteredOptions[next].disabled) return next;
        }
        return current;
      });
    },
    [filteredOptions],
  );

  const commitOption = useCallback(
    (option: WcSelectOption) => {
      if (option.disabled) return;
      onChange(option.value);
      closeMenu();
      triggerRef.current?.focus();
    },
    [closeMenu, onChange],
  );

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (
      !open &&
      (event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Enter" ||
        event.key === " ")
    ) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(filteredOptions.findIndex((option) => !option.disabled));
        break;
      case "End":
        event.preventDefault();
        for (let i = filteredOptions.length - 1; i >= 0; i -= 1) {
          if (!filteredOptions[i].disabled) {
            setActiveIndex(i);
            break;
          }
        }
        break;
      case "Enter":
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          commitOption(filteredOptions[activeIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
      case "Tab":
        closeMenu();
        break;
      default:
        break;
    }
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange("");
  };

  const rootClasses = ["wc-select"];
  if (className) rootClasses.push(className);

  const activeDescendantId =
    open && activeIndex >= 0 && activeIndex < filteredOptions.length
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  return (
    <div className={rootClasses.join(" ")} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        id={triggerId}
        name={name}
        className="wc-select__trigger"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={activeDescendantId}
        aria-label={ariaLabel}
        data-error={error ? "true" : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className="wc-select__value"
          data-placeholder={selectedOption ? undefined : "true"}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="wc-select__actions">
          {clearable && selectedOption ? (
            <button
              type="button"
              className="wc-select__clear"
              onClick={handleClear}
              aria-label="Limpiar selección"
              tabIndex={-1}
            >
              ×
            </button>
          ) : null}
          <span className="wc-select__chevron" data-open={open ? "true" : undefined}>
            <Icon name="icon-chevron-down" size={16} />
          </span>
        </span>
      </button>

      {open ? (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          className="wc-select__listbox"
          tabIndex={-1}
        >
          {searchable ? (
            <div className="wc-select__search">
              <input
                ref={searchRef}
                type="text"
                value={query}
                placeholder="Buscar..."
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowUp" ||
                    event.key === "Enter" ||
                    event.key === "Escape" ||
                    event.key === "Tab"
                  ) {
                    handleTriggerKeyDown(
                      event as unknown as KeyboardEvent<HTMLButtonElement>,
                    );
                  }
                }}
              />
            </div>
          ) : null}

          {filteredOptions.length === 0 ? (
            <div className="wc-select__empty">Sin resultados</div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <div
                  key={option.value}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  className="wc-select__option"
                  data-option-index={index}
                  data-active={isActive ? "true" : undefined}
                  data-selected={isSelected ? "true" : undefined}
                  data-disabled={option.disabled ? "true" : undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commitOption(option)}
                >
                  <span className="wc-select__option-content">
                    <span className="wc-select__option-label">{option.label}</span>
                    {option.description ? (
                      <span className="wc-select__option-description">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <span className="wc-select__option-check" aria-hidden="true">
                      <Icon name="icon-check" size={16} />
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
