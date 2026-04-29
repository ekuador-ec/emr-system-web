import type { MedicalRecordRepository } from "@/domain/modules/medical-record/repositories/MedicalRecordRepository";
import type {
  MedicalRecordListItem,
  PaginatedResult,
  MedicalRecordFilters,
} from "@/domain/modules/medical-record/models/MedicalRecord";

export class ListMedicalRecordsUseCase {
  private readonly repository: MedicalRecordRepository;

  constructor(repository: MedicalRecordRepository) {
    this.repository = repository;
  }

  async execute(filters?: MedicalRecordFilters): Promise<PaginatedResult<MedicalRecordListItem>> {
    if (filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 31) {
        throw new Error("El rango de búsqueda por fecha de edición no puede ser mayor a 31 días.");
      }
    }

    return this.repository.getMedicalRecords(filters);
  }
}
