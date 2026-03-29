import type { OrganizationConfigRepository } from '@/domain/modules/medical-record/repositories/OrganizationConfigRepository';
import type { OrganizationConfig } from '@/domain/modules/medical-record/models/OrganizationConfig';

export class GetOrganizationConfigUseCase {
  private readonly repository: OrganizationConfigRepository;

  constructor(repository: OrganizationConfigRepository) {
    this.repository = repository;
  }

  async execute(): Promise<OrganizationConfig | null> {
    return this.repository.get();
  }
}
