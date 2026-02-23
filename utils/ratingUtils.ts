/**
 * Convert an NYT bestseller rank (1–15) into a star rating (3.5–5.0).
 *
 * Rank 1  → 5.0 stars
 * Rank 15 → 3.5 stars
 *
 * Formula: 5.0 - (rank - 1) * (1.5 / 14)
 * This gives a smooth linear scale across the bestseller list.
 */
export function nytRankToStars(rank: number): number {
  const clamped = Math.max(1, Math.min(rank, 15));
  const rating = 5.0 - (clamped - 1) * (1.5 / 14);
  // Round to nearest 0.5
  return Math.round(rating * 2) / 2;
}
