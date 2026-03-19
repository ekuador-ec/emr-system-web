import type { PatientRepository } from '@/domain/modules/patient/repositories/PatientRepository';
import type { UpdatePatientDTO, Patient } from '@/domain/modules/patient/models/Patient';

export class UpdatePatientUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const existingPatient = await this.patientRepository.getPatientById(id);
    if (!existingPatient) {
      throw new Error(`Patient with id ${id} not found`);
    }
    return this.patientRepository.updatePatient(id, data);
  }
}
