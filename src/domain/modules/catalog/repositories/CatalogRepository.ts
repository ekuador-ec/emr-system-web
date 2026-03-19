import type { Catalog, CatalogItem, Cie10Pathology, GeographicLocation } from '@/domain/modules/catalog/models/Catalog';

export interface CatalogRepository {
  getCatalogs(): Promise<Catalog[]>;
  getCatalogItems(catalogId: string): Promise<CatalogItem[]>;
  getCatalogItemsByCatalogName(catalogName: string): Promise<CatalogItem[]>;
  searchCie10Pathologies(query: string): Promise<Cie10Pathology[]>;
  searchGeographicLocations(query: string): Promise<GeographicLocation[]>;
}
