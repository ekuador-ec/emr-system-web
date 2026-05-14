import { useState, useRef, useEffect } from "react";
import { useSearchGeographicLocations } from "@/presentation/modules/catalog/hooks/useCatalogs";

interface GeographicLocationSearchInputProps {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  // Opcional para poder setear un label inicial si estamos en modo edición
  initialLabel?: string;
  error?: string;
}

export function GeographicLocationSearchInput({
  value: _value,
  onChange,
  initialLabel,
  error,
}: GeographicLocationSearchInputProps) {
  const [query, setQuery] = useState(initialLabel || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useSearchGeographicLocations(query);

  useEffect(() => {
    // Sincronizar tab initialLabel si cambia (ej en edición)
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string, label: string) => {
    onChange(id);
    setQuery(label);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className={`input-field ${error ? "error" : ""}`}
          placeholder="Buscar provincia, cantón o parroquia..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (query.length >= 3) setIsOpen(true);
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
            <span className="spin" style={{ display: "inline-block" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
              </svg>
            </span>
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
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 50,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {results.map((item) => {
            const label = `${item.province}, ${item.canton}, ${item.parish} (DPA: ${item.dpaCode})`;
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id, label)}
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text)",
                  backgroundColor: "transparent",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLDivElement).style.backgroundColor = "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLDivElement).style.backgroundColor = "transparent";
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
