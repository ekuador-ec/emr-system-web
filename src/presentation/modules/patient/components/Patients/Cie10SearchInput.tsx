import { useState, useRef, useEffect } from "react";
import { useSearchCie10Pathologies } from "@/presentation/modules/catalog/hooks/useCatalogs";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

interface Cie10SearchInputProps {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  onDescriptionSelect?: (description: string) => void;
  initialLabel?: string;
  error?: string;
}

export function Cie10SearchInput({ value, onChange, onDescriptionSelect, initialLabel, error }: Cie10SearchInputProps) {
  const [query, setQuery] = useState(initialLabel || "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: results, isLoading } = useSearchCie10Pathologies(debouncedQuery);

  useEffect(() => {
    if (initialLabel && !query && query !== initialLabel) {
      setQuery(initialLabel);
    }
  }, [initialLabel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSelect = (id: string, description: string) => {
    onChange(id);
    setQuery(description);
    setDebouncedQuery(""); // Clear debounced query so it doesn't search again when selecting
    setIsOpen(false);
    if (onDescriptionSelect) {
      onDescriptionSelect(description);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className={`input-field ${error ? "error" : ""} ${value ? "has-value" : ""}`}
          placeholder="Buscar patología CIE-10..."
          value={query}
          onChange={(e) => {
            const newValue = e.target.value;
            setQuery(newValue);
            setIsOpen(true);
            
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              setDebouncedQuery(newValue);
            }, 300);

            if (!newValue) {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
        />
        {isLoading && (
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              color: "var(--color-text-secondary)",
            }}
          >
            <Icon name="icon-loader" size={16} className="spin" />
          </div>
        )}
      </div>

      {isOpen && results && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "var(--color-surface, #ffffff)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 50,
            maxHeight: "200px",
            overflowY: "auto",
            opacity: 1,
          }}
        >
          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id, item.description)}
              style={{
                padding: "var(--space-2) var(--space-3)",
                cursor: "pointer",
                borderBottom: "1px solid var(--color-border)",
                fontSize: "var(--font-size-sm)",
                backgroundColor: "transparent",
                color: "var(--color-text-primary)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLDivElement).style.backgroundColor = "var(--color-bg)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLDivElement).style.backgroundColor = "transparent";
              }}
            >
              <strong style={{ marginRight: "var(--space-2)" }}>{item.code}</strong>
              {item.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
