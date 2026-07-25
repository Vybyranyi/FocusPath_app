import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocation } from "react-router";
import { useMediaQuery } from "react-responsive";
import AppBarMobile from "@components/layout/AppBarMobile";
import { renderWithProviders } from "../testUtils";
// Compared by identity rather than by filename: Vite inlines these as data URIs,
// so the path never reaches the rendered src.
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
      <AppBarMobile />
      <LocationProbe />
    </>,
    { route },
  );

describe("AppBarMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(true);
  });

  it("renders nothing above the mobile breakpoint", () => {
    mockUseMediaQuery.mockReturnValue(false);

    renderBar();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders the four nav destinations plus the add button", () => {
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
    ["activity", "/stats"],
    ["profile", "/profile"],
  ])("navigates to %s", (icon, path) => {
    renderBar("/");

    fireEvent.click(screen.getByAltText(icon).closest("button")!);

    expect(screen.getByTestId("location")).toHaveTextContent(path);
  });
});
