import type { EvolutionRepository } from '@/domain/modules/evolution/repositories/EvolutionRepository';
import type { MedicalEvolution } from '@/domain/modules/evolution/models/Evolution';

export class CloseEvolutionUseCase {
  private readonly evolutionRepository: EvolutionRepository;

  constructor(evolutionRepository: EvolutionRepository) {
    this.evolutionRepository = evolutionRepository;
  }

  async execute(id: string): Promise<MedicalEvolution> {
    return this.evolutionRepository.close(id);
  }
}
