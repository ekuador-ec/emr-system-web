import type { PatientRepository } from '@/domain/modules/patient/repositories/PatientRepository';
import type { CreatePatientDTO, Patient } from '@/domain/modules/patient/models/Patient';

export class CreatePatientUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(data: CreatePatientDTO): Promise<Patient> {
    const existingPatient = await this.patientRepository.getPatientByIdNumber(data.idNumber);
    if (existingPatient) {
      throw new Error(`Patient with ID number ${data.idNumber} already exists`);
    }
    return this.patientRepository.createPatient(data);
  }
}
