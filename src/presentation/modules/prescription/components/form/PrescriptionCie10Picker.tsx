import { useEffect, useRef, useState } from "react";
import { useSearchCie10Pathologies } from "@/presentation/modules/catalog/hooks/useCatalogs";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import type { PrescriptionDiagnosisFormValue } from "@/presentation/modules/prescription/schemas/prescription.schema";

interface PrescriptionCie10PickerProps {
  value: PrescriptionDiagnosisFormValue[];
  onChange: (next: PrescriptionDiagnosisFormValue[]) => void;
  disabled?: boolean;
}

export function PrescriptionCie10Picker({ value, onChange, disabled }: PrescriptionCie10PickerProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: results, isLoading } = useSearchCie10Pathologies(debouncedQuery);

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

  const handleSelect = (id: string, code: string, description: string) => {
    if (!value.some((item) => item.cie10Code === code)) {
      onChange([...value, { cie10Id: id, cie10Code: code, cie10Description: description }]);
    }
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  const handleRemove = (code: string) => {
    onChange(value.filter((item) => item.cie10Code !== code));
  };

  return (
    <div className="prescription-cie10">
      {value.length > 0 ? (
        <ul className="prescription-cie10__chips">
          {value.map((item) => (
            <li key={item.cie10Code} className="prescription-cie10__chip">
              <span className="prescription-cie10__chip-code">{item.cie10Code}</span>
              <span className="prescription-cie10__chip-desc">{item.cie10Description}</span>
              {!disabled ? (
                <WcButtonIcon
                  icon="icon-x"
                  variant="ghost"
                  shape="circle"
                  size="sm"
                  onClick={() => handleRemove(item.cie10Code)}
                  title="Quitar diagnóstico"
                  aria-label="Quitar diagnóstico"
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {!disabled ? (
        <div ref={containerRef} className="prescription-cie10__search">
          <input
            type="text"
            className="input-field"
            placeholder="Buscar patología CIE-10 para agregar..."
            value={query}
            onChange={(e) => {
              const newValue = e.target.value;
              setQuery(newValue);
              setIsOpen(true);
              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = setTimeout(() => setDebouncedQuery(newValue), 300);
            }}
            onFocus={() => {
              if (query.length >= 2) setIsOpen(true);
            }}
          />
          {isLoading ? (
            <span className="prescription-cie10__spinner">
              <Icon name="icon-refresh" size={16} className="spin" />
            </span>
          ) : null}

          {isOpen && results && results.length > 0 ? (
            <div className="prescription-cie10__results">
              {results.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="prescription-cie10__result"
                  onClick={() => handleSelect(item.id, item.code, item.description)}
                >
                  <strong>{item.code}</strong> {item.description}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
