import type { Option } from "@/types/ui";

/**
 * The languages the filter offers, by ISO 639-1 tag.
 *
 * A short list rather than every code the detector might produce: a select with
 * two hundred entries, most of which match nothing in the library, is worse
 * than one with the handful people actually browse in. Anything outside it is
 * still reachable through "All languages".
 */
export const PLAN_LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  uk: "Українська",
  pl: "Polski",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
};

/** The empty value means "do not filter by language at all". */
export const ANY_LANGUAGE = "";

export const PLAN_LANGUAGE_OPTIONS: readonly Option[] = [
  { value: ANY_LANGUAGE, label: "All languages" },
  ...Object.entries(PLAN_LANGUAGE_LABELS).map(([value, label]) => ({ value, label })),
];

export const languageLabel = (tag: string): string =>
  PLAN_LANGUAGE_LABELS[tag] ?? tag.toUpperCase();

/**
 * What the filter starts on: the language the interface is being read in.
 *
 * Someone browsing a library of written plans wants the ones they can read, and
 * the browser already knows which those are. It is a starting point, not a
 * cage — the filter is right there.
 */
export const interfaceLanguage = (): string => {
  const tag = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2);
  return tag in PLAN_LANGUAGE_LABELS ? tag : "en";
};
