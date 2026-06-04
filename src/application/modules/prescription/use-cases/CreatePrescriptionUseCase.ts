import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";
import type {
  CreatePrescriptionPayload,
  MedicalPrescription,
} from "@/domain/modules/prescription/models/MedicalPrescription";

export class CreatePrescriptionUseCase {
  private readonly prescriptionRepository: PrescriptionRepository;

  constructor(prescriptionRepository: PrescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
  }

  async execute(payload: CreatePrescriptionPayload): Promise<MedicalPrescription> {
    if (!payload.medicalRecordId || !payload.sourceDocumentId) {
      throw new Error("No fue posible crear la receta: documento de origen inválido.");
    }
    return this.prescriptionRepository.create(payload);
  }
}
