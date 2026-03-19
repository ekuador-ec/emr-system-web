import type { PatientRepository } from '@/domain/modules/patient/repositories/PatientRepository';
import type { Patient } from '@/domain/modules/patient/models/Patient';

export class GetPatientByIdNumberUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(idNumber: string): Promise<Patient | null> {
    return this.patientRepository.getPatientByIdNumber(idNumber);
  }
}
