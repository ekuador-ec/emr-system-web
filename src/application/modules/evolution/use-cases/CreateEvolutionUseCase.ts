import type { EvolutionRepository } from '@/domain/modules/evolution/repositories/EvolutionRepository';
import type { CreateEvolutionPayload, MedicalEvolution } from '@/domain/modules/evolution/models/Evolution';

export class CreateEvolutionUseCase {
  private readonly evolutionRepository: EvolutionRepository;

  constructor(evolutionRepository: EvolutionRepository) {
    this.evolutionRepository = evolutionRepository;
  }

  async execute(payload: CreateEvolutionPayload): Promise<MedicalEvolution> {
    return this.evolutionRepository.create(payload);
  }
}
