import type { MedicalRecord, MedicalRecordListItem, PaginatedResult, MedicalRecordFilters } from '../models/MedicalRecord';

export interface MedicalRecordRepository {
  getMedicalRecords(filters?: MedicalRecordFilters): Promise<PaginatedResult<MedicalRecordListItem>>;
  getByPatientId(patientId: string): Promise<MedicalRecord | null>;
  create(patientId: string): Promise<MedicalRecord>;
  updateStatus(id: string, isActive: boolean): Promise<void>;
}
