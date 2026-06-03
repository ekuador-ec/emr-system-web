import type { Form005Repository } from "@/domain/modules/form005/repositories/Form005Repository";
import type { Form005Document } from "@/domain/modules/form005/models/Form005Document";
import type { UserRole } from "@/domain/modules/users/models/User";

const ROLES_ALLOWED_TO_CLOSE: ReadonlyArray<UserRole> = ["doctor", "admin"];

export class CloseForm005UseCase {
  private readonly form005Repository: Form005Repository;

  constructor(form005Repository: Form005Repository) {
    this.form005Repository = form005Repository;
  }

  async execute(id: string, actorRole: UserRole | undefined): Promise<Form005Document> {
    if (!actorRole || !ROLES_ALLOWED_TO_CLOSE.includes(actorRole)) {
      throw new Error(
        "Solo personal médico o administradores pueden firmar y cerrar un documento.",
      );
    }

    return this.form005Repository.close(id);
  }
}
