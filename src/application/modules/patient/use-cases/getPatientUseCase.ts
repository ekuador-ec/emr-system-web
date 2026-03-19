import type { PatientRepository } from '@/domain/modules/patient/repositories/PatientRepository';
import type { Patient } from '@/domain/modules/patient/models/Patient';

export class GetPatientUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id: string): Promise<Patient> {
    const patient = await this.patientRepository.getPatientById(id);
    if (!patient) {
      throw new Error(`Patient with id ${id} not found`);
    }
    return patient;
  }
}
