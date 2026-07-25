import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocation } from "react-router";
import { useMediaQuery } from "react-responsive";
import AppBarDecktop from "@components/layout/AppBarDecktop";
import { renderWithProviders } from "../testUtils";
// Compared by identity rather than by filename: Vite inlines these as data URIs,
// so the path never reaches the rendered src.
import activityActive from "@assets/images/icons/activity_active.svg";
import home from "@assets/images/icons/home.svg";
import homeActive from "@assets/images/icons/home_active.svg";

vi.mock("react-responsive", () => ({ useMediaQuery: vi.fn() }));

const mockUseMediaQuery = vi.mocked(useMediaQuery);

/** Surfaces the router's current path so navigation can be asserted on. */
function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>;
}

const renderBar = (route = "/main") =>
  renderWithProviders(
    <>
      <AppBarDecktop />
      <LocationProbe />
    </>,
    { route },
  );

/** The icon a nav button is currently showing. Button renders it without alt text. */
const iconOf = (label: string) =>
  screen.getByText(label).closest("button")?.querySelector("img")?.getAttribute("src") ?? "";

describe("AppBarDecktop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(true);
  });

  it("renders nothing below the desktop breakpoint", () => {
    mockUseMediaQuery.mockReturnValue(false);

    renderBar();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders the create action alongside every nav destination", () => {
    renderBar();

    for (const label of ["New habbit", "Home", "Explore", "Activity", "Profile"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it.each([
    ["Home", "/main"],
    ["Explore", "/explore"],
    ["Activity", "/stats"],
    ["Profile", "/profile"],
    ["New habbit", "/createhabit"],
  ])("navigates to %s", (label, path) => {
    renderBar("/");

    fireEvent.click(screen.getByText(label));

    expect(screen.getByTestId("location")).toHaveTextContent(path);
  });

  it("swaps in the active icon for the destination matching the route", () => {
    renderBar("/stats");

    expect(iconOf("Activity")).toBe(activityActive);
    expect(iconOf("Home")).toBe(home);
  });

  it("treats any /main sub-route as home", () => {
    renderBar("/main/today");

    expect(iconOf("Home")).toBe(homeActive);
  });
});
