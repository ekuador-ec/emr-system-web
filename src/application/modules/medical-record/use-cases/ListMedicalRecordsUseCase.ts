import type { MedicalRecordRepository } from '@/domain/modules/medical-record/repositories/MedicalRecordRepository';
import type { MedicalRecordListItem, PaginatedResult, MedicalRecordFilters } from '@/domain/modules/medical-record/models/MedicalRecord';

export class ListMedicalRecordsUseCase {
  private readonly repository: MedicalRecordRepository;

  constructor(repository: MedicalRecordRepository) {
    this.repository = repository;
  }

  async execute(filters?: MedicalRecordFilters): Promise<PaginatedResult<MedicalRecordListItem>> {
    return this.repository.getMedicalRecords(filters);
  }
}
