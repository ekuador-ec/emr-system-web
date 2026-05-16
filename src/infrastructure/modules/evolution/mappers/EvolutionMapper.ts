import type { MedicalEvolution } from '@/domain/modules/evolution/models/Evolution';

/**
 * Clamps a numeric value to fit within a PostgreSQL NUMERIC(precision,scale)
 * column. Returns null when:
 *   - The value is null or undefined.
 *   - The value cannot be safely represented within the column (NaN, Infinity,
 *     or absolute value larger than the column's maximum).
 *
 * Mapping out-of-range values to null is a deliberate trade-off: a single
 * mistyped field (e.g. talla in cm instead of meters) used to cause the entire
 * save to fail with "numeric field overflow", losing every other change the
 * user had made. Dropping just that field keeps the rest of the EM persistable
 * while the user fixes the bad value.
 */
function clampNumeric(
  value: number | null | undefined,
  precision: number,
  scale: number,
): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  const maxAbs = Math.pow(10, precision - scale) - Math.pow(10, -scale);
  if (Math.abs(value) > maxAbs) return null;
  return value;
}

/**
 * Talla is captured in meters but some users instinctively type centimeters
 * (e.g. 170 instead of 1.70). When the value clearly falls in the cm range we
 * normalize it to meters before sending it to the database. Values that look
 * like meters pass through unchanged.
 */
function normalizeHeightMeters(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  if (value > 3 && value < 300) return value / 100;
  return value;
}

/**
 * Empty strings produced by HTML date / time / datetime-local inputs after
 * the user clears the field. PostgreSQL refuses them on DATE / TIME /
 * TIMESTAMPTZ columns, so we coerce them to null at the boundary.
 */
function nullIfBlank(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

/**
 * Clamps a number into an INT column. valueAsNumber on an empty input emits
 * NaN, which PostgreSQL rejects on every integer column. Returns null in
 * that case so the column stays empty instead of breaking the whole save.
 * Non-integer numbers get rounded (the schema only stores whole numbers
 * for vitals).
 */
function clampInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  return Math.round(value);
}

export class EvolutionMapper {
  static toDomain(data: any): MedicalEvolution {
    return {
      id: data.id,
      medicalRecordId: data.medical_record_id,
      status: data.status,
      openedBy: data.opened_by,
      openedByName: data.opened_by_name || (data.opener ? `${data.opener.first_name} ${data.opener.last_name}` : undefined),
      closedBy: data.closed_by,
      closedByName: data.closed_by_name || (data.closer ? `${data.closer.first_name} ${data.closer.last_name}` : undefined),
      closedAt: data.closed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,

      arrivalMethod: data.arrival_method ?? null,
      arrivalMethodObservations: data.arrival_method_observations ?? null,
      informationSource: data.information_source ?? null,
      referringPerson: data.referring_person ?? null,
      contactNumber: data.contact_number ?? null,

      attentionDate: data.attention_date,
      attentionTime: data.attention_time,
      clinicalCause: data.clinical_cause,
      clinicalCauseDescription: data.clinical_cause_description,
      notifyPolice: !!data.notify_police,
      
      eventDateTime: data.event_date_time,
      eventLocation: data.event_location,
      eventAddress: data.event_address,
      requiresPoliceCustody: !!data.requires_police_custody,
      alcoholicBreath: !!data.alcoholic_breath,
      alcocheckValue: data.alcocheck_value ? parseFloat(data.alcocheck_value) : null,
      accidentType: data.accident_type,
      violenceType: data.violence_type,
      intoxicationType: data.intoxication_type,
      eventObservations: data.event_observations,
      
      bpRight: data.bp_right,
      bpLeft: data.bp_left,
      heartRate: data.heart_rate,
      respiratoryRate: data.respiratory_rate,
      temperature: data.temperature ? parseFloat(data.temperature) : null,
      bmi: data.bmi ? parseFloat(data.bmi) : null,
      weight: data.weight ? parseFloat(data.weight) : null,
      height: data.height ? parseFloat(data.height) : null,
      rightPupilReaction: data.right_pupil_reaction,
      leftPupilReaction: data.left_pupil_reaction,
      capillaryRefillTime: data.capillary_refill_time,
      oxygenSaturation: data.oxygen_saturation,
      glasgowOcular: data.glasgow_ocular,
      glasgowVerbal: data.glasgow_verbal,
      glasgowMotor: data.glasgow_motor,
      glasgowTotal: data.glasgow_total,
      
      gestations: data.gestations,
      parturitions: data.parturitions,
      abortions: data.abortions,
      cesareans: data.cesareans,
      lastMenstruationDate: data.last_menstruation_date,
      gestationalWeeks: data.gestational_weeks,
      fetalMovement: data.fetal_movement,
      fetalHeartRate: data.fetal_heart_rate,
      rupturedMembranes: data.ruptured_membranes,
      rupturedTime: data.ruptured_time,
      uterineHeight: data.uterine_height ? parseFloat(data.uterine_height) : null,
      presentation: data.presentation,
      dilation: data.dilation,
      effacement: data.effacement,
      plane: data.plane,
      usefulPelvis: data.useful_pelvis,
      vaginalBleeding: data.vaginal_bleeding,
      contractions: data.contractions,
      
      incapacityDays: data.incapacity_days,
      referralService: data.referral_service,
      referralFacility: data.referral_facility,
      deathInEmergency: !!data.death_in_emergency,
      deathCause: data.death_cause,

      systemsReview: data.evolution_systems_review ? data.evolution_systems_review.map((item: any) => ({
        id: item.id,
        airwayStatus: item.airway_status,
        generalCondition: item.general_condition,
        description: item.description
      })) : [],

      physicalExams: data.evolution_physical_exams ? data.evolution_physical_exams.map((item: any) => ({
        id: item.id,
        region: item.region,
        hasPathology: item.has_pathology,
        description: item.description
      })) : [],

      injuries: data.evolution_injuries ? data.evolution_injuries.map((item: any) => ({
        id: item.id,
        injuryType: item.injury_type,
        description: item.description ?? null,
        marker: item.marker ?? null,
      })) : [],

      diagnoses: data.evolution_diagnoses ? data.evolution_diagnoses.map((item: any) => ({
        id: item.id,
        cie10Id: item.cie10_id,
        cie10Code: item.cie10_pathologies?.code,
        cie10Name: item.cie10_pathologies?.description,
        type: item.type,
        certainty: item.certainty,
        description: item.description
      })) : [],

      discharges: data.evolution_discharges ? data.evolution_discharges.map((item: any) => ({
        id: item.id,
        dischargeType: item.discharge_type
      })) : [],

      treatmentPlans: data.evolution_treatment_plans ? data.evolution_treatment_plans.map((item: any) => ({
        id: item.id,
        indication: item.indication,
        medication: item.medication,
        posology: item.posology
      })) : []
    };
  }

