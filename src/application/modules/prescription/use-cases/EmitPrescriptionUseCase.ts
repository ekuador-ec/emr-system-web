import type { PrescriptionRepository } from "@/domain/modules/prescription/repositories/PrescriptionRepository";
import type { MedicalPrescription } from "@/domain/modules/prescription/models/MedicalPrescription";

export class EmitPrescriptionUseCase {
  private readonly prescriptionRepository: PrescriptionRepository;

  constructor(prescriptionRepository: PrescriptionRepository) {
    this.prescriptionRepository = prescriptionRepository;
  }

  async execute(id: string): Promise<MedicalPrescription> {
    const prescription = await this.prescriptionRepository.getById(id);

    if (prescription.status === "EMITIDA") {
      throw new Error("La receta ya fue emitida.");
    }
    if (!prescription.rpText || prescription.rpText.trim().length === 0) {
      throw new Error("La prescripción médica (Rp) no puede estar vacía para emitir la receta.");
    }

    return this.prescriptionRepository.emit(id);
  }
}
