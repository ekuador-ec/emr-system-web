import type { MedicalEvolution } from '@/domain/modules/evolution/models/Evolution';

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
        injuryType: item.injury_type
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
      
      attention_date: domain.attentionDate,
      attention_time: domain.attentionTime,
      clinical_cause: domain.clinicalCause,
      clinical_cause_description: domain.clinicalCauseDescription,
      notify_police: domain.notifyPolice,
      
      event_date_time: domain.eventDateTime,
      event_location: domain.eventLocation,
      event_address: domain.eventAddress,
      requires_police_custody: domain.requiresPoliceCustody,
      alcoholic_breath: domain.alcoholicBreath,
      alcocheck_value: domain.alcocheckValue,
      accident_type: domain.accidentType,
      violence_type: domain.violenceType,
      intoxication_type: domain.intoxicationType,
      event_observations: domain.eventObservations,
      
      bp_right: domain.bpRight,
      bp_left: domain.bpLeft,
      heart_rate: domain.heartRate,
      respiratory_rate: domain.respiratoryRate,
      temperature: domain.temperature,
      bmi: domain.bmi,
      weight: domain.weight,
      height: domain.height,
      right_pupil_reaction: domain.rightPupilReaction,
      left_pupil_reaction: domain.leftPupilReaction,
      capillary_refill_time: domain.capillaryRefillTime,
      oxygen_saturation: domain.oxygenSaturation,
      glasgow_ocular: domain.glasgowOcular,
      glasgow_verbal: domain.glasgowVerbal,
      glasgow_motor: domain.glasgowMotor,
      glasgow_total: domain.glasgowTotal,
      
      gestations: domain.gestations,
      parturitions: domain.parturitions,
      abortions: domain.abortions,
      cesareans: domain.cesareans,
      last_menstruation_date: domain.lastMenstruationDate,
      gestational_weeks: domain.gestationalWeeks,
      fetal_movement: domain.fetalMovement,
      fetal_heart_rate: domain.fetalHeartRate,
      ruptured_membranes: domain.rupturedMembranes,
      ruptured_time: domain.rupturedTime,
      uterine_height: domain.uterineHeight,
      presentation: domain.presentation,
      dilation: domain.dilation,
      effacement: domain.effacement,
      plane: domain.plane,
      useful_pelvis: domain.usefulPelvis,
      vaginal_bleeding: domain.vaginalBleeding,
      contractions: domain.contractions,
      
      incapacity_days: domain.incapacityDays,
      referral_service: domain.referralService,
      referral_facility: domain.referralFacility,
      death_in_emergency: domain.deathInEmergency,
      death_cause: domain.deathCause
    };
  }
}
