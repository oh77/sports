import type { DataColumn } from '@/app/types/domain/data-table';

/**
 * Shared column metadata for the standard football tables. Translators and
 * fixtures both emit these so every provider renders identically.
 */

export const STANDINGS_COLUMNS: DataColumn[] = [
  { name: 'GP', type: 'number', highlighted: false, group: '' },
  { name: 'W', type: 'number', highlighted: false, group: '' },
  { name: 'D', type: 'number', highlighted: false, group: '' },
  { name: 'L', type: 'number', highlighted: false, group: '' },
  { name: 'GF', type: 'number', highlighted: false, group: '' },
  { name: 'GA', type: 'number', highlighted: false, group: '' },
  { name: 'GD', type: 'number', highlighted: false, group: '' },
  { name: 'Points', type: 'number', highlighted: true, group: '' },
];

export function playerColumns(highlight: 'G' | 'A' | 'YC'): DataColumn[] {
  return [
    { name: 'GP', type: 'number', highlighted: false, group: '' },
    { name: 'G', type: 'number', highlighted: highlight === 'G', group: '' },
    { name: 'A', type: 'number', highlighted: highlight === 'A', group: '' },
    { name: 'TP', type: 'number', highlighted: false, group: '' },
    { name: 'YC', type: 'number', highlighted: highlight === 'YC', group: '' },
    { name: 'RC', type: 'number', highlighted: false, group: '' },
  ];
}

export const KEEPER_COLUMNS: DataColumn[] = [
  { name: 'GP', type: 'number', highlighted: false, group: '' },
  { name: 'CS', type: 'number', highlighted: true, group: '' },
  { name: 'GA', type: 'number', highlighted: false, group: '' },
  { name: 'GAA', type: 'string', highlighted: false, group: '' },
];
