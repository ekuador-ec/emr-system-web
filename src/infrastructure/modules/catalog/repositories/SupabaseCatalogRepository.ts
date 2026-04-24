import type { CatalogRepository } from '@/domain/modules/catalog/repositories/CatalogRepository';
import type {
  Catalog,
  CatalogItem,
  Cie10SearchResult,
  GeographicLocation,
} from '@/domain/modules/catalog/models/Catalog';
import { supabase } from '@/infrastructure/core/supabaseClient';
import {
  mapCatalogRow,
  mapCatalogItemRow,
  mapGeographicLocationRow,
  mapCie10SearchResultRow,
} from '@/infrastructure/modules/catalog/mappers/catalogMapper';
import type {
  CatalogRow,
  CatalogItemRow,
  Cie10SearchResultRow,
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

  async searchCie10Pathologies(query: string, limit: number = 20): Promise<Cie10SearchResult[]> {
    const { data, error } = await supabase.rpc('search_cie10', {
      query: query,
      result_limit: limit,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (data as Cie10SearchResultRow[]).map(mapCie10SearchResultRow);
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
