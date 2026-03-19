import type { CatalogRepository } from '@/domain/modules/catalog/repositories/CatalogRepository';
import type { Catalog, CatalogItem, Cie10Pathology, GeographicLocation } from '@/domain/modules/catalog/models/Catalog';

export class ListCatalogsUseCase {
  catalogRepository: CatalogRepository;

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  async execute(): Promise<Catalog[]> {
    return this.catalogRepository.getCatalogs();
  }
}

export class ListCatalogItemsUseCase {
  catalogRepository: CatalogRepository;

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  async execute(catalogId: string): Promise<CatalogItem[]> {
    return this.catalogRepository.getCatalogItems(catalogId);
  }
}

export class SearchCie10PathologiesUseCase {
  catalogRepository: CatalogRepository;

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  async execute(query: string): Promise<Cie10Pathology[]> {
    if (!query || query.length < 2) return [];
    return this.catalogRepository.searchCie10Pathologies(query);
  }
}

export class SearchGeographicLocationsUseCase {
  catalogRepository: CatalogRepository;

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  async execute(query: string): Promise<GeographicLocation[]> {
    if (!query || query.length < 3) return [];
    return this.catalogRepository.searchGeographicLocations(query);
  }
}
