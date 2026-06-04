import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";

export class DeletePrescriptionUseCase {
  private readonly prescriptionRepository: PrescriptionRepository;

  constructor(prescriptionRepository: PrescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
  }

  async execute(id: string): Promise<void> {
    return this.prescriptionRepository.delete(id);
  }
}
