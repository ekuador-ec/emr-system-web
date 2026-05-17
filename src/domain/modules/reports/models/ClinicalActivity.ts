export interface EvolutionDistribution {
  byStatus: Record<string, number>;
  byArrival: Record<string, number>;
  byClinicalCause: Record<string, number>;
  byDischarge: Record<string, number>;
  total: number;
}

export interface EvolutionCloseStats {
  closedCount: number;
  openCount: number;
  openOver24h: number;
  openOver72h: number;
  avgCloseMinutes: number | null;
  medianCloseMinutes: number | null;
  p90CloseMinutes: number | null;
}
