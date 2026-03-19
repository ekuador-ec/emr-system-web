import type {
  Catalog,
  CatalogItem,
  Cie10Pathology,
  GeographicLocation,
} from '@/domain/modules/catalog/models/Catalog';

export interface CatalogRow {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogItemRow {
  id: string;
  catalog_id: string;
  name: string;
  description: string | null;
  code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cie10PathologyRow {
  id: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeographicLocationRow {
  id: string;
  dpa_code: string;
  province: string;
  canton: string;
  parish: string;
  is_active: boolean;
}

export const mapCatalogRow = (row: CatalogRow): Catalog => ({
  id: row.id,
  name: row.name,
  description: row.description,
  type: row.type,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapCatalogItemRow = (row: CatalogItemRow): CatalogItem => ({
  id: row.id,
  catalogId: row.catalog_id,
  name: row.name,
  description: row.description,
  code: row.code,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapCie10PathologyRow = (row: Cie10PathologyRow): Cie10Pathology => ({
  id: row.id,
  code: row.code,
  description: row.description,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapGeographicLocationRow = (row: GeographicLocationRow): GeographicLocation => ({
  id: row.id,
  dpaCode: row.dpa_code,
  province: row.province,
  canton: row.canton,
  parish: row.parish,
  isActive: row.is_active,
});
