import type { Catalog, CatalogItem, Cie10SearchResult, GeographicLocation } from '@/domain/modules/catalog/models/Catalog';

export interface CatalogRepository {
  getCatalogs(): Promise<Catalog[]>;
  getCatalogItems(catalogId: string): Promise<CatalogItem[]>;
  getCatalogItemsByCatalogName(catalogName: string): Promise<CatalogItem[]>;
  searchCie10Pathologies(query: string, limit?: number): Promise<Cie10SearchResult[]>;
  searchGeographicLocations(query: string): Promise<GeographicLocation[]>;
}
