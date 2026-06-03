import type {
  AddForm005EntryResult,
  Form005Repository,
} from "@/domain/modules/form005/repositories/Form005Repository";
import type { CreateForm005EntryPayload } from "@/domain/modules/form005/models/Form005Document";

export class AddForm005EntryUseCase {
  private readonly form005Repository: Form005Repository;

  constructor(form005Repository: Form005Repository) {
    this.form005Repository = form005Repository;
  }

  async execute(
    documentId: string,
    payload: CreateForm005EntryPayload,
  ): Promise<AddForm005EntryResult> {
    const hasNote = Boolean(payload.evolutionNote && payload.evolutionNote.trim());
    if (!hasNote) {
      throw new Error("La nota de evolución de la atención es obligatoria.");
    }
    return this.form005Repository.addEntry(documentId, payload);
  }
}
