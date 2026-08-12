import { useCallback, useEffect, useState } from "react";
import {
  applyThemeChoice,
  readThemeChoice,
  storeThemeChoice,
  type ThemeChoice,
} from "@/lib/theme";

/**
 * Reads the stored choice and keeps the document in step with it.
 *
 * The attribute is already correct on first paint — an inline script in
 * `index.html` sets it before React loads, so the page never flashes the
 * wrong theme — and this only takes over once something changes it.
 */
export function useThemeChoice() {
  const [choice, setChoice] = useState<ThemeChoice>(readThemeChoice);

  useEffect(() => {
    applyThemeChoice(choice);
  }, [choice]);

  const chooseTheme = useCallback((next: ThemeChoice) => {
    storeThemeChoice(next);
    setChoice(next);
  }, []);

  return { choice, chooseTheme };
}
