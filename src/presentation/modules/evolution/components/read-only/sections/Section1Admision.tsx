import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import type { Patient } from "@/domain/modules/patient/models/Patient";
import {
  formatBirthDate,
  formatPatientAge,
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  EDUCATION_LEVEL_LABELS,
  CULTURAL_GROUP_LABELS,
  INFORMATION_SOURCE_LABELS,
  HEALTH_INSURANCE_LABELS,
  KINSHIP_LABELS,
} from "@/presentation/modules/patient/utils/patientFormatters";
import { ARRIVAL_METHOD_LABELS } from "@/presentation/modules/evolution/utils/evolutionLabels";
import { EvolutionPdfSection } from "../primitives/EvolutionPdfSection";
import { EvolutionPdfGrid } from "../primitives/EvolutionPdfGrid";
import { EvolutionPdfCell } from "../primitives/EvolutionPdfCell";

interface Section1Props {
  evolution: MedicalEvolution;
  patient: Patient;
}

export function Section1Admision({ evolution, patient }: Section1Props) {
  const age = formatPatientAge(patient.birthDate);
  const birth = formatBirthDate(patient.birthDate);
  const geo = patient.geographicLocation;

  const culturalLabel = patient.culturalGroup
    ? patient.culturalGroup === "OTRO" && patient.culturalGroupOther?.trim()
      ? `${CULTURAL_GROUP_LABELS[patient.culturalGroup]} · ${patient.culturalGroupOther}`
      : CULTURAL_GROUP_LABELS[patient.culturalGroup]
    : null;

  const infoSourceLabel = patient.infoSourceType
    ? patient.infoSourceType === "OTRO" && patient.infoSourceOther?.trim()
      ? `${INFORMATION_SOURCE_LABELS[patient.infoSourceType]} · ${patient.infoSourceOther}`
      : INFORMATION_SOURCE_LABELS[patient.infoSourceType]
    : null;

  const emergencyContacts = patient.emergencyContacts ?? [];
  const lastEmergencyContact =
    emergencyContacts.length > 0
      ? emergencyContacts[emergencyContacts.length - 1]
      : null;
  const emergencyKinshipLabel = lastEmergencyContact
    ? lastEmergencyContact.kinship === "OTRO" && lastEmergencyContact.kinshipOther?.trim()
      ? `${KINSHIP_LABELS[lastEmergencyContact.kinship]} · ${lastEmergencyContact.kinshipOther}`
      : KINSHIP_LABELS[lastEmergencyContact.kinship]
    : null;

  return (
    <EvolutionPdfSection number={1} title="Registro de Admisión">
      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Cédula / ID"
          value={patient.idNumber}
          span={3}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Primer Apellido"
          value={patient.lastName}
          span={3}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Segundo Apellido"
          value={patient.secondLastName}
          span={3}
        />
        <EvolutionPdfCell
          label="Nombres"
          value={[patient.firstName, patient.middleName].filter(Boolean).join(" ")}
          span={3}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Sexo"
          value={GENDER_LABELS[patient.gender] || patient.gender}
          span={2}
        />
        <EvolutionPdfCell label="Edad" value={age} span={2} />
        <EvolutionPdfCell label="Fecha de Nacimiento" value={birth} span={3} />
        <EvolutionPdfCell
          label="Lugar de Nacimiento"
          value={patient.birthPlace}
          span={3}
        />
        <EvolutionPdfCell
          label="Tipo de Sangre"
          value={patient.bloodType}
          span={2}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Nacionalidad"
          value={patient.nationality}
          span={3}
        />
        <EvolutionPdfCell
          label="Estado Civil"
          value={
            patient.maritalStatus ? MARITAL_STATUS_LABELS[patient.maritalStatus] : null
          }
          span={3}
        />
        <EvolutionPdfCell
          label="Instrucción"
          value={
            patient.educationLevel
              ? EDUCATION_LEVEL_LABELS[patient.educationLevel]
              : null
          }
          span={3}
        />
        <EvolutionPdfCell
          label="Grupo Cultural"
          value={culturalLabel}
          span={3}
        />
        <EvolutionPdfCell
          label="Ocupación"
          value={patient.occupation?.name}
          span={4}
        />
        <EvolutionPdfCell label="Empresa" value={patient.companyName} span={4} />
        <EvolutionPdfCell
          label="Seguro de Salud"
          value={
            patient.healthInsurance
              ? HEALTH_INSURANCE_LABELS[patient.healthInsurance]
              : null
          }
          span={4}
        />
        <EvolutionPdfCell
          label="Dirección de Domicilio"
          value={patient.homeAddress}
          span={6}
          align="left"
        />
        <EvolutionPdfCell
          label="Barrio / Sector"
          value={patient.neighborhood}
          span={3}
        />
        <EvolutionPdfCell label="Email" value={patient.email} span={3} align="left" />
        <EvolutionPdfCell label="Provincia" value={geo?.province} span={3} />
        <EvolutionPdfCell label="Cantón" value={geo?.canton} span={3} />
        <EvolutionPdfCell label="Parroquia" value={geo?.parish} span={3} />
        <EvolutionPdfCell label="Teléfono" value={patient.phone} span={3} />
      </EvolutionPdfGrid>

      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Fuente de Información"
          value={infoSourceLabel}
          span={4}
        />
        <EvolutionPdfCell
          label="Nombre del Informante"
          value={patient.infoSourceName || evolution.informationSource}
          span={4}
        />
        <EvolutionPdfCell
          label="Teléfono del Informante"
          value={patient.infoSourcePhone}
          span={4}
        />
      </EvolutionPdfGrid>

      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="En caso necesario avisar a:"
          value={lastEmergencyContact?.name}
          span={4}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Parentesco / Afinidad"
          value={emergencyKinshipLabel}
          span={3}
        />
        <EvolutionPdfCell
          label="Dirección del Contacto"
          value={lastEmergencyContact?.address}
          span={3}
          align="left"
        />
        <EvolutionPdfCell
          label="Teléfono del Contacto"
          value={lastEmergencyContact?.phone}
          span={2}
        />
      </EvolutionPdfGrid>

      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Forma de Llegada"
          value={
            evolution.arrivalMethod
              ? ARRIVAL_METHOD_LABELS[evolution.arrivalMethod]
              : null
          }
          span={3}
          emphasis="strong"
        />
        <EvolutionPdfCell
          label="Observación de la Llegada"
          value={evolution.arrivalMethodObservations}
          span={9}
          align="left"
        />
      </EvolutionPdfGrid>

      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Institución / Persona que entrega"
          value={evolution.referringPerson}
          span={8}
          align="left"
        />
        <EvolutionPdfCell
          label="Teléfono de Contacto"
          value={evolution.contactNumber}
          span={4}
        />
      </EvolutionPdfGrid>

      <EvolutionPdfGrid>
        <EvolutionPdfCell
          label="Referido de:"
          value={null}
          span={12}
          align="left"
        />
      </EvolutionPdfGrid>
    </EvolutionPdfSection>
  );
}
