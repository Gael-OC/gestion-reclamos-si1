type PaginaVisible = number | 'inicio' | 'fin'

export function paginasVisibles(
  actual: number,
  total: number,
): PaginaVisible[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (actual <= 4) return [1, 2, 3, 4, 5, 'fin', total]
  if (actual >= total - 3) {
    return [1, 'inicio', total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, 'inicio', actual - 1, actual, actual + 1, 'fin', total]
}
