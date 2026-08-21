import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WeekSelector from "@components/layout/WeekSelector";
import { renderWithProviders } from "../testUtils";

// Wednesday 8 Jan 2025, so "this week" runs Mon 6 Jan – Sun 12 Jan.
const NOW = new Date(2025, 0, 8, 12, 0, 0);

const weekStarting = (year: number, month: number, day: number) => ({
  calendar: { currentWeekStart: new Date(year, month, day).toISOString() },
});

beforeEach(() => {
  // Only Date is faked; timers stay real so React's scheduler is untouched.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WeekSelector", () => {
  it("labels the current week and its date range", () => {
    renderWithProviders(<WeekSelector />, {
      preloadedState: weekStarting(2025, 0, 6),
    });

    expect(screen.getByText("This week")).toBeInTheDocument();
    expect(screen.getByText("Jan 6 - Jan 12")).toBeInTheDocument();
  });

  it.each([
    ["Previous week", [2024, 11, 30]],
    ["Next week", [2025, 0, 13]],
    ["3 weeks ago", [2024, 11, 16]],
    ["In 2 weeks", [2025, 0, 20]],
  ] as const)("labels a shifted week as %s", (label, [year, month, day]) => {
    renderWithProviders(<WeekSelector />, {
      preloadedState: weekStarting(year, month, day),
    });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders a back and a forward control", () => {
    renderWithProviders(<WeekSelector />, {
      preloadedState: weekStarting(2025, 0, 6),
    });

    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("moves the stored week forward a week on the right control", () => {
    const { store } = renderWithProviders(<WeekSelector />, {
      preloadedState: weekStarting(2025, 0, 6),
    });

    fireEvent.click(screen.getAllByRole("button")[1]);

    expect(new Date(store.getState().calendar.currentWeekStart)).toEqual(
      new Date(2025, 0, 13),
    );
  });

  describe("the way back", () => {
    it("is absent on the current week, where it would do nothing", () => {
      renderWithProviders(<WeekSelector />, {
        preloadedState: weekStarting(2025, 0, 6),
      });

      expect(
        screen.queryByRole("button", { name: "This week" }),
      ).not.toBeInTheDocument();
    });

    it("appears once the week has been shifted", () => {
      renderWithProviders(<WeekSelector />, {
        preloadedState: weekStarting(2024, 11, 16),
      });

      expect(screen.getByRole("button", { name: "This week" })).toBeInTheDocument();
    });

    it("returns to the current week in one press, however far away it is", () => {
      const { store } = renderWithProviders(<WeekSelector />, {
        preloadedState: weekStarting(2024, 10, 4),
      });

      fireEvent.click(screen.getByRole("button", { name: "This week" }));

      expect(new Date(store.getState().calendar.currentWeekStart)).toEqual(
        new Date(2025, 0, 6),
      );
    });
  });

  it("moves the stored week back a week on the left control", () => {
    const { store } = renderWithProviders(<WeekSelector />, {
      preloadedState: weekStarting(2025, 0, 6),
    });

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(new Date(store.getState().calendar.currentWeekStart)).toEqual(
      new Date(2024, 11, 30),
    );
  });
});
