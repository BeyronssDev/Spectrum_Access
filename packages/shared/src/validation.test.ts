import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isScore, isSensoryRating, isValidCoordinate, normalizeText } from "./validation.js";

describe("shared validation", () => {
  it("accepts only 1-5 integer scores", () => {
    assert.equal(isScore(1), true);
    assert.equal(isScore(5), true);
    assert.equal(isScore(0), false);
    assert.equal(isScore(6), false);
    assert.equal(isScore(3.5), false);
  });

  it("validates latitude and longitude ranges", () => {
    assert.equal(isValidCoordinate(41.3902, 2.154), true);
    assert.equal(isValidCoordinate(120, 2.154), false);
    assert.equal(isValidCoordinate(41.3902, 200), false);
  });

  it("normalizes bounded text", () => {
    assert.equal(normalizeText("  Biblioteca  "), "Biblioteca");
    assert.equal(normalizeText(""), null);
    assert.equal(normalizeText("abcd", 3), null);
  });

  it("requires complete sensory ratings", () => {
    const ratings = {
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

    assert.equal(isSensoryRating(ratings), true);
    assert.equal(isSensoryRating({ ...ratings, noise: 0 }), false);
    assert.equal(isSensoryRating({ ...ratings, noise: 2.5 }), false);
    assert.equal(isSensoryRating({ noise: 1 }), false);
  });
});
