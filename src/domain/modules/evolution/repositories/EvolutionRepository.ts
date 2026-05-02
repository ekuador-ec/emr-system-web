import type {
  MedicalEvolution,
  MedicalEvolutionListItem,
  CreateEvolutionPayload,
  UpdateEvolutionPayload,
  EvolutionFilters,
  PaginatedResult,
} from "../models/Evolution";

export interface EvolutionRepository {
  create(payload: CreateEvolutionPayload): Promise<MedicalEvolution>;
  update(id: string, payload: UpdateEvolutionPayload): Promise<MedicalEvolution>;
  getById(id: string): Promise<MedicalEvolution>;
  getByMedicalRecordId(medicalRecordId: string): Promise<MedicalEvolution[]>;
  getEvolutions(filters?: EvolutionFilters): Promise<PaginatedResult<MedicalEvolutionListItem>>;
  close(id: string): Promise<MedicalEvolution>;
}
