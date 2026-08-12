import { cn } from "@/lib/utils";

interface FieldErrorProps {
  /** Nothing is rendered when absent, so callers need no conditional of their own. */
  message?: string;
  /** Lets the control point at this message with `aria-describedby`. */
  id?: string;
  className?: string;
}

/**
 * The message under a form control. Seven components had copied this same line,
 * and two of them had already drifted on spacing.
 *
 * `role="alert"` because the message appears after the fact — on blur or on a
 * rejected submit. Without it the only signal that something is wrong is a red
 * underline, which says nothing to a screen reader and nothing at all to
 * someone who cannot distinguish the colour.
 */
export default function FieldError({ message, id, className }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className={cn("alternative text-danger mt-1", className)}>
      {message}
    </p>
  );
}
