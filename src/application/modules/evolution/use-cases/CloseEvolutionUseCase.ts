import type { EvolutionRepository } from '@/domain/modules/evolution/repositories/EvolutionRepository';
import type { MedicalEvolution } from '@/domain/modules/evolution/models/Evolution';
import type { UserRole } from '@/domain/modules/users/models/User';

const ROLES_ALLOWED_TO_CLOSE: ReadonlyArray<UserRole> = ['doctor', 'admin'];

export class CloseEvolutionUseCase {
  private readonly evolutionRepository: EvolutionRepository;

  constructor(evolutionRepository: EvolutionRepository) {
    this.evolutionRepository = evolutionRepository;
  }

  async execute(id: string, actorRole: UserRole | undefined): Promise<MedicalEvolution> {
    if (!actorRole || !ROLES_ALLOWED_TO_CLOSE.includes(actorRole)) {
      throw new Error('Solo personal médico o administradores pueden firmar y cerrar una evolución.');
    }

    return this.evolutionRepository.close(id);
  }
}
