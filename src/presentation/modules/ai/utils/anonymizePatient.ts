import type { Patient } from "@/domain/modules/patient/models/Patient";

export interface AnonymizedPatient {
  patientId: string;
  ageYears: number | null;
  gender: string | null;
  bloodType: string | null;
  maritalStatus: string | null;
  culturalGroup: string | null;
  educationLevel: string | null;
  occupation: string | null;
  geographicLocation: {
    province: string | null;
    canton: string | null;
    parish: string | null;
  } | null;
  healthInsurance: string | null;
  currentlyWorks: boolean;
  clinicalAntecedents: Array<{
    type: string;
    description: string | null;
    pathology: { code: string; description: string } | null;
    diagnosisDate: string | null;
    treatment: string | null;
    isActive: boolean;
  }>;
}

function calculateAgeYears(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function anonymizePatient(patient: Patient): AnonymizedPatient {
  const location = patient.geographicLocation
    ? {
        province: patient.geographicLocation.province ?? null,
        canton: patient.geographicLocation.canton ?? null,
        parish: patient.geographicLocation.parish ?? null,
      }
    : null;

  return {
    patientId: patient.id,
    ageYears: calculateAgeYears(patient.birthDate),
    gender: patient.gender ?? null,
    bloodType: patient.bloodType ?? null,
    maritalStatus: patient.maritalStatus ?? null,
    culturalGroup: patient.culturalGroup ?? null,
    educationLevel: patient.educationLevel ?? null,
    occupation: patient.occupation?.name ?? null,
    geographicLocation: location,
    healthInsurance: patient.healthInsurance ?? null,
    currentlyWorks: patient.currentlyWorks,
    clinicalAntecedents: (patient.clinicalAntecedents ?? []).map((a) => ({
      type: a.antecedentType,
      description: a.description,
      pathology: a.pathology
        ? { code: a.pathology.code, description: a.pathology.description }
        : null,
      diagnosisDate: a.diagnosisDate,
      treatment: a.treatment,
      isActive: a.isActive,
    })),
  };
}
