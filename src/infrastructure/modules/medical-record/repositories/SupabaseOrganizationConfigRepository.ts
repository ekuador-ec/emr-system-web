import type { OrganizationConfigRepository } from '@/domain/modules/medical-record/repositories/OrganizationConfigRepository';
import type { OrganizationConfig } from '@/domain/modules/medical-record/models/OrganizationConfig';
import { supabase } from '@/infrastructure/core/supabaseClient';
import { OrganizationConfigMapper } from '../mappers/OrganizationConfigMapper';

export class SupabaseOrganizationConfigRepository implements OrganizationConfigRepository {
  async get(): Promise<OrganizationConfig | null> {
    const { data, error } = await supabase
      .from('organization_config')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }

    return OrganizationConfigMapper.toDomain(data);
  }

  async update(config: Partial<OrganizationConfig>): Promise<OrganizationConfig> {
    const updateData = OrganizationConfigMapper.toPersistence(config);
    
    // Get ID first
    const { data: current } = await supabase.from('organization_config').select('id').limit(1).single();
    if (!current) throw new Error("Organization config not found");

    const { data, error } = await supabase
      .from('organization_config')
      .update(updateData)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return OrganizationConfigMapper.toDomain(data);
  }
}
