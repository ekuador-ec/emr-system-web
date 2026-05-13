import type { EvolutionRepository } from "@/domain/modules/evolution/repositories/EvolutionRepository";
import type {
  CreateEvolutionPayload,
  EvolutionFilters,
  MedicalEvolution,
  MedicalEvolutionListItem,
  PaginatedResult,
  UpdateEvolutionPayload,
} from "@/domain/modules/evolution/models/Evolution";
import { EvolutionMapper } from "../mappers/EvolutionMapper";
import { supabase } from "@/infrastructure/core/supabaseClient";
import {
  endOfLocalDayIso,
  startOfLocalDayIso,
} from "@/infrastructure/core/dateBoundaries";

interface EvolutionListRow {
  id: string;
  medical_record_id: string;
  status: MedicalEvolution["status"];
  opened_by: string;
  closed_by: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  attention_date: string | null;
  attention_time: string | null;
  clinical_cause: MedicalEvolution["clinicalCause"];
  event_observations: string | null;
  opener: { first_name: string; last_name: string } | null;
  closer: { first_name: string; last_name: string } | null;
  medical_record: {
    id: string;
    patient_id: string;
    patient: {
      first_name: string;
      last_name: string;
      second_last_name: string | null;
      id_number: string;
    } | null;
  } | null;
}

function buildFullName(
  firstName: string,
  lastName: string,
  secondLastName?: string | null,
): string {
  return `${firstName} ${lastName} ${secondLastName ?? ""}`.trim();
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-fA-F-]{36}$/.test(value);
}

/**
 * Removes incomplete or duplicate child rows before sending them to the
 * server. The form treats array rows as ephemeral scratchpads (a row exists
 * the moment the user clicks "Agregar"), so we filter out anything that does
 * not satisfy the table's NOT NULL / UNIQUE constraints. Otherwise a single
 * incomplete row used to fail the whole multi-row INSERT, taking the rest of
 * the EM down with it. dedupe keys mirror the SQL UNIQUE constraints so
 * adding the same combo twice no longer breaks the save.
 */
type SystemsReviewInsert = {
  evolution_id: string;
  airway_status: string;
  general_condition: string;
  description: string | null;
};

