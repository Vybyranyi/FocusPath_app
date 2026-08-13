import type { PlanCategory } from "@shared/index";
import type { Option } from "@/types/ui";

/**
 * The client's own copy of the category list.
 *
 * It has to be a copy: the runtime array lives on the server, next to the
 * model, because `shared/` holds declaration files only and cannot carry a
 * value. What keeps the two from drifting silently is the shape — a `Record`
 * over the union is checked for completeness, so a category added to
 * `PlanCategory` and forgotten here is a type error rather than a filter that
 * quietly matches nothing in production. A plain array would give no such
 * guarantee.
 */
export const PLAN_CATEGORY_LABELS: Record<PlanCategory, string> = {
  health: "Health",
  fitness: "Fitness",
  mind: "Mind",
  learning: "Learning",
  productivity: "Productivity",
  money: "Money",
  sleep: "Sleep",
  nutrition: "Nutrition",
  digital: "Digital habits",
  social: "Relationships",
  creativity: "Creativity",
  other: "Other",
};

/** Ground for each category's chip, from the palette the app already has. */
export const PLAN_CATEGORY_TINTS: Record<PlanCategory, string> = {
  health: "bg-success-soft text-success",
  fitness: "bg-s-orange-soft text-s-orange",
  mind: "bg-s-purple-soft text-s-purple",
  learning: "bg-accent-soft text-accent",
  productivity: "bg-info-soft text-info",
  money: "bg-warning-soft text-warning",
  sleep: "bg-s-purple-soft text-s-purple",
  nutrition: "bg-success-soft text-success",
  digital: "bg-info-soft text-info",
  social: "bg-danger-soft text-danger",
  creativity: "bg-s-teal-soft text-s-teal",
  other: "bg-surface-2 text-ink-2",
};

export const PLAN_CATEGORIES = Object.keys(PLAN_CATEGORY_LABELS) as PlanCategory[];

export const PLAN_CATEGORY_OPTIONS: readonly Option<PlanCategory>[] =
  PLAN_CATEGORIES.map((value) => ({ value, label: PLAN_CATEGORY_LABELS[value] }));

export const isPlanCategory = (value: string): value is PlanCategory =>
  Object.prototype.hasOwnProperty.call(PLAN_CATEGORY_LABELS, value);

/** The label for a category, falling back to the raw value for anything older. */
export const categoryLabel = (value?: string): string =>
  value && isPlanCategory(value) ? PLAN_CATEGORY_LABELS[value] : (value ?? "");
