import type { OrganizationConfigRepository } from '@/domain/modules/medical-record/repositories/OrganizationConfigRepository';
import type { OrganizationConfig } from '@/domain/modules/medical-record/models/OrganizationConfig';

export class UpdateOrganizationConfigUseCase {
  private readonly repository: OrganizationConfigRepository;

  constructor(repository: OrganizationConfigRepository) {
    this.repository = repository;
  }

  async execute(config: Partial<OrganizationConfig>): Promise<OrganizationConfig> {
    return this.repository.update(config);
  }
}
