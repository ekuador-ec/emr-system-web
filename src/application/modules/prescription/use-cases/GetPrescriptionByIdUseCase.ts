import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";
import type { MedicalPrescription } from "@/domain/modules/prescription/models/MedicalPrescription";

export class GetPrescriptionByIdUseCase {
  private readonly prescriptionRepository: PrescriptionRepository;

  constructor(prescriptionRepository: PrescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
  }

  async execute(id: string): Promise<MedicalPrescription> {
    return this.prescriptionRepository.getById(id);
  }
}
