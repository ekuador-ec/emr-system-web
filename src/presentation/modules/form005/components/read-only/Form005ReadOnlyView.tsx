import type { ReactNode } from "react";
import type {
  Form005Document,
  Form005Entry,
} from "@/domain/modules/form005/models/Form005Document";
import type { MedicalRecord } from "@/domain/modules/medical-record/models/MedicalRecord";
import type { OrganizationConfig } from "@/domain/modules/medical-record/models/OrganizationConfig";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import {
  formatBloodPressure,
  formatNumeric,
  formatPupilReaction,
} from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfPage } from "@/presentation/modules/evolution/components/read-only/primitives/EvolutionPdfPage";
import { EvolutionPdfGrid } from "@/presentation/modules/evolution/components/read-only/primitives/EvolutionPdfGrid";
import { EvolutionPdfCell } from "@/presentation/modules/evolution/components/read-only/primitives/EvolutionPdfCell";
import { Icon } from "@/presentation/modules/shared/components/Sidebar/icons/Icon";
import "@/presentation/modules/evolution/components/read-only/EvolutionReadOnlyView.css";
import "./Form005ReadOnlyView.css";
import { Form005PdfHeader } from "./Form005PdfHeader";

interface Form005ReadOnlyViewProps {
  document005: Form005Document;
  patient: Patient;
  medicalRecord: MedicalRecord;
  orgConfig: OrganizationConfig | null | undefined;
}

