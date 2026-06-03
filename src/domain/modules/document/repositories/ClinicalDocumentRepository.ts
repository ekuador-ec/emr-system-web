import type {
  ClinicalDocumentListItem,
  DocumentFilters,
  PaginatedResult,
} from "@/domain/modules/document/models/ClinicalDocument";

export interface ClinicalDocumentRepository {
  list(filters?: DocumentFilters): Promise<PaginatedResult<ClinicalDocumentListItem>>;
}