  static toDatabase(domain: Partial<MedicalEvolution>): any {
    return {
      medical_record_id: domain.medicalRecordId,
      status: domain.status,

      arrival_method: domain.arrivalMethod,
      arrival_method_observations: domain.arrivalMethodObservations,
      information_source: domain.informationSource,
      referring_person: domain.referringPerson,
      contact_number: domain.contactNumber,

      attention_date: nullIfBlank(domain.attentionDate),
      attention_time: nullIfBlank(domain.attentionTime),
      clinical_cause: domain.clinicalCause,
      clinical_cause_description: domain.clinicalCauseDescription,
      notify_police: domain.notifyPolice,

      event_date_time: nullIfBlank(domain.eventDateTime),
      event_location: domain.eventLocation,
      event_address: domain.eventAddress,
      requires_police_custody: domain.requiresPoliceCustody,
      alcoholic_breath: domain.alcoholicBreath,
      alcocheck_value: clampNumeric(domain.alcocheckValue, 5, 2),
      accident_type: domain.accidentType,
      violence_type: domain.violenceType,
      intoxication_type: domain.intoxicationType,
      event_observations: domain.eventObservations,

      bp_right: domain.bpRight,
      bp_left: domain.bpLeft,
      heart_rate: clampInteger(domain.heartRate),
      respiratory_rate: clampInteger(domain.respiratoryRate),
      temperature: clampNumeric(domain.temperature, 4, 2),
      bmi: clampNumeric(domain.bmi, 5, 2),
      weight: clampNumeric(domain.weight, 6, 2),
      height: clampNumeric(normalizeHeightMeters(domain.height), 4, 2),
      right_pupil_reaction: domain.rightPupilReaction,
      left_pupil_reaction: domain.leftPupilReaction,
      capillary_refill_time: clampInteger(domain.capillaryRefillTime),
      oxygen_saturation: clampInteger(domain.oxygenSaturation),
      glasgow_ocular: clampInteger(domain.glasgowOcular),
      glasgow_verbal: clampInteger(domain.glasgowVerbal),
      glasgow_motor: clampInteger(domain.glasgowMotor),
      glasgow_total: clampInteger(domain.glasgowTotal),

      gestations: clampInteger(domain.gestations),
      parturitions: clampInteger(domain.parturitions),
      abortions: clampInteger(domain.abortions),
      cesareans: clampInteger(domain.cesareans),
      last_menstruation_date: nullIfBlank(domain.lastMenstruationDate),
      gestational_weeks: clampInteger(domain.gestationalWeeks),
      fetal_movement: domain.fetalMovement,
      fetal_heart_rate: clampInteger(domain.fetalHeartRate),
      ruptured_membranes: domain.rupturedMembranes,
      ruptured_time: nullIfBlank(domain.rupturedTime),
      uterine_height: clampNumeric(domain.uterineHeight, 5, 2),
      presentation: domain.presentation,
      dilation: clampInteger(domain.dilation),
      effacement: clampInteger(domain.effacement),
      plane: domain.plane,
      useful_pelvis: domain.usefulPelvis,
      vaginal_bleeding: domain.vaginalBleeding,
      contractions: domain.contractions,

      incapacity_days: clampInteger(domain.incapacityDays),
      referral_service: domain.referralService,
      referral_facility: domain.referralFacility,
      death_in_emergency: domain.deathInEmergency,
      death_cause: domain.deathCause
    };
  }
}
