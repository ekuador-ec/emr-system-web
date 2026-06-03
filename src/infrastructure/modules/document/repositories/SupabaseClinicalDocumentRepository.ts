import type { ClinicalDocumentRepository } from "@/domain/modules/document/repositories/ClinicalDocumentRepository";
import type {
  ClinicalDocumentListItem,
  DocumentFilters,
  DocumentStatus,
  DocumentType,
  PaginatedResult,
} from "@/domain/modules/document/models/ClinicalDocument";
import type { UserRole } from "@/domain/modules/users/models/User";
import { supabase } from "@/infrastructure/core/supabaseClient";
import { endOfLocalDayIso, startOfLocalDayIso } from "@/infrastructure/core/dateBoundaries";

interface ClinicalDocumentListRow {
  id: string;
  document_type: DocumentType;
  medical_record_id: string;
  patient_id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_second_last_name: string | null;
  patient_id_number: string;
  status: DocumentStatus;
  attention_date: string | null;
  attention_time: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  opened_by_name: string | null;
  opened_by_role: UserRole | null;
  closed_by_name: string | null;
  closed_by_role: UserRole | null;
  updated_by_name: string | null;
  updated_by_role: UserRole | null;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-fA-F-]{36}$/.test(value);
}

function buildFullName(firstName: string, lastName: string, secondLastName?: string | null): string {
  return `${firstName} ${lastName} ${secondLastName ?? ""}`.trim();
}

export class SupabaseClinicalDocumentRepository implements ClinicalDocumentRepository {
  async list(filters?: DocumentFilters): Promise<PaginatedResult<ClinicalDocumentListItem>> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const search = filters?.search?.trim();

    let query = supabase
      .from("clinical_documents_list_view")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filters?.documentType) {
      query = query.eq("document_type", filters.documentType);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (search) {
      if (isUuidLike(search)) {
        query = query.eq("medical_record_id", search);
      } else {
        const term = `%${search}%`;
        query = query.or(
          `patient_first_name.ilike.${term},patient_last_name.ilike.${term},patient_second_last_name.ilike.${term},patient_id_number.ilike.${term}`,
        );
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
      throw new Error(`Error fetching clinical documents: ${error.message}`);
    }

    const rows = (data ?? []) as unknown as ClinicalDocumentListRow[];

    return {
      data: rows.map((row) => ({
        id: row.id,
        documentType: row.document_type,
        medicalRecordId: row.medical_record_id,
        patientId: row.patient_id,
        patientName: buildFullName(
          row.patient_first_name,
          row.patient_last_name,
          row.patient_second_last_name,
        ),
        patientIdNumber: row.patient_id_number,
        status: row.status,
        attentionDate: row.attention_date,
        attentionTime: row.attention_time,
        openedByName: row.opened_by_name,
        openedByRole: row.opened_by_role,
        closedByName: row.closed_by_name,
        closedByRole: row.closed_by_role,
        closedAt: row.closed_at,
        updatedByName: row.updated_by_name,
        updatedByRole: row.updated_by_role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      total: count ?? 0,
      page,
      limit,
    };
  }
}
