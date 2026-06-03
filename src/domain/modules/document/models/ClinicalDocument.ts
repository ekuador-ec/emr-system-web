import type { UserRole } from "@/domain/modules/users/models/User";

export type DocumentType = "FORM_008" | "FORM_005";
export type DocumentStatus = "ABIERTA" | "EN_PROCESO" | "CERRADA";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ClinicalDocumentListItem {
  id: string;
  documentType: DocumentType;
  medicalRecordId: string;
  patientId: string;
  patientName: string;
  patientIdNumber: string;
  status: DocumentStatus;
  attentionDate: string | null;
  attentionTime: string | null;
  openedByName: string | null;
  openedByRole: UserRole | null;
  closedByName: string | null;
  closedByRole: UserRole | null;
  closedAt: string | null;
  updatedByName: string | null;
  updatedByRole: UserRole | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  page?: number;
  limit?: number;
}
