import { useMediaQuery } from "react-responsive";

/**
 * The one place the desktop threshold is written down.
 *
 * It used to be `769px` in three components while every Tailwind `md:` class
 * switched at `768px`. At exactly 768px the sidebar had already gone and the
 * desktop spacing had not yet arrived — a one-pixel band where the layout came
 * apart. Matching Tailwind's own breakpoint keeps JS and CSS in step.
 */
export const DESKTOP_QUERY = "(min-width: 768px)";

export const useIsDesktop = () => useMediaQuery({ query: DESKTOP_QUERY });
