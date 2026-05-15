import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import type { MedicalRecord } from "@/domain/modules/medical-record/models/MedicalRecord";
import type { OrganizationConfig } from "@/domain/modules/medical-record/models/OrganizationConfig";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import type { UserRole } from "@/domain/modules/users/models/User";
import { EvolutionPdfHeader } from "./EvolutionPdfHeader";
import { EvolutionPdfPage } from "./primitives/EvolutionPdfPage";
import { Section1Admision } from "./sections/Section1Admision";
import { Section2InicioAtencion } from "./sections/Section2InicioAtencion";
import { Section3CausaExterna } from "./sections/Section3CausaExterna";
import { Section4Antecedentes } from "./sections/Section4Antecedentes";
import { Section5EnfermedadActual } from "./sections/Section5EnfermedadActual";
import { Section6SignosVitales } from "./sections/Section6SignosVitales";
import { Section7ExamenFisico } from "./sections/Section7ExamenFisico";
import { Section8LocalizacionLesiones } from "./sections/Section8LocalizacionLesiones";
import { Section9EmergenciaObstetrica } from "./sections/Section9EmergenciaObstetrica";
import { Section10SolicitudExamenes } from "./sections/Section10SolicitudExamenes";
import { SectionDiagnoses } from "./sections/SectionDiagnoses";
import { Section13PlanTratamiento } from "./sections/Section13PlanTratamiento";
import { Section14Alta } from "./sections/Section14Alta";
import "./EvolutionReadOnlyView.css";

interface EvolutionReadOnlyViewProps {
  evolution: MedicalEvolution;
  patient: Patient;
  medicalRecord: MedicalRecord;
  orgConfig: OrganizationConfig | null | undefined;
  closerRole?: UserRole | null;
}

export function EvolutionReadOnlyView({
  evolution,
  patient,
  medicalRecord,
  orgConfig,
  closerRole,
}: EvolutionReadOnlyViewProps) {
  return (
    <div className="em-pdf-view">
      <EvolutionPdfPage pageNumber={1} totalPages={2}>
        <EvolutionPdfHeader
          evolution={evolution}
          patient={patient}
          medicalRecord={medicalRecord}
          orgConfig={orgConfig}
        />
        <Section1Admision evolution={evolution} patient={patient} />
        <Section2InicioAtencion evolution={evolution} />
        <Section3CausaExterna evolution={evolution} />
        <Section4Antecedentes patient={patient} />
        <Section5EnfermedadActual evolution={evolution} />
        <Section6SignosVitales evolution={evolution} />
        <Section7ExamenFisico evolution={evolution} />
        <Section8LocalizacionLesiones evolution={evolution} />
      </EvolutionPdfPage>

      <EvolutionPdfPage pageNumber={2} totalPages={2}>
        <Section9EmergenciaObstetrica evolution={evolution} />
        <Section10SolicitudExamenes />
        <SectionDiagnoses
          evolution={evolution}
          type="INGRESO"
          number={11}
          title="Diagnósticos de Ingreso"
        />
        <SectionDiagnoses
          evolution={evolution}
          type="ALTA"
          number={12}
          title="Diagnósticos de Alta"
        />
        <Section13PlanTratamiento evolution={evolution} />
        <Section14Alta evolution={evolution} closerRole={closerRole} />
      </EvolutionPdfPage>
    </div>
  );
}
