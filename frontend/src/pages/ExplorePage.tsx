import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { PlanSection } from "@shared/index";
import Button from "@components/ui/Button";
import { Skeleton } from "@components/ui/Skeleton";
import PlanCard from "@components/explore/PlanCard";
import PlanFilters from "@components/explore/PlanFilters";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { fetchShelf, type PlanShelf } from "@store/plansSlice";
import { selectExploreIsEmpty, selectPlanSections } from "@store/selectors";
import { isPlanCategory } from "@/lib/planCategories";
import { interfaceLanguage } from "@/lib/planLanguages";

/**
 * Three editorial shelves, in this order, and no ranking cleverer than that.
 *
 * On thirty seeded plans and almost no clone statistics, any "smart" ordering
 * ranks noise. Personalised results have their own cold start on top of that —
 * someone who just registered has no habits to personalise from, and they are
 * exactly the person Explore is for.
 *
 * There are also no tabs. Challenges and leagues will be neighbours on this
 * route one day, but not compartments inside this page: tabs over an empty
 * section are three empty screens instead of one.
 */
const SHELVES: ReadonlyArray<{ section: PlanSection; title: string; blurb: string }> = [
  {
    section: "official",
    title: "From FocusPath",
    blurb: "Written and read through by us.",
  },
  {
    section: "proven",
    title: "Walked by others",
    blurb: "Finished by their author, or taken by enough people to say something.",
  },
  {
    section: "new",
    title: "Newest",
    blurb: "Just published. No results yet — that is normal.",
  },
];

function ShelfSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} className="h-44 rounded-2xl" />
      ))}
    </div>
  );
}

function Shelf({
  title,
  blurb,
  shelf,
  onLoadMore,
}: {
  title: string;
  blurb: string;
  shelf: PlanShelf;
  onLoadMore: () => void;
}) {
  // An empty shelf is normal — the library fills unevenly — so it says nothing
  // rather than showing an error where a section used to be.
  if (!shelf.loading && shelf.plans.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="display-5 text-ink">{title}</h2>
        <p className="alternative text-ink-muted">{blurb}</p>
      </div>

      {shelf.loading && shelf.plans.length === 0 ? (
        <ShelfSkeleton />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shelf.plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}

      {shelf.nextCursor && (
        <div className="w-full max-w-52">
          <Button
            type="outline"
            size="small"
            disabled={shelf.loading}
            onClick={onLoadMore}
          >
            {shelf.loading ? "Loading…" : "Show more"}
          </Button>
        </div>
      )}
    </section>
  );
}

export default function ExplorePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sections = useAppSelector(selectPlanSections);
  const isEmpty = useAppSelector(selectExploreIsEmpty);
  const error = useAppSelector((state) => state.plans.error);
  const user = useAppSelector((state) => state.auth.user);

  // Filters live in the URL, so a filtered view can be shared, bookmarked and
  // walked back to with the browser's own Back button.
  const rawCategory = searchParams.get("category") ?? "";
  const category = isPlanCategory(rawCategory) ? rawCategory : undefined;
  const language = searchParams.get("lang") ?? interfaceLanguage();

  useEffect(() => {
    for (const { section } of SHELVES) {
      dispatch(fetchShelf({ section, filters: { category, language } }));
    }
  }, [dispatch, category, language]);

  const setFilter = (key: "category" | "lang", value?: string) => {
    const next = new URLSearchParams(searchParams);

    if (key === "lang") {
      // Written even when empty: "All languages" is a choice, and dropping the
      // parameter would snap the filter back to the interface language on the
      // next read.
      next.set("lang", value ?? "");
    } else if (value) {
      next.set("category", value);
    } else {
      next.delete("category");
    }

    setSearchParams(next, { replace: true });
  };

  const filtered = Boolean(category) || searchParams.has("lang");

  return (
    <div className="page-gutter max-w-6xl mx-auto pt-6 md:pt-10 pb-28 md:pb-12 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="display-4 text-ink">Explore plans</h1>
        <p className="body-light text-ink-2 max-w-2xl">
          Ready-made plans, day by day. Take one and it becomes a habit of your
          own, with every day already written.
        </p>
      </header>

      <PlanFilters
        category={category}
        language={language}
        onCategoryChange={(next) => setFilter("category", next)}
        onLanguageChange={(next) => setFilter("lang", next)}
      />

      {error && (
        <p role="alert" className="body-light text-danger">
          {error}
        </p>
      )}

      {isEmpty ? (
        <div className="flex flex-col items-center text-center gap-4 py-10">
          <h2 className="display-5 text-ink">
            {filtered ? "Nothing here yet" : "The library is still filling up"}
          </h2>
          <p className="body-light text-ink-2 max-w-80">
            {filtered
              ? "No plans match these filters. Try another category, or browse every language."
              : "No plans have been published yet. Yours could be the first."}
          </p>
          <div className="w-full max-w-64 flex flex-col gap-3">
            {filtered && (
              <Button
                type="primary"
                size="medium"
                onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
              >
                Clear filters
              </Button>
            )}
            {user && (
              <Button
                type="outline"
                size="medium"
                onClick={() => navigate("/createhabit")}
              >
                Create a habit
              </Button>
            )}
          </div>
        </div>
      ) : (
        SHELVES.map(({ section, title, blurb }) => (
          <Shelf
            key={section}
            title={title}
            blurb={blurb}
            shelf={sections[section]}
            onLoadMore={() =>
              dispatch(
                fetchShelf({
                  section,
                  filters: { category, language },
                  cursor: sections[section].nextCursor,
                }),
              )
            }
          />
        ))
      )}
    </div>
  );
}
