const BASE_MS = 1000;

export function computeBackoff(attempt: number): number {
  if (attempt <= 0) {
    return 0;
  }
  return BASE_MS * 2 ** attempt;
}
