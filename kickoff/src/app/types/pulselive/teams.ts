import type { PulselivePagination } from '@/app/types/pulselive/matches';

export interface PulseliveTeam {
  name: string;
  id: string;
  shortName: string;
  abbr: string;
  stadium: Record<string, unknown>;
}

export interface PulseliveTeamsResponse {
  pagination: PulselivePagination;
  data: PulseliveTeam[];
}
