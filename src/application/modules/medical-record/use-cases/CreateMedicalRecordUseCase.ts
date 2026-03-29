import type { MedicalRecordRepository } from '@/domain/modules/medical-record/repositories/MedicalRecordRepository';
import type { MedicalRecord } from '@/domain/modules/medical-record/models/MedicalRecord';

export class CreateMedicalRecordUseCase {
  private readonly repository: MedicalRecordRepository;

  constructor(repository: MedicalRecordRepository) {
    this.repository = repository;
  }

  async execute(patientId: string): Promise<MedicalRecord> {
    return this.repository.create(patientId);
  }
}
