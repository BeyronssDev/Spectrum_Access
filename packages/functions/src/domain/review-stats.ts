import type { Review, SensoryCriterion } from "@accessibilitat/shared";

export const aggregateCriteria: SensoryCriterion[] = [
  "noise",
  "crowd",
  "lighting",
  "temperature",
  "waitingTime",
  "staffTreatment",
  "quietSpace",
  "exitEase",
  "perceivedSafety",
  "generalRecommendation"
];

export type PlaceReviewStats = {
  ratingCount: number;
  averageScore: number;
  criterionAverages: Record<SensoryCriterion, number>;
};

export function calculatePlaceReviewStats(reviews: Array<Pick<Review, "ratings">>): PlaceReviewStats {
  let ratingCount = 0;
  let scoreTotal = 0;
  const criterionTotals = Object.fromEntries(
    aggregateCriteria.map((criterion) => [criterion, 0])
  ) as Record<SensoryCriterion, number>;

  for (const review of reviews) {
    ratingCount += 1;
    for (const criterion of aggregateCriteria) {
      criterionTotals[criterion] += review.ratings[criterion] ?? 0;
    }
    scoreTotal += review.ratings.generalRecommendation ?? 0;
  }

  const criterionAverages = Object.fromEntries(
    aggregateCriteria.map((criterion) => [
      criterion,
      ratingCount > 0 ? Number((criterionTotals[criterion] / ratingCount).toFixed(2)) : 0
    ])
  ) as Record<SensoryCriterion, number>;

  return {
    ratingCount,
    averageScore: ratingCount > 0 ? Number((scoreTotal / ratingCount).toFixed(2)) : 0,
    criterionAverages
  };
}
