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

    if (payload.systemsReview && payload.systemsReview.length > 0) {
      await supabase.from("evolution_systems_review").insert(
        payload.systemsReview.map((item) => ({
          evolution_id: evolutionId,
          condition: item.condition,
          description: item.description,
        })),
      );
    }

    if (payload.physicalExams && payload.physicalExams.length > 0) {
      await supabase.from("evolution_physical_exams").insert(
        payload.physicalExams.map((item) => ({
          evolution_id: evolutionId,
          region: item.region,
          has_pathology: item.hasPathology,
          description: item.description,
        })),
      );
    }

    if (payload.injuries && payload.injuries.length > 0) {
      await supabase.from("evolution_injuries").insert(
        payload.injuries.map((item) => ({
          evolution_id: evolutionId,
          injury_type: item.injuryType,
        })),
      );
    }

    if (payload.diagnoses && payload.diagnoses.length > 0) {
      await supabase.from("evolution_diagnoses").insert(
        payload.diagnoses.map((item) => ({
          evolution_id: evolutionId,
          cie10_id: item.cie10Id,
          type: item.type,
          certainty: item.certainty,
          description: item.description,
        })),
      );
    }

    if (payload.discharges && payload.discharges.length > 0) {
      await supabase.from("evolution_discharges").insert(
        payload.discharges.map((item) => ({
          evolution_id: evolutionId,
          discharge_type: item.dischargeType,
        })),
      );
    }

    return this.getById(evolutionId);
  }

  async update(id: string, payload: UpdateEvolutionPayload): Promise<MedicalEvolution> {
    const evolutionData = EvolutionMapper.toDatabase(payload as Partial<MedicalEvolution>);
    const updateData = Object.fromEntries(
      Object.entries(evolutionData).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from("medical_evolutions").update(updateData).eq("id", id);
      if (error) throw new Error(`Error updating evolution: ${error.message}`);
    }

    if (payload.systemsReview) {
      await supabase.from("evolution_systems_review").delete().eq("evolution_id", id);
      if (payload.systemsReview.length > 0) {
        await supabase.from("evolution_systems_review").insert(
          payload.systemsReview.map((item) => ({
            evolution_id: id,
            condition: item.condition,
            description: item.description,
          })),
        );
      }
    }

    if (payload.physicalExams) {
      await supabase.from("evolution_physical_exams").delete().eq("evolution_id", id);
      if (payload.physicalExams.length > 0) {
        await supabase.from("evolution_physical_exams").insert(
          payload.physicalExams.map((item) => ({
            evolution_id: id,
            region: item.region,
            has_pathology: item.hasPathology,
            description: item.description,
          })),
        );
      }
    }

    if (payload.injuries) {
      await supabase.from("evolution_injuries").delete().eq("evolution_id", id);
      if (payload.injuries.length > 0) {
        await supabase
          .from("evolution_injuries")
          .insert(
            payload.injuries.map((item) => ({ evolution_id: id, injury_type: item.injuryType })),
          );
      }
    }

    if (payload.diagnoses) {
      await supabase.from("evolution_diagnoses").delete().eq("evolution_id", id);
      if (payload.diagnoses.length > 0) {
        await supabase.from("evolution_diagnoses").insert(
          payload.diagnoses.map((item) => ({
            evolution_id: id,
            cie10_id: item.cie10Id,
            type: item.type,
            certainty: item.certainty,
            description: item.description,
          })),
        );
      }
    }

    if (payload.discharges) {
      await supabase.from("evolution_discharges").delete().eq("evolution_id", id);
      if (payload.discharges.length > 0) {
        await supabase.from("evolution_discharges").insert(
          payload.discharges.map((item) => ({
            evolution_id: id,
            discharge_type: item.dischargeType,
          })),
        );
      }
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
        evolution_discharges(*)
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
      query = query.gte("updated_at", `${filters.startDate}T00:00:00Z`);
    }

    if (filters?.endDate) {
      query = query.lte("updated_at", `${filters.endDate}T23:59:59Z`);
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
