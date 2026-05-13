import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import WcButton from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButton";
import WcButtonIcon from "@/presentation/modules/shared/components/ui/webcomponents/Buttons/wcButtonIcon";
import { WcStatusBadge } from "@/presentation/modules/shared/components/ui/webcomponents/Badges/WcStatusBadge";
import {
  WcAutosavePill,
  type WcAutosaveStatus,
} from "@/presentation/modules/shared/components/ui/webcomponents/Badges/WcAutosavePill";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import type { EvolutionStatus } from "@/domain/modules/evolution/models/Evolution";
import "./EvolutionPatientBanner.css";

interface EvolutionPatientBannerProps {
  patient: Patient | null | undefined;
  status: EvolutionStatus;
  attentionDate: string | null;
  autosaveStatus: WcAutosaveStatus;
  lastSavedAt: Date | null;
  canCloseEvolution: boolean;
  isClosed: boolean;
  isSavingDraft: boolean;
  isClosing: boolean;
  onBack: () => void;
  onOpenPatientDetail: () => void;
  onSaveDraft: () => void;
  onCloseEvolution: () => void;
}

function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}` || "?";
}

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function formatGender(gender: Patient["gender"]): string {
  if (gender === "FEMENINO") return "F";
  if (gender === "MASCULINO") return "M";
  return "—";
}

function getStatusBadge(status: EvolutionStatus): { variant: "success" | "warning" | "info"; label: string } {
  if (status === "CERRADA") return { variant: "success", label: "Cerrada" };
  if (status === "EN_PROCESO") return { variant: "info", label: "En proceso" };
  return { variant: "warning", label: "Abierta" };
}

interface ShortcutsPopoverProps {
  open: boolean;
  onClose: () => void;
}

function ShortcutsPopover({ open, onClose }: ShortcutsPopoverProps): ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handler(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target || !ref.current) return;
      if (!ref.current.contains(target)) onClose();
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="evolution-banner__shortcuts-popover" role="dialog" aria-label="Atajos de teclado">
      <span className="evolution-banner__shortcuts-title">Atajos de teclado</span>
      <div className="evolution-banner__shortcuts-row">
        <span>Guardar borrador</span>
        <span className="evolution-banner__kbd">
          <kbd>Ctrl</kbd>
          <kbd>S</kbd>
        </span>
      </div>
      <div className="evolution-banner__shortcuts-row">
        <span>Pestaña anterior</span>
        <span className="evolution-banner__kbd">
          <kbd>Alt</kbd>
          <kbd>←</kbd>
        </span>
      </div>
      <div className="evolution-banner__shortcuts-row">
        <span>Pestaña siguiente</span>
        <span className="evolution-banner__kbd">
          <kbd>Alt</kbd>
          <kbd>→</kbd>
        </span>
      </div>
      <div className="evolution-banner__shortcuts-row">
        <span>Detalle del paciente</span>
        <span className="evolution-banner__kbd">
          <kbd>Alt</kbd>
          <kbd>P</kbd>
        </span>
      </div>
    </div>
  );
}

export function EvolutionPatientBanner({
  patient,
  status,
  attentionDate,
  autosaveStatus,
  lastSavedAt,
  canCloseEvolution,
  isClosed,
  isSavingDraft,
  isClosing,
  onBack,
  onOpenPatientDetail,
  onSaveDraft,
  onCloseEvolution,
}: EvolutionPatientBannerProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const age = useMemo(() => calculateAge(patient?.birthDate || null), [patient?.birthDate]);
  const badge = getStatusBadge(status);

  const initials = patient ? getInitials(patient.firstName, patient.lastName) : "?";
  const fullName = patient ? `${patient.firstName} ${patient.lastName}` : "Cargando paciente…";

  const dateLabel = useMemo(() => {
    if (!attentionDate) return null;
    const d = new Date(attentionDate);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
  }, [attentionDate]);

  return (
    <header className="evolution-banner" aria-label="Información del paciente y evolución">
      <button type="button" className="evolution-banner__back" onClick={onBack}>
        <Icon name="icon-chevron-left" size={14} />
        Volver a Historia Clínica
      </button>

      <div className="evolution-banner__row">
        <div className="evolution-banner__patient">
          <span className="evolution-banner__avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="evolution-banner__patient-info">
            <span className="evolution-banner__patient-name" title={fullName}>
              {fullName}
            </span>
            <div className="evolution-banner__patient-meta">
              {patient ? (
                <>
                  <span className="evolution-banner__chip evolution-banner__chip--id">
                    <Icon name="icon-id-card" size={12} />
                    {patient.idNumber}
                  </span>
                  <span className="evolution-banner__chip">{formatGender(patient.gender)}</span>
                  {age !== null ? (
                    <span className="evolution-banner__chip">{age} a</span>
                  ) : null}
                  {patient.bloodType ? (
                    <span className="evolution-banner__chip">{patient.bloodType}</span>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="evolution-banner__divider" aria-hidden="true" />

        <div className="evolution-banner__status">
          <WcStatusBadge variant={badge.variant} size="md">
            {badge.label}
          </WcStatusBadge>
          {dateLabel ? (
            <span className="evolution-banner__chip evolution-banner__chip--id">
              <Icon name="icon-calendar" size={12} />
              {dateLabel}
            </span>
          ) : null}
          {!isClosed ? (
            <WcAutosavePill status={autosaveStatus} lastSavedAt={lastSavedAt} />
          ) : null}
        </div>

        <div className="evolution-banner__actions">
          {patient ? (
            <WcButton variant="terciary" onClick={onOpenPatientDetail}>
              <Icon name="icon-see-details" size={16} />
              Detalle paciente
            </WcButton>
          ) : null}

          {!isClosed ? (
            <>
              <WcButton variant="secondary" onClick={onSaveDraft} disabled={isSavingDraft}>
                <Icon name="icon-save" size={16} />
                {isSavingDraft ? "Guardando…" : "Guardar borrador"}
              </WcButton>
              {canCloseEvolution ? (
                <WcButton
                  variant="primary"
                  onClick={onCloseEvolution}
                  disabled={isClosing || isSavingDraft}
                >
                  <Icon name="icon-check" size={16} />
                  {isClosing ? "Cerrando…" : "Firmar y cerrar"}
                </WcButton>
              ) : null}
            </>
          ) : null}

          <div className="evolution-banner__shortcuts">
            <WcButtonIcon
              variant="secondary"
              shape="square"
              size="sm"
              onClick={() => setShortcutsOpen((value) => !value)}
              aria-label="Mostrar atajos de teclado"
              aria-expanded={shortcutsOpen}
            >
              <Icon name="icon-info-circle" size={16} />
            </WcButtonIcon>
            <ShortcutsPopover open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}