function cleanSystemsReview(
  items: NonNullable<UpdateEvolutionPayload["systemsReview"]> | undefined,
  evolutionId: string,
): SystemsReviewInsert[] {
  if (!items) return [];
  const seen = new Set<string>();
  const result: SystemsReviewInsert[] = [];
  for (const item of items) {
    if (!item.airwayStatus || !item.generalCondition) continue;
    const key = `${item.airwayStatus}::${item.generalCondition}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      evolution_id: evolutionId,
      airway_status: item.airwayStatus,
      general_condition: item.generalCondition,
      description: item.description?.trim() ? item.description : null,
    });
  }
  return result;
}

type PhysicalExamInsert = {
  evolution_id: string;
  region: string;
  has_pathology: boolean;
  description: string | null;
};

function cleanPhysicalExams(
  items: NonNullable<UpdateEvolutionPayload["physicalExams"]> | undefined,
  evolutionId: string,
): PhysicalExamInsert[] {
  if (!items) return [];
  const seen = new Set<string>();
  const result: PhysicalExamInsert[] = [];
  for (const item of items) {
    if (!item.region) continue;
    if (seen.has(item.region)) continue;
    seen.add(item.region);
    result.push({
      evolution_id: evolutionId,
      region: item.region,
      has_pathology: Boolean(item.hasPathology),
      description: item.description?.trim() ? item.description : null,
    });
  }
  return result;
}

type InjuryInsert = { evolution_id: string; injury_type: string };

function cleanInjuries(
  items: NonNullable<UpdateEvolutionPayload["injuries"]> | undefined,
  evolutionId: string,
): InjuryInsert[] {
  if (!items) return [];
  const seen = new Set<string>();
  const result: InjuryInsert[] = [];
  for (const item of items) {
    if (!item.injuryType) continue;
    if (seen.has(item.injuryType)) continue;
    seen.add(item.injuryType);
    result.push({ evolution_id: evolutionId, injury_type: item.injuryType });
  }
  return result;
}

type DiagnosisInsert = {
  evolution_id: string;
  cie10_id: string;
  type: string;
  certainty: string;
  description: string | null;
};

function cleanDiagnoses(
  items: NonNullable<UpdateEvolutionPayload["diagnoses"]> | undefined,
  evolutionId: string,
): DiagnosisInsert[] {
  if (!items) return [];
  const result: DiagnosisInsert[] = [];
  for (const item of items) {
    const cie10 = (item.cie10Id ?? "").trim();
    if (!isUuidLike(cie10)) continue;
    if (!item.type || !item.certainty) continue;
    result.push({
      evolution_id: evolutionId,
      cie10_id: cie10,
      type: item.type,
      certainty: item.certainty,
      description: item.description?.trim() ? item.description : null,
    });
  }
  return result;
}

type DischargeInsert = { evolution_id: string; discharge_type: string };

function cleanDischarges(
  items: NonNullable<UpdateEvolutionPayload["discharges"]> | undefined,
  evolutionId: string,
): DischargeInsert[] {
  if (!items) return [];
  const seen = new Set<string>();
  const result: DischargeInsert[] = [];
  for (const item of items) {
    if (!item.dischargeType) continue;
    if (seen.has(item.dischargeType)) continue;
    seen.add(item.dischargeType);
    result.push({ evolution_id: evolutionId, discharge_type: item.dischargeType });
  }
  return result;
}

type TreatmentPlanInsert = {
  evolution_id: string;
  indication: string;
  medication: string;
  posology: string;
};

function cleanTreatmentPlans(
  items: NonNullable<UpdateEvolutionPayload["treatmentPlans"]> | undefined,
  evolutionId: string,
): TreatmentPlanInsert[] {
  if (!items) return [];
  const result: TreatmentPlanInsert[] = [];
  for (const item of items) {
    const indication = (item.indication ?? "").trim();
    const medication = (item.medication ?? "").trim();
    const posology = (item.posology ?? "").trim();
    // Skip fully empty placeholder rows added by the UI; keep partial rows so
    // the user can save in progress.
    if (!indication && !medication && !posology) continue;
    result.push({
      evolution_id: evolutionId,
      indication,
      medication,
      posology,
    });
  }
  return result;
}

async function deleteChildRows(table: string, evolutionId: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("evolution_id", evolutionId);
  if (error) throw new Error(`Error clearing ${table}: ${error.message}`);
}

async function insertChildRows<TRow extends { evolution_id: string }>(
  table: string,
  rows: TRow[],
): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`Error saving ${table}: ${error.message}`);
}

export class SupabaseEvolutionRepository implements EvolutionRepository {
  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user found");
    return user.id;
  }

  async create(payload: CreateEvolutionPayload): Promise<MedicalEvolution> {
    const userId = await this.getUserId();
    const evolutionData = EvolutionMapper.toDatabase({
      ...payload,
      status: "ABIERTA",
    } as Partial<MedicalEvolution>);
    evolutionData.opened_by = userId;

    const { data: evolution, error } = await supabase
      .from("medical_evolutions")
      .insert(evolutionData)
      .select(`
        *,
        opener:profiles!medical_evolutions_opened_by_fkey(first_name, last_name),
        closer:profiles!medical_evolutions_closed_by_fkey(first_name, last_name)
      `)
      .single();

    if (error) throw new Error(`Error creating evolution: ${error.message}`);

    const evolutionId = evolution.id;

    await insertChildRows("evolution_systems_review", cleanSystemsReview(payload.systemsReview, evolutionId));
    await insertChildRows("evolution_physical_exams", cleanPhysicalExams(payload.physicalExams, evolutionId));
    await insertChildRows("evolution_injuries", cleanInjuries(payload.injuries, evolutionId));
    await insertChildRows("evolution_diagnoses", cleanDiagnoses(payload.diagnoses, evolutionId));
    await insertChildRows("evolution_discharges", cleanDischarges(payload.discharges, evolutionId));
    await insertChildRows("evolution_treatment_plans", cleanTreatmentPlans(payload.treatmentPlans, evolutionId));

    return this.getById(evolutionId);
  }

  async update(id: string, payload: UpdateEvolutionPayload): Promise<MedicalEvolution> {
    const evolutionData = EvolutionMapper.toDatabase(payload as Partial<MedicalEvolution>);
    const updateData = Object.fromEntries(
      Object.entries(evolutionData).filter(([, value]) => value !== undefined),
    );
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from("medical_evolutions").update(updateData).eq("id", id);
      if (error) throw new Error(`Error updating evolution: ${error.message}`);
    }

    if (payload.systemsReview) {
      await deleteChildRows("evolution_systems_review", id);
      await insertChildRows("evolution_systems_review", cleanSystemsReview(payload.systemsReview, id));
    }

    if (payload.physicalExams) {
      await deleteChildRows("evolution_physical_exams", id);
      await insertChildRows("evolution_physical_exams", cleanPhysicalExams(payload.physicalExams, id));
    }

    if (payload.injuries) {
      await deleteChildRows("evolution_injuries", id);
      await insertChildRows("evolution_injuries", cleanInjuries(payload.injuries, id));
    }

    if (payload.diagnoses) {
      await deleteChildRows("evolution_diagnoses", id);
      await insertChildRows("evolution_diagnoses", cleanDiagnoses(payload.diagnoses, id));
    }

    if (payload.discharges) {
      await deleteChildRows("evolution_discharges", id);
      await insertChildRows("evolution_discharges", cleanDischarges(payload.discharges, id));
    }

    if (payload.treatmentPlans) {
      await deleteChildRows("evolution_treatment_plans", id);
      await insertChildRows("evolution_treatment_plans", cleanTreatmentPlans(payload.treatmentPlans, id));
    }

    return this.getById(id);
  }

  async close(id: string): Promise<MedicalEvolution> {
    const userId = await this.getUserId();

    const { error } = await supabase
      .from("medical_evolutions")
      .update({
        status: "CERRADA",
        closed_by: userId,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(`Error closing evolution: ${error.message}`);

    return this.getById(id);
  }

  async getById(id: string): Promise<MedicalEvolution> {
    const { data, error } = await supabase
      .from("medical_evolutions")
      .select(`
        *,
        opener:profiles!medical_evolutions_opened_by_fkey(first_name, last_name),
        closer:profiles!medical_evolutions_closed_by_fkey(first_name, last_name),
        evolution_systems_review(*),
        evolution_physical_exams(*),
        evolution_injuries(*),
        evolution_diagnoses(
          *,
          cie10_pathologies(code, description)
        ),
        evolution_discharges(*),
        evolution_treatment_plans(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(`Error fetching evolution: ${error.message}`);

    return EvolutionMapper.toDomain(data);
  }

  async getByMedicalRecordId(medicalRecordId: string): Promise<MedicalEvolution[]> {
    const { data, error } = await supabase
      .from("medical_evolutions")
      .select(`
        *,
        opener:profiles!medical_evolutions_opened_by_fkey(first_name, last_name),
        closer:profiles!medical_evolutions_closed_by_fkey(first_name, last_name)
      `)
      .eq("medical_record_id", medicalRecordId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Error fetching evolutions: ${error.message}`);

    return (data ?? []).map(EvolutionMapper.toDomain);
  }

  async getEvolutions(
    filters?: EvolutionFilters,
  ): Promise<PaginatedResult<MedicalEvolutionListItem>> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const search = filters?.search?.trim();

    let query = supabase
      .from("medical_evolutions")
      .select(
        `
          id,
          medical_record_id,
          status,
          opened_by,
          closed_by,
          closed_at,
          created_at,
          updated_at,
          attention_date,
          attention_time,
          clinical_cause,
          event_observations,
          opener:profiles!medical_evolutions_opened_by_fkey(first_name, last_name),
          closer:profiles!medical_evolutions_closed_by_fkey(first_name, last_name),
          medical_record:medical_records!inner(
            id,
            patient_id,
            patient:patients!inner(
              first_name,
              last_name,
              second_last_name,
              id_number
            )
          )
        `,
        { count: "exact" },
      )
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      if (isUuidLike(search)) {
        query = query.eq("medical_record_id", search);
      } else {
        const { data: recordsData } = await supabase
          .from("medical_records")
          .select("id, patient:patients!inner(id, first_name, last_name, id_number)")
          .or(
            `id_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
            { referencedTable: "patients" },
          );

        const recordIds = recordsData ? recordsData.map((r) => r.id) : [];

        if (recordIds.length > 0) {
          query = query.in("medical_record_id", recordIds);
        } else {
          // If no matches, return empty result from the main query
          query = query.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      }
    }

    if (filters?.startDate) {
      query = query.gte("updated_at", startOfLocalDayIso(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.lte("updated_at", endOfLocalDayIso(filters.endDate));
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Error fetching evolutions: ${error.message}`);
    }

    const rows = (data ?? []) as unknown as EvolutionListRow[];

    return {
      data: rows.map((row) => {
        const medicalRecord = row.medical_record;
        const patient = medicalRecord?.patient;

        if (!medicalRecord || !patient) {
          throw new Error("Error mapping evolution list item: missing patient relation");
        }

        return {
          id: row.id,
          medicalRecordId: row.medical_record_id,
          patientId: medicalRecord.patient_id,
          patientName: buildFullName(
            patient.first_name,
            patient.last_name,
            patient.second_last_name,
          ),
          patientIdNumber: patient.id_number,
          status: row.status,
          attentionDate: row.attention_date,
          attentionTime: row.attention_time,
          openedByName: row.opener
            ? buildFullName(row.opener.first_name, row.opener.last_name)
            : null,
          closedByName: row.closer
            ? buildFullName(row.closer.first_name, row.closer.last_name)
            : null,
          closedAt: row.closed_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          clinicalCause: row.clinical_cause,
          eventObservations: row.event_observations,
        };
      }),
      total: count ?? 0,
      page,
      limit,
    };
  }
}
