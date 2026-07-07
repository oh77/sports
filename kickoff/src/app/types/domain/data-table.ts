/**
 * Column metadata that drives generic table rendering: standings and stats
 * tables render whatever columns their data declares.
 */
export interface DataColumn {
  name: string;
  type: string;
  highlighted: boolean;
  group: string;
}

export interface SortKey {
  name: string;
  order: 'asc' | 'desc';
}
