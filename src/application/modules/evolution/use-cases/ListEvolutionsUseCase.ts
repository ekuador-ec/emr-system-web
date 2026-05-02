import type { EvolutionRepository } from "@/domain/modules/evolution/repositories/EvolutionRepository";
import type {
  EvolutionFilters,
  MedicalEvolutionListItem,
  PaginatedResult,
} from "@/domain/modules/evolution/models/Evolution";

export class ListEvolutionsUseCase {
  private readonly evolutionRepository: EvolutionRepository;

  constructor(evolutionRepository: EvolutionRepository) {
    this.evolutionRepository = evolutionRepository;
  }

  async execute(filters?: EvolutionFilters): Promise<PaginatedResult<MedicalEvolutionListItem>> {
    if (filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      if (start > end) {
        throw new Error("La fecha inicial no puede ser mayor que la fecha final.");
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 31) {
        throw new Error("El rango de búsqueda por fecha no puede ser mayor a 31 días.");
      }
    }

    return this.evolutionRepository.getEvolutions(filters);
  }
}
