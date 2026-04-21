import type {
  Patient,
  PatientListItem,
  PaginatedResult,
  CreatePatientDTO,
  UpdatePatientDTO,
} from '@/domain/modules/patient/models/Patient';

import type { GenderEnum } from '@/domain/modules/catalog/models/Catalog';

export interface PatientFilters {
  search?: string; // Generic legacy fallback search
  idNumber?: string;
  firstName?: string;
  lastName?: string;
  gender?: GenderEnum;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PatientRepository {
  getPatients(filters?: PatientFilters): Promise<PaginatedResult<PatientListItem>>;
  getPatientById(id: string): Promise<Patient | null>;
  getPatientByIdNumber(idNumber: string): Promise<Patient | null>;
  createPatient(patient: CreatePatientDTO): Promise<Patient>;
  updatePatient(id: string, patient: UpdatePatientDTO): Promise<Patient>;
  togglePatientStatus(id: string, isActive: boolean): Promise<void>;
}
