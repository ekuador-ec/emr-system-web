import type { MedicalRecordRepository } from '@/domain/modules/medical-record/repositories/MedicalRecordRepository';

export class UpdateMedicalRecordStatusUseCase {
  private readonly repository: MedicalRecordRepository;

  constructor(repository: MedicalRecordRepository) {
    this.repository = repository;
  }

  async execute(id: string, isActive: boolean): Promise<void> {
    return this.repository.updateStatus(id, isActive);
  }
}
