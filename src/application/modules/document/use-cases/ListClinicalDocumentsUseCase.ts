import type { ClinicalDocumentRepository } from "@/domain/modules/document/repositories/ClinicalDocumentRepository";
import type {
  ClinicalDocumentListItem,
  DocumentFilters,
  PaginatedResult,
} from "@/domain/modules/document/models/ClinicalDocument";

const MAX_RANGE_DAYS = 31;

export class ListClinicalDocumentsUseCase {
  private readonly clinicalDocumentRepository: ClinicalDocumentRepository;

  constructor(clinicalDocumentRepository: ClinicalDocumentRepository) {
    this.clinicalDocumentRepository = clinicalDocumentRepository;
  }

  async execute(filters?: DocumentFilters): Promise<PaginatedResult<ClinicalDocumentListItem>> {
    const search = filters?.search?.trim();

    if (!search && filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > MAX_RANGE_DAYS) {
        throw new Error("Sin término de búsqueda, el rango máximo permitido es de 31 días.");
      }
    }

    return this.clinicalDocumentRepository.list(filters);
  }
}
