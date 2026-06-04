import type {
  MedicalPrescription,
  PrescriptionDiagnosis,
} from "@/domain/modules/prescription/models/MedicalPrescription";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

export class PrescriptionMapper {
  static diagnosisToDomain(item: any): PrescriptionDiagnosis {
    return {
      id: item.id,
      cie10Id: item.cie10_id ?? null,
      cie10Code: item.cie10_code,
      cie10Description: item.cie10_description,
      displayOrder: item.display_order ?? 0,
    };
  }

  static toDomain(data: any): MedicalPrescription {
    const diagnoses: PrescriptionDiagnosis[] = data.medical_prescription_diagnoses
      ? [...data.medical_prescription_diagnoses]
          .map((item: any) => PrescriptionMapper.diagnosisToDomain(item))
          .sort((a, b) => a.displayOrder - b.displayOrder)
      : [];

    return {
      id: data.id,
      medicalRecordId: data.medical_record_id,
      sourceDocumentType: data.source_document_type as DocumentType,
      sourceDocumentId: data.source_document_id,
      status: data.status,
      issueDate: data.issue_date,
      validityDate: data.validity_date ?? null,
      allergies: data.allergies ?? null,
      rpText: data.rp_text ?? null,
      indicationsText: data.indications_text ?? null,
      prescriptionNumber: data.prescription_number ?? null,
      diagnoses,
      createdBy: data.created_by ?? null,
      createdByName: data.created_by_name ?? null,
      createdBySpecialty: data.created_by_specialty ?? null,
      createdByProfessionalCode: data.created_by_professional_code ?? null,
      emittedAt: data.emitted_at ?? null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
