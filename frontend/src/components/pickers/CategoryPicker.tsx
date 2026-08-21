import OptionPicker, { PreviewFrame } from "@components/pickers/OptionPicker";
import type { PlanCategory } from "@shared/index";
import { PLAN_CATEGORY_OPTIONS, PLAN_CATEGORY_TINTS } from "@/lib/planCategories";

export interface ICategoryPicker {
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: PlanCategory) => void;
  /** Names what the choice is for; "Category" unless a caller says otherwise. */
  caption?: string;
}

/**
 * The one place a category is chosen, on the same dropdown as colours and
 * icons. The list is closed on purpose — free text would put "Sport", "sport"
 * and "фітнес" in the collection as three different categories, and no filter
 * over that works.
 */
export default function CategoryPicker({ caption = "Category", ...props }: ICategoryPicker) {
  return (
    <OptionPicker
      {...props}
      options={PLAN_CATEGORY_OPTIONS}
      caption={caption}
      placeholder="Select category"
      renderPreview={(option) => (
        <PreviewFrame
          className={
            option ? PLAN_CATEGORY_TINTS[option.value] : "bg-accent-soft text-ink-muted"
          }
        >
          <span className="body-bold" aria-hidden>
            {option ? option.label.charAt(0) : "?"}
          </span>
        </PreviewFrame>
      )}
    />
  );
}
