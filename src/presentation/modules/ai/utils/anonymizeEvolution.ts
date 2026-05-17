import type { MedicalEvolution } from "@/domain/modules/evolution/models/Evolution";

export interface AnonymizedEvolution {
  evolutionId: string;
  medicalRecordId: string;
  status: string;
  openedAt: string;
  closedAt: string | null;
  arrivalMethod: string | null;
  clinicalCause: string | null;
  clinicalCauseDescription: string | null;
  attentionDateTime: string | null;
  accidentType: string | null;
  violenceType: string | null;
  intoxicationType: string | null;
  vitalSigns: {
    bpRight: string | null;
    bpLeft: string | null;
    heartRate: number | null;
    respiratoryRate: number | null;
    temperatureCelsius: number | null;
    oxygenSaturation: number | null;
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    glasgowTotal: number | null;
    glasgowOcular: number | null;
    glasgowVerbal: number | null;
    glasgowMotor: number | null;
    capillaryRefillSeconds: number | null;
  } | null;
  systemsReview: Array<{
    airwayStatus: string;
    generalCondition: string;
    notes: string;
  }>;
  physicalExams: Array<{
    region: string;
    hasPathology: boolean;
    findings: string;
  }>;
  injuries: Array<{
    type: string;
    description: string | null;
  }>;
  diagnoses: Array<{
    type: string;
    certainty: string;
    pathology: { code: string; description: string } | null;
    description: string;
  }>;
  obstetric: {
    gestations: number | null;
    parturitions: number | null;
    abortions: number | null;
    cesareans: number | null;
    gestationalWeeks: number | null;
    fetalHeartRate: number | null;
    fetalMovement: boolean | null;
    rupturedMembranes: boolean | null;
    vaginalBleeding: boolean | null;
    contractions: boolean | null;
    presentation: string | null;
    dilation: number | null;
    effacement: number | null;
  } | null;
  treatmentPlans: Array<{
    indication: string;
    medication: string;
    posology: string;
  }>;
  discharge: {
    types: string[];
    incapacityDays: number | null;
    deathInEmergency: boolean;
    deathCause: string | null;
  } | null;
}

function attentionDateTime(date: string | null, time: string | null): string | null {
  if (!date && !time) return null;
  if (date && time) return `${date}T${time}`;
  return date ?? time;
}

function hasObstetricData(e: MedicalEvolution): boolean {
  return (
    e.gestations !== null ||
    e.parturitions !== null ||
    e.abortions !== null ||
    e.cesareans !== null ||
    e.gestationalWeeks !== null ||
    e.fetalHeartRate !== null
  );
}

function hasVitalSigns(e: MedicalEvolution): boolean {
  return (
    e.bpRight !== null ||
    e.bpLeft !== null ||
    e.heartRate !== null ||
    e.respiratoryRate !== null ||
    e.temperature !== null ||
    e.oxygenSaturation !== null ||
    e.weight !== null ||
    e.height !== null ||
    e.bmi !== null ||
    e.glasgowTotal !== null
  );
}

export function anonymizeEvolution(evolution: MedicalEvolution): AnonymizedEvolution {
  return {
    evolutionId: evolution.id,
    medicalRecordId: evolution.medicalRecordId,
    status: evolution.status,
    openedAt: evolution.createdAt,
    closedAt: evolution.closedAt,
    arrivalMethod: evolution.arrivalMethod,
    clinicalCause: evolution.clinicalCause,
    clinicalCauseDescription: evolution.clinicalCauseDescription,
    attentionDateTime: attentionDateTime(evolution.attentionDate, evolution.attentionTime),
    accidentType: evolution.accidentType,
    violenceType: evolution.violenceType,
    intoxicationType: evolution.intoxicationType,
    vitalSigns: hasVitalSigns(evolution)
      ? {
          bpRight: evolution.bpRight,
          bpLeft: evolution.bpLeft,
          heartRate: evolution.heartRate,
          respiratoryRate: evolution.respiratoryRate,
          temperatureCelsius: evolution.temperature,
          oxygenSaturation: evolution.oxygenSaturation,
          weightKg: evolution.weight,
          heightCm: evolution.height,
          bmi: evolution.bmi,
          glasgowTotal: evolution.glasgowTotal,
          glasgowOcular: evolution.glasgowOcular,
          glasgowVerbal: evolution.glasgowVerbal,
          glasgowMotor: evolution.glasgowMotor,
          capillaryRefillSeconds: evolution.capillaryRefillTime,
        }
      : null,
    systemsReview: (evolution.systemsReview ?? []).map((s) => ({
      airwayStatus: s.airwayStatus,
      generalCondition: s.generalCondition,
      notes: s.description,
    })),
    physicalExams: (evolution.physicalExams ?? []).map((p) => ({
      region: p.region,
      hasPathology: p.hasPathology,
      findings: p.description,
    })),
    injuries: (evolution.injuries ?? []).map((i) => ({
      type: i.injuryType,
      description: i.description,
    })),
    diagnoses: (evolution.diagnoses ?? []).map((d) => ({
      type: d.type,
      certainty: d.certainty,
      pathology:
        d.cie10Code && d.cie10Name
          ? { code: d.cie10Code, description: d.cie10Name }
          : null,
      description: d.description,
    })),
    obstetric: hasObstetricData(evolution)
      ? {
          gestations: evolution.gestations,
          parturitions: evolution.parturitions,
          abortions: evolution.abortions,
          cesareans: evolution.cesareans,
          gestationalWeeks: evolution.gestationalWeeks,
          fetalHeartRate: evolution.fetalHeartRate,
          fetalMovement: evolution.fetalMovement,
          rupturedMembranes: evolution.rupturedMembranes,
          vaginalBleeding: evolution.vaginalBleeding,
          contractions: evolution.contractions,
          presentation: evolution.presentation,
          dilation: evolution.dilation,
          effacement: evolution.effacement,
        }
      : null,
    treatmentPlans: (evolution.treatmentPlans ?? []).map((t) => ({
      indication: t.indication,
      medication: t.medication,
      posology: t.posology,
    })),
    discharge:
      evolution.discharges && evolution.discharges.length > 0
        ? {
            types: evolution.discharges.map((d) => d.dischargeType),
            incapacityDays: evolution.incapacityDays,
            deathInEmergency: evolution.deathInEmergency,
            deathCause: evolution.deathCause,
          }
        : evolution.deathInEmergency || evolution.incapacityDays !== null
          ? {
              types: [],
              incapacityDays: evolution.incapacityDays,
              deathInEmergency: evolution.deathInEmergency,
              deathCause: evolution.deathCause,
            }
          : null,
  };
}
