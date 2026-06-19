import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isScore, isValidCoordinate } from "./validation.js";

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
});
