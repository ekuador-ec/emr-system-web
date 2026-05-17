import type { UserRole, AccountStatus } from "@/domain/modules/users/models/User";

export interface ClinicianProductivityRow {
  userId: string;
  fullName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  evolutionsOpened: number;
  evolutionsClosed: number;
  avgCloseMinutes: number | null;
  diagnosesCount: number;
  lastActivity: string | null;
}

export interface ClinicianProductivityFilters {
  role?: UserRole;
}

export interface WorkloadHeatmapCell {
  weekday: number;
  hour: number;
  total: number;
  closedCount: number;
}
