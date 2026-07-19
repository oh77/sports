/** Human-friendly label for a season key, e.g. "25-26" -> "2025/26". */
export function seasonLabel(key: string): string {
  const [start, end] = key.split('-');
  return start && end ? `20${start}/${end}` : key;
}
