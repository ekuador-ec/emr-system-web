import { useEffect, useState } from "react";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "./WcAutosavePill.css";

export type WcAutosaveStatus =
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "error";

export interface WcAutosavePillProps {
  status: WcAutosaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

function formatRelativeSeconds(from: Date, now: Date): string {
  const diffMs = Math.max(0, now.getTime() - from.getTime());
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export function WcAutosavePill({
  status,
  lastSavedAt,
  className,
}: WcAutosavePillProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (status !== "saved") return;
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => {
      window.clearInterval(id);
    };
  }, [status]);

  if (status === "idle") return null;

  const classes = ["wc-autosave-pill"];
  if (className) classes.push(className);

  if (status === "dirty") {
    return (
      <span className={classes.join(" ")} data-status="dirty" role="status">
        <span className="wc-autosave-pill__dot" aria-hidden="true" />
        <span>Cambios sin guardar</span>
      </span>
    );
  }

  if (status === "saving") {
    return (
      <span className={classes.join(" ")} data-status="saving" role="status">
        <span className="wc-autosave-pill__icon wc-autosave-pill__spinner" aria-hidden="true">
          <Icon name="icon-save" size={14} />
        </span>
        <span>Guardando…</span>
      </span>
    );
  }

  if (status === "saved") {
    const relative = lastSavedAt ? formatRelativeSeconds(lastSavedAt, now) : "ahora";
    return (
      <span className={classes.join(" ")} data-status="saved" role="status">
        <span className="wc-autosave-pill__icon" aria-hidden="true">
          <Icon name="icon-check-solid" size={14} />
        </span>
        <span>{`Guardado · ${relative}`}</span>
      </span>
    );
  }

  return (
    <span className={classes.join(" ")} data-status="error" role="status">
      <span className="wc-autosave-pill__icon" aria-hidden="true">
        <Icon name="icon-cloud-close-solid" size={14} />
      </span>
      <span>Sin conexión · borrador local</span>
    </span>
  );
}
