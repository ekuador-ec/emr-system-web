import type { Form005Repository } from "@/domain/modules/form005/repositories/Form005Repository";
import type { Form005Document } from "@/domain/modules/form005/models/Form005Document";

export class GetForm005ByIdUseCase {
  private readonly form005Repository: Form005Repository;

  constructor(form005Repository: Form005Repository) {
    this.form005Repository = form005Repository;
  }

  async execute(id: string): Promise<Form005Document> {
    return this.form005Repository.getById(id);
  }
}
