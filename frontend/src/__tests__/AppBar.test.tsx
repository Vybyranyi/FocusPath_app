import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocation } from "react-router";
import { useMediaQuery } from "react-responsive";
import AppBar from "@components/layout/AppBar";
import { renderWithProviders } from "../testUtils";
// Compared by identity rather than by filename: Vite inlines these as data URIs,
// so the path never reaches the rendered src.
import activityActive from "@assets/images/icons/activity_active.svg";
import home from "@assets/images/icons/home.svg";
import homeActive from "@assets/images/icons/home_active.svg";
import profileActive from "@assets/images/icons/profile_active.svg";

vi.mock("react-responsive", () => ({ useMediaQuery: vi.fn() }));

const mockUseMediaQuery = vi.mocked(useMediaQuery);

/** Surfaces the router's current path so navigation can be asserted on. */
function LocationProbe() {
  return <span data-testid="location">{useLocation().pathname}</span>;
}

const renderBar = (route = "/main") =>
  renderWithProviders(
    <>
      <AppBar />
      <LocationProbe />
    </>,
    { route },
  );

const onDesktop = () => mockUseMediaQuery.mockReturnValue(true);
const onMobile = () => mockUseMediaQuery.mockReturnValue(false);

/** The icon a desktop nav button is showing. Button renders it without alt text. */
const desktopIcon = (label: string) =>
  screen.getByText(label).closest("button")?.querySelector("img")?.getAttribute("src") ?? "";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AppBar on desktop", () => {
  beforeEach(onDesktop);

  it("renders the create action alongside every destination", () => {
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

    expect(desktopIcon("Activity")).toBe(activityActive);
    expect(desktopIcon("Home")).toBe(home);
  });

  it("treats any /main sub-route as home", () => {
    renderBar("/main/today");

    expect(desktopIcon("Home")).toBe(homeActive);
  });
});

describe("AppBar on mobile", () => {
  beforeEach(onMobile);

  it("renders the four destinations plus the add button", () => {
    renderBar();

    expect(screen.getAllByRole("button")).toHaveLength(5);
    for (const icon of ["home", "explore", "activity", "profile"]) {
      expect(screen.getByAltText(icon)).toBeInTheDocument();
    }
    expect(screen.getByAltText("add")).toBeInTheDocument();
  });

  it("marks the destination matching the current route as active", () => {
    renderBar("/profile");

    expect(screen.getByAltText("profile")).toHaveAttribute("src", profileActive);
    expect(screen.getByAltText("home")).toHaveAttribute("src", home);
  });

  it("treats any /main sub-route as home", () => {
    renderBar("/main/today");

    expect(screen.getByAltText("home")).toHaveAttribute("src", homeActive);
  });

  it("navigates to habit creation from the add button", () => {
    renderBar();

    fireEvent.click(screen.getByAltText("add").closest("button")!);

    expect(screen.getByTestId("location")).toHaveTextContent("/createhabit");
  });

  it.each([
    ["home", "/main"],
    ["explore", "/explore"],
    ["activity", "/stats"],
    ["profile", "/profile"],
  ])("navigates to %s", (icon, path) => {
    renderBar("/");

    fireEvent.click(screen.getByAltText(icon).closest("button")!);

    expect(screen.getByTestId("location")).toHaveTextContent(path);
  });
});

describe("destinations", () => {
  it("offers the same set on both layouts", () => {
    // Two separate components had drifted: Explore was wired on desktop and
    // rendered with no handler at all on mobile, so tapping it did nothing.
    onDesktop();
    const { unmount } = renderBar();
    const desktop = ["Home", "Explore", "Activity", "Profile"].map((label) =>
      screen.getByText(label).textContent?.toLowerCase(),
    );
    unmount();

    onMobile();
    renderBar();
    const mobile = ["home", "explore", "activity", "profile"].map(
      (icon) => screen.getByAltText(icon).getAttribute("alt"),
    );

    expect(mobile).toEqual(desktop);
  });
});
