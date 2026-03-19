import type { PatientRepository } from '@/domain/modules/patient/repositories/PatientRepository';

export class TogglePatientStatusUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id: string, isActive: boolean): Promise<void> {
    const existingPatient = await this.patientRepository.getPatientById(id);
    if (!existingPatient) {
      throw new Error(`Patient with id ${id} not found`);
    }
    return this.patientRepository.togglePatientStatus(id, isActive);
  }
}
