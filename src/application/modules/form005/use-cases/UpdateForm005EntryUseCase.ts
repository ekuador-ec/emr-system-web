import type { Form005Repository } from "@/domain/modules/form005/repositories/Form005Repository";
import type {
  Form005Document,
  UpdateForm005EntryPayload,
} from "@/domain/modules/form005/models/Form005Document";

export class UpdateForm005EntryUseCase {
  private readonly form005Repository: Form005Repository;

  constructor(form005Repository: Form005Repository) {
    this.form005Repository = form005Repository;
  }

  async execute(
    documentId: string,
    entryId: string,
    payload: UpdateForm005EntryPayload,
  ): Promise<Form005Document> {
    const hasNote = Boolean(payload.evolutionNote && payload.evolutionNote.trim());
    if (!hasNote) {
      throw new Error("La nota de evolución de la atención es obligatoria.");
    }
    return this.form005Repository.updateEntry(documentId, entryId, payload);
  }
}
