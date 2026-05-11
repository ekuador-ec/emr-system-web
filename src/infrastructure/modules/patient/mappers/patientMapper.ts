import type {
  Patient,
  PatientListItem,
  PatientEmergencyContact,
  PatientClinicalAntecedent,
} from '@/domain/modules/patient/models/Patient';
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
} from '@/domain/modules/catalog/models/Catalog';
import { mapCatalogItemRow, mapCie10PathologyRow, mapGeographicLocationRow } from '@/infrastructure/modules/catalog/mappers/catalogMapper';
import type { CatalogItemRow, Cie10PathologyRow, GeographicLocationRow } from '@/infrastructure/modules/catalog/mappers/catalogMapper';

export interface PatientRow {
  id: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;

  id_number: string;
  id_number_type: 'cedula' | 'temporal';
  first_name: string;
  middle_name: string | null;
  last_name: string;
  second_last_name: string | null;
  email: string | null;
  phone: string | null;
  blood_type: BloodTypeEnum | null;

  birth_date: string | null;
  birth_place: string | null;
  gender: GenderEnum;
  nationality: string | null;
  cultural_group: CulturalGroupEnum | null;
  cultural_group_other: string | null;
  marital_status: MaritalStatusEnum | null;
  education_level: EducationLevelEnum | null;
  occupation_id: string | null;
  occupation?: CatalogItemRow;
  currently_works: boolean;
  health_insurance: HealthInsuranceTypeEnum | null;

  company_name: string | null;
  company_position: string | null;
  company_phone: string | null;
  company_address: string | null;

  home_address: string | null;
  neighborhood: string | null;
  geographic_location_id: string | null;
  geographic_location?: GeographicLocationRow;

  info_source_type: InformationSourceEnum | null;
  info_source_other: string | null;
  info_source_name: string | null;
  info_source_phone: string | null;
  info_source_observations: string | null;

  patient_emergency_contacts?: PatientEmergencyContactRow[];
  patient_clinical_antecedents?: PatientClinicalAntecedentRow[];
}

export interface PatientEmergencyContactRow {
  id: string;
  patient_id: string;
  name: string;
  kinship: KinshipEnum;
  kinship_other: string | null;
  phone: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientClinicalAntecedentRow {
  id: string;
  patient_id: string;
  antecedent_type: AntecedentTypeEnum;
  pathology_id: string | null;
  pathology?: Cie10PathologyRow; // from join
  description: string | null;
  diagnosis_date: string | null;
  treatment: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientListItemRow {
  id: string;
  id_number: string;
  id_number_type: 'cedula' | 'temporal';
  first_name: string;
  last_name: string;
  second_last_name: string | null;
  email: string | null;
  phone: string | null;
  blood_type: BloodTypeEnum | null;
  is_active: boolean;
}

export const mapPatientRow = (row: PatientRow): Patient => ({
  id: row.id,
  createdBy: row.created_by,
  updatedBy: row.updated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  isActive: row.is_active,

  idNumber: row.id_number,
  idNumberType: row.id_number_type,
  firstName: row.first_name,
  middleName: row.middle_name,
  lastName: row.last_name,
  secondLastName: row.second_last_name,
  email: row.email,
  phone: row.phone,
  bloodType: row.blood_type,

  birthDate: row.birth_date,
  birthPlace: row.birth_place,
  gender: row.gender,
  nationality: row.nationality,
  culturalGroup: row.cultural_group,
  culturalGroupOther: row.cultural_group_other,
  maritalStatus: row.marital_status,
  educationLevel: row.education_level,
  occupationId: row.occupation_id,
  occupation: row.occupation ? mapCatalogItemRow(row.occupation) : undefined,
  currentlyWorks: row.currently_works,
  healthInsurance: row.health_insurance,

  companyName: row.company_name,
  companyPosition: row.company_position,
  companyPhone: row.company_phone,
  companyAddress: row.company_address,

  homeAddress: row.home_address,
  neighborhood: row.neighborhood,
  geographicLocationId: row.geographic_location_id,
  geographicLocation: row.geographic_location ? mapGeographicLocationRow(row.geographic_location) : undefined,

  infoSourceType: row.info_source_type,
  infoSourceOther: row.info_source_other,
  infoSourceName: row.info_source_name,
  infoSourcePhone: row.info_source_phone,
  infoSourceObservations: row.info_source_observations,

  emergencyContacts: row.patient_emergency_contacts?.map(mapPatientEmergencyContactRow),
  clinicalAntecedents: row.patient_clinical_antecedents?.map(mapPatientClinicalAntecedentRow),
});

export const mapPatientListItemRow = (row: PatientListItemRow): PatientListItem => ({
  id: row.id,
  idNumber: row.id_number,
  idNumberType: row.id_number_type,
  firstName: row.first_name,
  lastName: row.last_name,
  secondLastName: row.second_last_name,
  email: row.email,
  phone: row.phone,
  bloodType: row.blood_type,
  isActive: row.is_active,
});

export const mapPatientEmergencyContactRow = (row: PatientEmergencyContactRow): PatientEmergencyContact => ({
  id: row.id,
  patientId: row.patient_id,
  name: row.name,
  kinship: row.kinship,
  kinshipOther: row.kinship_other,
  phone: row.phone,
  address: row.address,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapPatientClinicalAntecedentRow = (row: PatientClinicalAntecedentRow): PatientClinicalAntecedent => ({
  id: row.id,
  patientId: row.patient_id,
  antecedentType: row.antecedent_type,
  pathologyId: row.pathology_id,
  pathology: row.pathology ? mapCie10PathologyRow(row.pathology) : undefined,
  description: row.description,
  diagnosisDate: row.diagnosis_date,
  treatment: row.treatment,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
