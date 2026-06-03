import { useQuery } from "@tanstack/react-query";
import { ListClinicalDocumentsUseCase } from "@/application/modules/document/use-cases/ListClinicalDocumentsUseCase";
import { SupabaseClinicalDocumentRepository } from "@/infrastructure/modules/document/repositories/SupabaseClinicalDocumentRepository";
import type { DocumentFilters } from "@/domain/modules/document/models/ClinicalDocument";

const clinicalDocumentRepository = new SupabaseClinicalDocumentRepository();
const listClinicalDocumentsUseCase = new ListClinicalDocumentsUseCase(clinicalDocumentRepository);

export const clinicalDocumentKeys = {
  all: ["clinical-documents"] as const,
  lists: () => [...clinicalDocumentKeys.all, "list"] as const,
  list: (filters?: DocumentFilters) => [...clinicalDocumentKeys.lists(), filters] as const,
};

export function useClinicalDocuments(filters?: DocumentFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: clinicalDocumentKeys.list(filters),
    queryFn: () => listClinicalDocumentsUseCase.execute(filters),
    enabled: options?.enabled !== false,
  });
}