function MiniCell({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  const isEmpty = !value;
  return (
    <div
      className={`em-pdf-mini-cell ${emphasis ? "em-pdf-mini-cell--total" : ""} ${
        isEmpty ? "em-pdf-mini-cell--empty" : ""
      }`}
    >
      <span className="em-pdf-mini-cell__label">{label}</span>
      <span className="em-pdf-mini-cell__value">{value || "—"}</span>
    </div>
  );
}

function CompoundCell({ label, span, children }: { label: string; span: number; children: ReactNode }) {
  return (
    <div className="em-pdf-cell em-pdf-cell--compound" style={{ gridColumn: `span ${span}` }}>
      <span className="em-pdf-cell__label">{label}</span>
      <div className="em-pdf-compound-row">{children}</div>
    </div>
  );
}

function entryHasVitals(entry: Form005Entry): boolean {
  return (
    Boolean(entry.bpRight || entry.bpLeft) ||
    entry.heartRate != null ||
    entry.respiratoryRate != null ||
    entry.temperature != null ||
    entry.weight != null ||
    entry.height != null ||
    entry.bmi != null ||
    entry.oxygenSaturation != null ||
    entry.capillaryRefillTime != null ||
    entry.glasgowTotal != null ||
    Boolean(entry.rightPupilReaction || entry.leftPupilReaction)
  );
}

function VitalsGrid({ entry }: { entry: Form005Entry }) {
  return (
    <div className="f005-atencion__vitals">
      <EvolutionPdfGrid>
        <CompoundCell label="Presión Arterial (mmHg)" span={3}>
          <MiniCell label="Der." value={formatBloodPressure(entry.bpRight)} />
          <MiniCell label="Izq." value={formatBloodPressure(entry.bpLeft)} />
        </CompoundCell>
        <EvolutionPdfCell label="FC (lpm)" value={formatNumeric(entry.heartRate)} span={1} align="center" emphasis="strong" />
        <EvolutionPdfCell label="FR (rpm)" value={formatNumeric(entry.respiratoryRate)} span={1} align="center" emphasis="strong" />
        <EvolutionPdfCell label="Tª (°C)" value={formatNumeric(entry.temperature, undefined, 1)} span={1} align="center" emphasis="strong" />
        <EvolutionPdfCell label="Peso (kg)" value={formatNumeric(entry.weight, undefined, 2)} span={1} align="center" />
        <EvolutionPdfCell label="Estatura (m)" value={formatNumeric(entry.height, undefined, 2)} span={1} align="center" />
        <EvolutionPdfCell label="IMC" value={formatNumeric(entry.bmi, undefined, 2)} span={1} align="center" emphasis="strong" />
        <EvolutionPdfCell label="Sat. O₂ (%)" value={formatNumeric(entry.oxygenSaturation)} span={1} align="center" />
        <EvolutionPdfCell label="Ll. Capilar (s)" value={formatNumeric(entry.capillaryRefillTime, undefined, 1)} span={2} align="center" />
        <CompoundCell label="Glasgow" span={4}>
          <MiniCell label="O" value={formatNumeric(entry.glasgowOcular)} />
          <MiniCell label="V" value={formatNumeric(entry.glasgowVerbal)} />
          <MiniCell label="M" value={formatNumeric(entry.glasgowMotor)} />
          <MiniCell label="Total" value={formatNumeric(entry.glasgowTotal)} emphasis />
        </CompoundCell>
        <EvolutionPdfCell label="Pupila Der." value={formatPupilReaction(entry.rightPupilReaction)} span={4} align="center" />
        <EvolutionPdfCell label="Pupila Izq." value={formatPupilReaction(entry.leftPupilReaction)} span={4} align="center" />
      </EvolutionPdfGrid>
    </div>
  );
}

function AtencionBlock({ entry, index }: { entry: Form005Entry; index: number }) {
  const note = entry.evolutionNote?.trim();
  const prescriptions = entry.prescriptions?.trim();

  return (
    <section className="f005-atencion">
      <header className="f005-atencion__head">
        <span className="f005-atencion__num">Atención N° {index + 1}</span>
        <span className="f005-atencion__meta">
          <Icon name="icon-calendar-solid" size={12} />
          {entry.attentionDate ?? "—"} {entry.attentionTime ? entry.attentionTime.slice(0, 5) : ""}
        </span>
        <span className="f005-atencion__meta">
          <Icon name="icon-user" size={12} />
          {entry.createdByName ?? "—"}
        </span>
      </header>

      {entryHasVitals(entry) ? <VitalsGrid entry={entry} /> : null}

      <div className="f005-columns">
        <div className="f005-col">
          <header className="em-pdf-section__header">
            <span className="em-pdf-section__number">1</span>
            <div className="em-pdf-section__titles">
              <span className="em-pdf-section__title">Evolución</span>
              <span className="em-pdf-section__subtitle">Notas de evolución</span>
            </div>
          </header>
          <div className={`f005-col__body ${note ? "" : "f005-col__body--empty"}`}>
            {note || "Sin notas de evolución."}
          </div>
        </div>

        <div className="f005-col">
          <header className="em-pdf-section__header">
            <span className="em-pdf-section__number">2</span>
            <div className="em-pdf-section__titles">
              <span className="em-pdf-section__title">Prescripciones</span>
              <span className="em-pdf-section__subtitle">Farmacoterapia e indicaciones</span>
            </div>
          </header>
          <div className={`f005-col__body ${prescriptions ? "" : "f005-col__body--empty"}`}>
            {prescriptions || "Sin prescripciones."}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Form005ReadOnlyView({
  document005,
  patient,
  medicalRecord,
  orgConfig,
}: Form005ReadOnlyViewProps) {
  const entries = document005.entries ?? [];

  return (
    <div className="em-pdf-view">
      <EvolutionPdfPage pageNumber={1} totalPages={1} footerLabel="Evolución y Prescripciones">
        <Form005PdfHeader
          document005={document005}
          patient={patient}
          medicalRecord={medicalRecord}
          orgConfig={orgConfig}
        />

        {entries.length === 0 ? (
          <div className="em-pdf-record-empty">Sin atenciones registradas.</div>
        ) : (
          <div className="f005-atenciones">
            {entries.map((entry, index) => (
              <AtencionBlock key={entry.id} entry={entry} index={index} />
            ))}
          </div>
        )}
      </EvolutionPdfPage>
    </div>
  );
}
