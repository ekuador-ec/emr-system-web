import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import { usePatientStore } from "@/presentation/modules/patient/stores/usePatientStore";
import "./PatientQuickSearchModal.css";

interface PatientQuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientQuickSearchModal({ isOpen, onClose }: PatientQuickSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setPatientFilters, setHasSearched } = usePatientStore();

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      // Pequeño delay para asegurar que la animación de entrada no interfiera con el foco
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manejador para cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setPatientFilters({ search: searchTerm.trim(), page: 1 });
      setHasSearched(true);
      onClose();
      navigate("/pacientes");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-search-overlay" onMouseDown={onClose}>
      <div className="quick-search-container" onMouseDown={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="quick-search-form">
          <div className="search-icon-wrapper">
            <Icon name="icon-search" size={24} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente (Nombre, Cédula...)"
            className="quick-search-input"
            autoComplete="off"
            spellCheck="false"
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setSearchTerm("");
                inputRef.current?.focus();
              }}
              title="Borrar búsqueda"
            >
              <Icon name="icon-x" size={18} />
            </button>
          )}

          <div className="action-buttons">
            <button
              type="submit"
              className="search-button"
              disabled={!searchTerm.trim()}
            >
              <span className="search-text">Buscar</span>
              <span className="search-icon-mobile">
                <Icon name="icon-arrow-right" size={20} />
              </span>
            </button>
          </div>
        </form>

        <div className="quick-search-footer">
          <span>
            Presiona <kbd>Enter</kbd> para buscar
          </span>
          <span className="separator">•</span>
          <span className="esc-hint">
            <kbd>Esc</kbd> para cerrar
          </span>
        </div>

        {/* Botón de cierre flotante para móviles */}
        <button type="button" className="mobile-close-button" onClick={onClose}>
          <Icon name="icon-x" size={24} />
        </button>
      </div>
    </div>
  );
}
