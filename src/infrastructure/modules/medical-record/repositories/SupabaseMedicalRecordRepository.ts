import type { MedicalRecordRepository } from '@/domain/modules/medical-record/repositories/MedicalRecordRepository';
import type { MedicalRecord, MedicalRecordListItem, PaginatedResult, MedicalRecordFilters } from '@/domain/modules/medical-record/models/MedicalRecord';
import { supabase } from '@/infrastructure/core/supabaseClient';
import { MedicalRecordMapper } from '../mappers/MedicalRecordMapper';

export class SupabaseMedicalRecordRepository implements MedicalRecordRepository {
  async getMedicalRecords(filters?: MedicalRecordFilters): Promise<PaginatedResult<MedicalRecordListItem>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('medical_records')
      .select(`
        id,
        patient_id,
        is_active,
        created_at,
        updated_at,
        patient:patients!inner(
          first_name,
          last_name,
          second_last_name,
          id_number
        ),
        creator:profiles!medical_records_created_by_fkey(
          first_name,
          last_name
        ),
        updater:profiles!medical_records_updated_by_fkey(
          first_name,
          last_name
        )
      `, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      const search = filters.search;
      query = query.or(`id_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`, { foreignTable: 'patients' });
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const records: MedicalRecordListItem[] = (data as any[]).map((row) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: `${row.patient.first_name} ${row.patient.last_name} ${row.patient.second_last_name || ''}`.trim(),
      patientIdNumber: row.patient.id_number,
      isActive: row.is_active,
      evolutionCount: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdByName: row.creator
        ? `${row.creator.first_name} ${row.creator.last_name}`.trim()
        : null,
      updatedByName: row.updater
        ? `${row.updater.first_name} ${row.updater.last_name}`.trim()
        : null,
    }));

    return {
      data: records,
      total: count || 0,
      page,
      limit,
    };
  }

  async getByPatientId(patientId: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients(
          first_name,
          last_name,
          second_last_name,
          id_number,
          gender,
          blood_type
        ),
        creator:profiles!medical_records_created_by_fkey(
          first_name,
          last_name
        ),
        updater:profiles!medical_records_updated_by_fkey(
          first_name,
          last_name
        )
      `)
      .eq('patient_id', patientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return MedicalRecordMapper.toDomain(data, 0);
  }

  async create(patientId: string): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .insert({ patient_id: patientId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return MedicalRecordMapper.toDomain(data, 0);
  }

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('medical_records')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
