import type {
  CreatePrescriptionPayload,
  MedicalPrescription,
  PrescriptionDocumentCount,
  UpdatePrescriptionPayload,
} from "@/domain/modules/prescription/models/MedicalPrescription";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

export interface PrescriptionRepository {
  create(payload: CreatePrescriptionPayload): Promise<MedicalPrescription>;
  update(id: string, payload: UpdatePrescriptionPayload): Promise<MedicalPrescription>;
  getById(id: string): Promise<MedicalPrescription>;
  listByDocument(
    sourceDocumentType: DocumentType,
    sourceDocumentId: string,
  ): Promise<MedicalPrescription[]>;
  getCountsByMedicalRecord(medicalRecordId: string): Promise<PrescriptionDocumentCount[]>;
  emit(id: string): Promise<MedicalPrescription>;
  delete(id: string): Promise<void>;
}
