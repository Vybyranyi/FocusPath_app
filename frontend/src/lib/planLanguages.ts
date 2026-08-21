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
 * The filter starts on every language.
 *
 * It used to open on the language of the interface, which was a good guess and
 * a bad default: it silently hid most of a library that is small to begin with,
 * and someone who reads two languages saw half of it without being told why.
 * Narrowing is one click away; noticing that something was hidden is not.
 */
export const DEFAULT_LANGUAGE = ANY_LANGUAGE;
