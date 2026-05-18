import type { UserRepository } from "@/domain/modules/users/repositories/UserRepository";
import type { UserFilters, UserWithPresence } from "@/domain/modules/users/models/User";

const SEARCH_TERM_MIN_LENGTH = 2;

export class GetFilteredUsers {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(filters: UserFilters): Promise<UserWithPresence[]> {
    const sanitized: UserFilters = {
      roles: filters.roles?.length ? filters.roles : undefined,
      statuses: filters.statuses?.length ? filters.statuses : undefined,
      presenceStatuses: filters.presenceStatuses?.length ? filters.presenceStatuses : undefined,
      searchTerm: this.sanitizeSearchTerm(filters.searchTerm),
      includeDeleted: filters.includeDeleted ?? false,
    };

    return this.userRepository.getFilteredUsers(sanitized);
  }

  private sanitizeSearchTerm(term: string | null | undefined): string | null {
    if (!term) return null;

    const trimmed = term.trim();
    if (trimmed.length < SEARCH_TERM_MIN_LENGTH) return null;

    return trimmed;
  }
}
