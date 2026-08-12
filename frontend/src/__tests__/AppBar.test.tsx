import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocation } from "react-router";
import { useMediaQuery } from "react-responsive";
import AppBar from "@components/layout/AppBar";
import { renderWithProviders } from "../testUtils";

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

/** Whether a nav button reads as the destination the router is on. */
const isCurrent = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-current") === "page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AppBar on desktop", () => {
  beforeEach(onDesktop);

  it("renders the create action alongside every destination", () => {
    renderBar();

    for (const label of ["New habit", "Home", "Explore", "Activity"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("leaves the account out of the sidebar", () => {
    // Profile is reached by clicking your own avatar in the header, which is
    // where people look for an account. The mobile bar keeps it because that
    // layout has no header to put an avatar in.
    renderBar();

    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it.each([
    ["Home", "/main"],
    ["Explore", "/explore"],
    ["Activity", "/stats"],
    ["New habit", "/createhabit"],
  ])("navigates to %s", (label, path) => {
    renderBar("/");

    fireEvent.click(screen.getByText(label));

    expect(screen.getByTestId("location")).toHaveTextContent(path);
  });

  it("marks the destination matching the route as current", () => {
    renderBar("/stats");

    expect(isCurrent("Activity")).toBe(true);
    expect(isCurrent("Home")).toBe(false);
  });

  it("treats any /main sub-route as home", () => {
    renderBar("/main/today");

    expect(isCurrent("Home")).toBe(true);
  });
});

describe("AppBar on mobile", () => {
  beforeEach(onMobile);

  it("renders the four destinations plus the add button", () => {
    renderBar();

    expect(screen.getAllByRole("button")).toHaveLength(5);
    for (const label of ["Home", "Explore", "Activity", "Profile", "New habit"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the destination matching the current route as active", () => {
    renderBar("/profile");

    expect(isCurrent("Profile")).toBe(true);
    expect(isCurrent("Home")).toBe(false);
  });

  it("treats any /main sub-route as home", () => {
    renderBar("/main/today");

    expect(isCurrent("Home")).toBe(true);
  });

  it("navigates to habit creation from the add button", () => {
    renderBar();

    fireEvent.click(screen.getByRole("button", { name: "New habit" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/createhabit");
  });

  it.each([
    ["Home", "/main"],
    ["Explore", "/explore"],
    ["Activity", "/stats"],
    ["Profile", "/profile"],
  ])("navigates to %s", (label, path) => {
    renderBar("/");

    fireEvent.click(screen.getByRole("button", { name: label }));

    expect(screen.getByTestId("location")).toHaveTextContent(path);
  });
});

describe("destinations", () => {
  /** Everything in the bar except the create action, which sits in a different
   *  place on each layout. */
  const listed = () =>
    screen
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? b.textContent)
      .filter((name) => name !== "New habit")
      .sort();

  it("offers the same destinations on both layouts", () => {
    // Two separate components had drifted once: Explore was wired on desktop
    // and rendered with no handler at all on mobile, so tapping it did
    // nothing. One list is what keeps a *destination* from existing on one
    // layout and not the other.
    onDesktop();
    const { unmount } = renderBar();
    const desktop = listed();
    unmount();

    onMobile();
    renderBar();
    const mobile = listed().filter((name) => name !== "Profile");

    expect(mobile).toEqual(desktop);
    expect(desktop).toEqual(["Activity", "Explore", "Home"]);
  });

  it("keeps the account in the bar on mobile only", () => {
    // The one deliberate exception to the rule above: an account is not a
    // destination. Desktop reaches it through the header avatar; mobile has
    // no header, so it stays a button here.
    onMobile();
    const { unmount } = renderBar();
    expect(listed()).toContain("Profile");
    unmount();

    onDesktop();
    renderBar();
    expect(listed()).not.toContain("Profile");
  });
});
