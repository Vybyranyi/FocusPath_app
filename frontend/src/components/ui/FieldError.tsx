import { cn } from "@/lib/utils";

interface FieldErrorProps {
  /** Nothing is rendered when absent, so callers need no conditional of their own. */
  message?: string;
  className?: string;
}

/**
 * The message under a form control. Seven components had copied this same line,
 * and two of them had already drifted on spacing.
 */
export default function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null;

  return <p className={cn("alternative text-error mt-1", className)}>{message}</p>;
}
