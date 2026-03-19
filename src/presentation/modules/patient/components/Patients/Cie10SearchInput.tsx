import { useState, useRef, useEffect } from "react";
import { useSearchCie10Pathologies } from "@/presentation/modules/catalog/hooks/useCatalogs";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";

interface Cie10SearchInputProps {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  onDescriptionSelect?: (description: string) => void;
}

export function Cie10SearchInput({ value, onChange, onDescriptionSelect }: Cie10SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useSearchCie10Pathologies(query);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string, description: string) => {
    onChange(id);
    setQuery(description);
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
          className={`input-field ${value ? 'has-value' : ''}`}
          placeholder="Buscar patología CIE-10..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
        />
        {isLoading && (
          <div style={{ position: "absolute", right: "10px", top: "10px", color: "var(--color-text-secondary)" }}>
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
            backgroundColor: "var(--color-bg-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 10,
            maxHeight: "200px",
            overflowY: "auto",
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
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLDivElement).style.backgroundColor = "var(--color-bg-secondary)";
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
