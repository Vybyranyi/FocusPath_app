import { describe, expect, it } from "vitest";
import { getHabitProgress } from "@/lib/habitProgress";

describe("getHabitProgress", () => {
  it("is zero when there is nothing to measure", () => {
    // Five components each guarded this differently, and one divided by zero.
    expect(getHabitProgress(0, 0)).toBe(0);
    expect(getHabitProgress(3, 0)).toBe(0);
    expect(getHabitProgress(0, -1)).toBe(0);
  });

  it("reports the completed share as a whole percentage", () => {
    expect(getHabitProgress(0, 4)).toBe(0);
    expect(getHabitProgress(1, 4)).toBe(25);
    expect(getHabitProgress(4, 4)).toBe(100);
  });

  it("rounds rather than truncating", () => {
    // 2/3 is 66.67; flooring it made the same habit read 66% in one place and
    // 67% in another on the same screen.
    expect(getHabitProgress(2, 3)).toBe(67);
    expect(getHabitProgress(1, 3)).toBe(33);
  });

  it("never exceeds a hundred, however the counts drift", () => {
    expect(getHabitProgress(9, 5)).toBe(100);
  });

  it("never goes below zero", () => {
    expect(getHabitProgress(-2, 5)).toBe(0);
  });
});
