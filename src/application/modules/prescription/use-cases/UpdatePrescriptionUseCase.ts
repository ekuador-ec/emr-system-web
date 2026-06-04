import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";
import type {
  MedicalPrescription,
  UpdatePrescriptionPayload,
} from "@/domain/modules/prescription/models/MedicalPrescription";

export class UpdatePrescriptionUseCase {
  private readonly prescriptionRepository: PrescriptionRepository;

  constructor(prescriptionRepository: PrescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
  }

  async execute(id: string, payload: UpdatePrescriptionPayload): Promise<MedicalPrescription> {
    return this.prescriptionRepository.update(id, payload);
  }
}
