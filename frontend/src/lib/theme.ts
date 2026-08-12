/**
 * Which theme the user asked for, as distinct from which one they get.
 *
 * The stylesheet already understood three states before anything could set
 * them: no `data-theme` attribute means "follow the device", and an explicit
 * `light` or `dark` overrides it in either direction. Nothing had ever
 * written the attribute, so "follow the device" was the only reachable state.
 *
 * `system` is stored as the *absence* of the attribute rather than as
 * `data-theme="system"`. The CSS keys on `:root:not([data-theme="light"])`
 * inside its media query, so a literal "system" value would happen to work —
 * but only by accident of not being the string "light", which is not a
 * property worth depending on.
 */
export type ThemeChoice = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "focuspath:theme";

export const isThemeChoice = (value: unknown): value is ThemeChoice =>
  value === "light" || value === "dark" || value === "system";

export function readThemeChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(stored) ? stored : "system";
  } catch {
    // Private browsing modes throw on access rather than returning null.
    return "system";
  }
}

export function applyThemeChoice(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
}

export function storeThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Nothing to do: the choice still applies for this session.
  }
}
