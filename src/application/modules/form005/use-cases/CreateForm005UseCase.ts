import type { Form005Repository } from "@/domain/modules/form005/repositories/Form005Repository";
import type {
  CreateForm005Payload,
  Form005Document,
} from "@/domain/modules/form005/models/Form005Document";

export class CreateForm005UseCase {
  private readonly form005Repository: Form005Repository;

  constructor(form005Repository: Form005Repository) {
    this.form005Repository = form005Repository;
  }

  async execute(payload: CreateForm005Payload): Promise<Form005Document> {
    return this.form005Repository.create(payload);
  }
}
