import type { EvolutionRepository } from '@/domain/modules/evolution/repositories/EvolutionRepository';
import type { MedicalEvolution, UpdateEvolutionPayload } from '@/domain/modules/evolution/models/Evolution';

export class UpdateEvolutionUseCase {
  private readonly evolutionRepository: EvolutionRepository;

  constructor(evolutionRepository: EvolutionRepository) {
    this.evolutionRepository = evolutionRepository;
  }

  async execute(id: string, payload: UpdateEvolutionPayload): Promise<MedicalEvolution> {
    return this.evolutionRepository.update(id, payload);
  }
}
