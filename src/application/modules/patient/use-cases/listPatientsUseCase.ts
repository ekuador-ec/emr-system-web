import type { PatientRepository, PatientFilters } from '@/domain/modules/patient/repositories/PatientRepository';
import type { PatientListItem, PaginatedResult } from '@/domain/modules/patient/models/Patient';

export class ListPatientsUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(filters?: PatientFilters): Promise<PaginatedResult<PatientListItem>> {
    return this.patientRepository.getPatients(filters);
  }
}
