import type { PlanSummary } from "@shared/index";
import { cn } from "@/lib/utils";

const SealIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * The two badges a plan can carry, and they are deliberately different things:
 * `official` means the project seeded and read it, `proven` means a person
 * finished it. Merging them into one "trusted" mark would be dishonest in both
 * directions, so they never share a shape or a colour.
 *
 * Each carries an icon and a word. Colour alone would leave the distinction
 * invisible to anyone who cannot separate the two hues.
 */
export function PlanBadges({ plan }: { plan: Pick<PlanSummary, "official" | "proven"> }) {
  if (!plan.official && !plan.proven) return null;

  return (
    <>
      {plan.official && (
        <span className="chip inline-flex items-center gap-1 px-2 py-1 rounded-full leading-none bg-accent-soft text-accent">
          <SealIcon />
          Official
        </span>
      )}
      {plan.proven && (
        <span className="chip inline-flex items-center gap-1 px-2 py-1 rounded-full leading-none bg-success-soft text-success">
          <CheckIcon />
          Walked by its author
        </span>
      )}
    </>
  );
}

/**
 * What the clone statistics say, including when they say nothing.
 *
 * The absence of a number is rendered as its own honest state rather than as
 * "0%": below ten takers the figure would be either 100% or 0% and would
 * describe the sample, not the plan.
 */
export function CompletionStat({
  plan,
  className,
}: {
  plan: Pick<PlanSummary, "cloneCount" | "completionRate">;
  className?: string;
}) {
  if (plan.completionRate === undefined) {
    return (
      <p className={cn("alternative text-ink-muted", className)}>
        {plan.cloneCount === 0
          ? "Nobody has taken this yet"
          : `${plan.cloneCount} ${plan.cloneCount === 1 ? "person has" : "people have"} taken this — too few to score`}
      </p>
    );
  }

  return (
    <p className={cn("alternative text-ink-2", className)}>
      <span className="body-bold text-ink">{plan.completionRate}%</span> of the{" "}
      {plan.cloneCount} people who took this finished it
    </p>
  );
}
