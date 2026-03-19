import type {
  Patient,
  PatientListItem,
  PaginatedResult,
  CreatePatientDTO,
  UpdatePatientDTO,
} from '@/domain/modules/patient/models/Patient';

export interface PatientFilters {
  search?: string; // Search by ID number, names
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
