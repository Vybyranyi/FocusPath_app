/**
 * A choice in a list — a select, a picker, a segmented control.
 *
 * The same pair had been declared separately in four components, each free to
 * drift from the others.
 */
export interface Option<TValue extends string = string> {
  label: string;
  value: TValue;
}
