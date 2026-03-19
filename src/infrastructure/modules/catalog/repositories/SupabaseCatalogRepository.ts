import type { CatalogRepository } from '@/domain/modules/catalog/repositories/CatalogRepository';
import type {
  Catalog,
  CatalogItem,
  Cie10Pathology,
  GeographicLocation,
} from '@/domain/modules/catalog/models/Catalog';
import { supabase } from '@/infrastructure/core/supabaseClient';
import {
  mapCatalogRow,
  mapCatalogItemRow,
  mapCie10PathologyRow,
  mapGeographicLocationRow,
} from '@/infrastructure/modules/catalog/mappers/catalogMapper';
import type {
  CatalogRow,
  CatalogItemRow,
  Cie10PathologyRow,
  GeographicLocationRow,
} from '@/infrastructure/modules/catalog/mappers/catalogMapper';

export class SupabaseCatalogRepository implements CatalogRepository {
  async getCatalogs(): Promise<Catalog[]> {
    const { data, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return (data as CatalogRow[]).map(mapCatalogRow);
  }

  async getCatalogItems(catalogId: string): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('*')
      .eq('catalog_id', catalogId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return (data as CatalogItemRow[]).map(mapCatalogItemRow);
  }

  async getCatalogItemsByCatalogName(catalogName: string): Promise<CatalogItem[]> {
    const { data: catalog, error: catalogError } = await supabase
      .from('catalogs')
      .select('id')
      .eq('name', catalogName)
      .eq('is_active', true)
      .single();

    if (catalogError || !catalog) {
      throw new Error(catalogError?.message || `Catalog ${catalogName} not found`);
    }

    return this.getCatalogItems(catalog.id);
  }

  async searchCie10Pathologies(query: string): Promise<Cie10Pathology[]> {
    const { data, error } = await supabase
      .from('cie10_pathologies')
      .select('*')
      .eq('is_active', true)
      .or(`code.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    return (data as Cie10PathologyRow[]).map(mapCie10PathologyRow);
  }

  async searchGeographicLocations(query: string): Promise<GeographicLocation[]> {
    const { data, error } = await supabase
      .from('geographic_locations')
      .select('*')
      .eq('is_active', true)
      .or(`dpa_code.ilike.%${query}%,province.ilike.%${query}%,canton.ilike.%${query}%,parish.ilike.%${query}%`)
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    return (data as GeographicLocationRow[]).map(mapGeographicLocationRow);
  }
}
