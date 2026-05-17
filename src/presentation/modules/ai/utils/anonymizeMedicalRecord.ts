import type { Patient } from "@/domain/modules/patient/models/Patient";
import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";
import type { MedicalRecord } from "@/domain/modules/medical-record/models/MedicalRecord";
import {
  anonymizePatient,
  type AnonymizedPatient,
} from "@/presentation/modules/ai/utils/anonymizePatient";
import {
  anonymizeEvolution,
  type AnonymizedEvolution,
} from "@/presentation/modules/ai/utils/anonymizeEvolution";

export interface AnonymizedMedicalRecord {
  medicalRecordId: string;
  patient: AnonymizedPatient;
  evolutions: AnonymizedEvolution[];
  evolutionCount: number;
  createdAt: string;
  updatedAt: string;
}

export function anonymizeMedicalRecord(
  record: MedicalRecord,
  patient: Patient,
  evolutions: MedicalEvolution[],
): AnonymizedMedicalRecord {
  return {
    medicalRecordId: record.id,
    patient: anonymizePatient(patient),
    evolutions: evolutions.map(anonymizeEvolution),
    evolutionCount: record.evolutionCount,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
