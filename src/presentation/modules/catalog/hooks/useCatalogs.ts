import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { SupabaseCatalogRepository } from '@/infrastructure/modules/catalog/repositories/SupabaseCatalogRepository';
import {
  ListCatalogsUseCase,
  ListCatalogItemsUseCase,
  SearchCie10PathologiesUseCase,
  SearchGeographicLocationsUseCase,
} from '@/application/modules/catalog/use-cases/catalogUseCases';

const repository = new SupabaseCatalogRepository();

const listCatalogsUseCase = new ListCatalogsUseCase(repository);
const listCatalogItemsUseCase = new ListCatalogItemsUseCase(repository);
const searchCie10PathologiesUseCase = new SearchCie10PathologiesUseCase(repository);
const searchGeographicLocationsUseCase = new SearchGeographicLocationsUseCase(repository);

export const catalogKeys = {
  all: ['catalogs'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
  items: (catalogId: string) => [...catalogKeys.all, 'items', catalogId] as const,
  cie10: (query: string) => [...catalogKeys.all, 'cie10', query] as const,
  geographicLocations: (query: string) => [...catalogKeys.all, 'geographicLocations', query] as const,
};

export const useCatalogs = () => {
  return useQuery({
    queryKey: catalogKeys.lists(),
    queryFn: () => listCatalogsUseCase.execute(),
  });
};

export const useCatalogItems = (catalogId: string) => {
  return useQuery({
    queryKey: catalogKeys.items(catalogId),
    queryFn: () => listCatalogItemsUseCase.execute(catalogId),
    enabled: !!catalogId,
  });
};


export const useSearchCie10Pathologies = (query: string) => {
  return useQuery({
    queryKey: catalogKeys.cie10(query),
    queryFn: () => searchCie10PathologiesUseCase.execute(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes (static data)
    gcTime: 1000 * 60 * 30, // 30 minutes
    placeholderData: keepPreviousData,
  });
};

export const useSearchGeographicLocations = (query: string) => {
  return useQuery({
    queryKey: catalogKeys.geographicLocations(query),
    queryFn: () => searchGeographicLocationsUseCase.execute(query),
    enabled: query.length >= 3,
  });
};
