import { evaluateSlaughterEligibility } from "../src/modules/slaughter/slaughter.module";

describe("slaughter eligibility", () => {
  it("blocks when weight is below minimum", () => {
    const result = evaluateSlaughterEligibility({
      animalDob: new Date("2025-01-01"),
      animalStage: "FINISHER",
      latestWeightKg: 60,
      latestWeightRecordedAt: new Date(),
      activeWithdrawalUntil: null,
      rule: {
        minWeightKg: 80,
        maxWeightKg: 120,
        minAgeDays: 100,
        requireRecentWeightDays: 7,
        blockIfWithdrawal: true,
      },
      now: new Date("2025-06-01"),
    });
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("Below minimum weight");
  });

  it("passes when all rule conditions are satisfied", () => {
    const now = new Date("2025-06-01");
    const result = evaluateSlaughterEligibility({
      animalDob: new Date("2025-01-01"),
      animalStage: "FINISHER",
      latestWeightKg: 95,
      latestWeightRecordedAt: new Date("2025-05-30"),
      activeWithdrawalUntil: new Date("2025-05-01"),
      rule: {
        minWeightKg: 80,
        maxWeightKg: 120,
        minAgeDays: 120,
        requireRecentWeightDays: 7,
        blockIfWithdrawal: true,
      },
      now,
    });
    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });
});
