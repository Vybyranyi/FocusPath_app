import type { PlanCategory } from "@shared/index";
import Select from "@components/ui/Select";
import { PLAN_CATEGORY_OPTIONS } from "@/lib/planCategories";
import { ANY_LANGUAGE, PLAN_LANGUAGE_OPTIONS } from "@/lib/planLanguages";

export interface IPlanFiltersProps {
  category?: PlanCategory;
  language: string;
  onCategoryChange: (category?: PlanCategory) => void;
  onLanguageChange: (language: string) => void;
}

const ANY_CATEGORY = "";

/**
 * Category and language, and nothing else.
 *
 * There is no search box in this version. At a few hundred plans the shelves
 * plus these two filters beat a search field, and searching the day-by-day
 * content would be actively worse: a query of "10" would catch "Practise 10
 * verbs" in fifty unrelated plans.
 */
export default function PlanFilters({
  category,
  language,
  onCategoryChange,
  onLanguageChange,
}: IPlanFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Category"
        placeholder="All categories"
        value={category ?? ANY_CATEGORY}
        options={[
          { value: ANY_CATEGORY, label: "All categories" },
          ...PLAN_CATEGORY_OPTIONS,
        ]}
        onChange={(event) =>
          onCategoryChange(
            event.target.value === ANY_CATEGORY
              ? undefined
              : (event.target.value as PlanCategory),
          )
        }
      />

      <Select
        label="Language"
        placeholder="All languages"
        value={language}
        options={[...PLAN_LANGUAGE_OPTIONS]}
        onChange={(event) => onLanguageChange(event.target.value || ANY_LANGUAGE)}
      />
    </div>
  );
}
