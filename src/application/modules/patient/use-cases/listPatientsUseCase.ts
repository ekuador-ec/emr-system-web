import type { PatientRepository, PatientFilters } from '@/domain/modules/patient/repositories/PatientRepository';
import type { PatientListItem, PaginatedResult } from '@/domain/modules/patient/models/Patient';

export class ListPatientsUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(filters?: PatientFilters): Promise<PaginatedResult<PatientListItem>> {
    if (filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      if (start > end) {
        throw new Error('La fecha inicial no puede ser mayor que la fecha final.');
      }

      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 31) {
        throw new Error('El rango de búsqueda por fecha de registro no puede ser mayor a 31 días.');
      }
    }

    return this.patientRepository.getPatients(filters);
  }
}
