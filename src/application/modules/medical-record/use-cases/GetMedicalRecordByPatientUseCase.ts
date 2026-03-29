import type { MedicalRecordRepository } from '@/domain/modules/medical-record/repositories/MedicalRecordRepository';
import type { MedicalRecord } from '@/domain/modules/medical-record/models/MedicalRecord';

export class GetMedicalRecordByPatientUseCase {
  private readonly repository: MedicalRecordRepository;

  constructor(repository: MedicalRecordRepository) {
    this.repository = repository;
  }

  async execute(patientId: string): Promise<MedicalRecord | null> {
    return this.repository.getByPatientId(patientId);
  }
}
