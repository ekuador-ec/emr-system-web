import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

export type PrescriptionStatus = "BORRADOR" | "EMITIDA";

export interface PrescriptionDiagnosis {
  id?: string;
  cie10Id: string | null;
  cie10Code: string;
  cie10Description: string;
  displayOrder: number;
}

export interface MedicalPrescription {
  id: string;
  medicalRecordId: string;
  sourceDocumentType: DocumentType;
  sourceDocumentId: string;
  status: PrescriptionStatus;
  issueDate: string;
  validityDate: string | null;
  allergies: string | null;
  rpText: string | null;
  indicationsText: string | null;
  prescriptionNumber: string | null;
  diagnoses: PrescriptionDiagnosis[];
  createdBy: string | null;
  createdByName?: string | null;
  createdBySpecialty?: string | null;
  createdByProfessionalCode?: string | null;
  emittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionDiagnosisInput {
  cie10Id: string | null;
  cie10Code: string;
  cie10Description: string;
}

export interface PrescriptionDocumentCount {
  sourceDocumentType: DocumentType;
  sourceDocumentId: string;
  count: number;
}

export interface CreatePrescriptionPayload {
  medicalRecordId: string;
  sourceDocumentType: DocumentType;
  sourceDocumentId: string;
  issueDate?: string;
  validityDate?: string | null;
  allergies?: string | null;
  rpText?: string | null;
  indicationsText?: string | null;
  diagnoses?: PrescriptionDiagnosisInput[];
}

export interface UpdatePrescriptionPayload {
  issueDate?: string;
  validityDate?: string | null;
  allergies?: string | null;
  rpText?: string | null;
  indicationsText?: string | null;
  diagnoses?: PrescriptionDiagnosisInput[];
}
