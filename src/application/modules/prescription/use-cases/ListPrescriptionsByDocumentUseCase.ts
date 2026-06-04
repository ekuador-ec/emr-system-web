import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";
import type { MedicalPrescription } from "@/domain/modules/prescription/models/MedicalPrescription";
import type { DocumentType } from "@/domain/modules/document/models/ClinicalDocument";

export class ListPrescriptionsByDocumentUseCase {
  private readonly prescriptionRepository: PrescriptionRepository;

  constructor(prescriptionRepository: PrescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
  }

  async execute(
    sourceDocumentType: DocumentType,
    sourceDocumentId: string,
  ): Promise<MedicalPrescription[]> {
    return this.prescriptionRepository.listByDocument(sourceDocumentType, sourceDocumentId);
  }
}
