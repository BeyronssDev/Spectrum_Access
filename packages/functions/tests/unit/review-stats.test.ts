import { describe, expect, it } from "vitest";
import { calculatePlaceReviewStats } from "../../src/domain/review-stats.js";
import type { SensoryRating } from "@accessibilitat/shared";

const baseRatings: SensoryRating = {
  noise: 1,
  crowd: 2,
  lighting: 3,
  temperature: 4,
  waitingTime: 5,
  staffTreatment: 4,
  quietSpace: 3,
  exitEase: 2,
  perceivedSafety: 4,
  generalRecommendation: 5
};

describe("calculatePlaceReviewStats", () => {
  it("returns zeroed stats when there are no active reviews", () => {
    const stats = calculatePlaceReviewStats([]);

    expect(stats.ratingCount).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.criterionAverages.noise).toBe(0);
    expect(stats.criterionAverages.generalRecommendation).toBe(0);
  });

  it("averages sensory criteria and general recommendation", () => {
    const stats = calculatePlaceReviewStats([
      { ratings: baseRatings },
      { ratings: { ...baseRatings, noise: 5, generalRecommendation: 3 } }
    ]);

    expect(stats.ratingCount).toBe(2);
    expect(stats.averageScore).toBe(4);
    expect(stats.criterionAverages.noise).toBe(3);
    expect(stats.criterionAverages.waitingTime).toBe(5);
  });
});
