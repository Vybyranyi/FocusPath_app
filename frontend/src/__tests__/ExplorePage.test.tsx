import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PlanSummary } from "@shared/index";
import ExplorePage from "@pages/ExplorePage";
import { makePlanSummary, renderWithProviders } from "../testUtils";

const fetchMock = vi.fn();

const page = (plans: PlanSummary[]) =>
  new Response(JSON.stringify({ success: true, data: { plans } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

/** Answers each shelf from its own list, keyed by the `section` parameter. */
const shelves = (bySection: Record<string, PlanSummary[]>) => {
  fetchMock.mockImplementation((url: string) => {
    const section = new URL(String(url), "http://localhost").searchParams.get("section") ?? "";
    return Promise.resolve(page(bySection[section] ?? []));
  });
};

/** Every `/plans` URL asked for so far. */
const requested = () => fetchMock.mock.calls.map(([url]) => String(url));

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  document.cookie = "csrf_token=token; path=/";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ExplorePage", () => {
  it("asks for all three shelves", async () => {
    shelves({});
    renderWithProviders(<ExplorePage />, { route: "/explore" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const sections = requested().map(
      (url) => new URL(url, "http://localhost").searchParams.get("section"),
    );
    expect(sections.sort()).toEqual(["new", "official", "proven"]);
  });

  it("starts on the language the interface is being read in", async () => {
    shelves({});
    renderWithProviders(<ExplorePage />, { route: "/explore" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(requested()[0]).toContain("language=en");
  });

  it("shows a shelf that has plans and stays silent about one that does not", async () => {
    shelves({ official: [makePlanSummary({ _id: "p1", title: "Walk 30 minutes" })] });
    renderWithProviders(<ExplorePage />, { route: "/explore" });

    expect(await screen.findByText("From FocusPath")).toBeInTheDocument();
    expect(await screen.findByText("Walk 30 minutes")).toBeInTheDocument();

    // An empty shelf is normal while the library fills unevenly, so it renders
    // nothing rather than an empty section with a heading over it.
    expect(screen.queryByText("Walked by others")).not.toBeInTheDocument();
  });

  it("says the library is still filling up when nothing is published", async () => {
    shelves({});
    renderWithProviders(<ExplorePage />, { route: "/explore" });

    expect(await screen.findByText("The library is still filling up")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  describe("filters", () => {
    it("narrows the request and puts the choice in the URL", async () => {
      const user = userEvent.setup();
      shelves({ new: [makePlanSummary()] });
      renderWithProviders(<ExplorePage />, { route: "/explore" });

      await screen.findByText("Newest");
      fetchMock.mockClear();

      await user.selectOptions(screen.getByLabelText("Category"), "fitness");

      await waitFor(() =>
        expect(requested().every((url) => url.includes("category=fitness"))).toBe(true),
      );
      // All three shelves narrow together — the filter is the page's, not one
      // section's.
      expect(requested()).toHaveLength(3);
    });

    it("offers a way out of an empty filtered view", async () => {
      const user = userEvent.setup();
      fetchMock.mockImplementation((url: string) =>
        Promise.resolve(
          page(String(url).includes("category=") ? [] : [makePlanSummary()]),
        ),
      );

      renderWithProviders(<ExplorePage />, { route: "/explore" });
      await screen.findByText("Newest");

      await user.selectOptions(screen.getByLabelText("Category"), "money");

      expect(await screen.findByText("Nothing here yet")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    });

    it("keeps All languages once it is chosen", async () => {
      const user = userEvent.setup();
      shelves({ new: [makePlanSummary()] });
      renderWithProviders(<ExplorePage />, { route: "/explore" });

      await screen.findByText("Newest");
      fetchMock.mockClear();

      // Selected by its label: the value is the empty string, which
      // `selectOptions` cannot match on.
      await user.selectOptions(
        screen.getByLabelText("Language"),
        screen.getByRole("option", { name: "All languages" }),
      );

      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(requested().every((url) => !url.includes("language="))).toBe(true);
    });
  });
});
