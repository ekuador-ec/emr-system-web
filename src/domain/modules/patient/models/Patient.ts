import type {
  GenderEnum,
  BloodTypeEnum,
  MaritalStatusEnum,
  CulturalGroupEnum,
  EducationLevelEnum,
  InformationSourceEnum,
  KinshipEnum,
  AntecedentTypeEnum,
  HealthInsuranceTypeEnum,
  CatalogItem,
  GeographicLocation,
  Cie10Pathology,
} from '@/domain/modules/catalog/models/Catalog';

export interface Patient {
  id: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;

  idNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  email: string | null;
  phone: string | null;
  bloodType: BloodTypeEnum | null;

  birthDate: string;
  birthPlace: string | null;
  gender: GenderEnum;
  nationality: string | null;
  culturalGroup: CulturalGroupEnum | null;
  culturalGroupOther: string | null;
  maritalStatus: MaritalStatusEnum | null;
  educationLevel: EducationLevelEnum | null;
  occupationId: string | null;
  occupation?: CatalogItem;
  currentlyWorks: boolean;
  healthInsurance: HealthInsuranceTypeEnum | null;

  companyName: string | null;
  companyPosition: string | null;
  companyPhone: string | null;
  companyAddress: string | null;

  homeAddress: string;
  neighborhood: string | null;
  geographicLocationId: string | null;
  geographicLocation?: GeographicLocation;

  infoSourceType: InformationSourceEnum;
  infoSourceOther: string | null;
  infoSourceName: string | null;
  infoSourcePhone: string | null;
  infoSourceObservations: string | null;

  emergencyContacts?: PatientEmergencyContact[];
  clinicalAntecedents?: PatientClinicalAntecedent[];
}

export interface PatientEmergencyContact {
  id: string;
  patientId: string;
  name: string;
  kinship: KinshipEnum;
  kinshipOther: string | null;
  phone: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientClinicalAntecedent {
  id: string;
  patientId: string;
  antecedentType: AntecedentTypeEnum;
  pathologyId: string | null;
  pathology?: Cie10Pathology;
  description: string | null;
  diagnosisDate: string | null;
  treatment: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs for creating and updating
export type CreatePatientDTO = Omit<
  Patient,
  'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'isActive' | 'occupation' | 'geographicLocation' | 'emergencyContacts' | 'clinicalAntecedents'
> & {
  emergencyContacts?: Omit<PatientEmergencyContact, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>[];
  clinicalAntecedents?: Omit<PatientClinicalAntecedent, 'id' | 'patientId' | 'isActive' | 'createdAt' | 'updatedAt'>[];
};

export type UpdatePatientDTO = Partial<Omit<CreatePatientDTO, 'idNumber' | 'emergencyContacts' | 'clinicalAntecedents'>> & {
  isActive?: boolean;
  emergencyContacts?: (Omit<PatientEmergencyContact, 'id' | 'patientId' | 'createdAt' | 'updatedAt'> & { id?: string })[];
  clinicalAntecedents?: (Omit<PatientClinicalAntecedent, 'id' | 'patientId' | 'isActive' | 'createdAt' | 'updatedAt'> & { id?: string })[];
};

// Optimized model for list views (Tables, search results)
export interface PatientListItem {
  id: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  secondLastName: string | null;
  email: string | null;
  phone: string | null;
  bloodType: BloodTypeEnum | null;
  isActive: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

