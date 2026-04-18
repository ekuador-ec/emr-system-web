import type { MedicalEvolution, CreateEvolutionPayload, UpdateEvolutionPayload } from '../models/Evolution';

export interface EvolutionRepository {
  create(payload: CreateEvolutionPayload): Promise<MedicalEvolution>;
  update(id: string, payload: UpdateEvolutionPayload): Promise<MedicalEvolution>;
  getById(id: string): Promise<MedicalEvolution>;
  getByMedicalRecordId(medicalRecordId: string): Promise<MedicalEvolution[]>;
  close(id: string): Promise<MedicalEvolution>;
}
