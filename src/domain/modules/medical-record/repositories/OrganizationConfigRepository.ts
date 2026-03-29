import type { OrganizationConfig } from '../models/OrganizationConfig';

export interface OrganizationConfigRepository {
  get(): Promise<OrganizationConfig | null>;
  update(config: Partial<OrganizationConfig>): Promise<OrganizationConfig>;
}
