import type {
  Patient,
  PatientListItem,
  PaginatedResult,
  CreatePatientDTO,
  UpdatePatientDTO,
} from '@/domain/modules/patient/models/Patient';

import type { GenderEnum } from '@/domain/modules/catalog/models/Catalog';

export interface PatientFilters {
  search?: string;
  idNumber?: string;
  idNumberType?: 'cedula' | 'temporal';
  firstName?: string;
  lastName?: string;
  gender?: GenderEnum;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
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
