import { hasVersionConflict } from "../src/modules/sync/sync.module";

describe("sync conflict logic", () => {
  it("detects mismatch versions as conflict", () => {
    expect(hasVersionConflict(2, 3)).toBe(true);
  });

  it("accepts exact base version match", () => {
    expect(hasVersionConflict(3, 3)).toBe(false);
  });

  it("treats missing base version as conflict", () => {
    expect(hasVersionConflict(undefined, 1)).toBe(true);
  });
});
