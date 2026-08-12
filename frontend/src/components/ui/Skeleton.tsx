import { cn } from "@/lib/utils";

/**
 * A placeholder with the shape of the thing that is coming.
 *
 * Loading used to replace the list with the single line "Loading habits...",
 * so the page height collapsed and then jumped back when the data arrived.
 * The shape of the list is known before the response is, so it can be drawn.
 *
 * `aria-hidden` on purpose: the live region announcing "Loading" is the
 * accessible signal, and reading out a dozen empty boxes is not useful.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-line rounded-lg animate-pulse", className)}
    />
  );
}

/** One habit card's worth of placeholder, matching its real height. */
export function HabitCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface ring-1 ring-inset ring-line">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="w-11 h-11 rounded-full shrink-0" />
    </div>
  );
}
