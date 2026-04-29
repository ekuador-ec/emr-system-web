import type { Patient } from "@/domain/modules/patient/models/Patient";

export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;

  createdByName: string | null;
  updatedByName: string | null;
  patientName: string | null;
  patientIdNumber: string | null;
  patientGender: string | null;
  patientBloodType: string | null;

  evolutionCount: number;
}

export interface MedicalRecordListItem {
  id: string;
  patientId: string;
  patientName: string;
  patientIdNumber: string;
  isActive: boolean;
  evolutionCount: number;
  createdAt: string;
  updatedAt: string;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MedicalRecordFilters {
  search?: string; // Search by patient name or ID
  isActive?: boolean;
  startDate?: string; // ISO Date (YYYY-MM-DD)
  endDate?: string; // ISO Date (YYYY-MM-DD)
  page?: number;
  limit?: number;
}
