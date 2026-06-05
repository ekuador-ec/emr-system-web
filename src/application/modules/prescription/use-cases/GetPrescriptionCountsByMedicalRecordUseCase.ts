import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";
import type { PrescriptionDocumentCount } from "@/domain/modules/prescription/models/MedicalPrescription";

export class GetPrescriptionCountsByMedicalRecordUseCase {
  private readonly prescriptionRepository: PrescriptionRepository;

  constructor(prescriptionRepository: PrescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
  }

  async execute(medicalRecordId: string): Promise<PrescriptionDocumentCount[]> {
    return this.prescriptionRepository.getCountsByMedicalRecord(medicalRecordId);
  }
}
