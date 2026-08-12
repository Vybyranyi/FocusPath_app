import AppBar from "@components/layout/AppBar";
import ResponsiveHeader from "@components/layout/ResponsiveHeader";
import type { ReactNode } from "react";
import { useMediaQuery } from "react-responsive";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isDesktop = useMediaQuery({ query: "(min-width: 769px)" });

  // Creating a habit hides the bar on mobile — the form needs the room — but
  // keeps it on desktop, where it sits beside the content.
  const hideOnMobile = ["/login", "/register", "/createhabit"].some((path) =>
    location.pathname.startsWith(path),
  );
  const hideOnDesktop = ["/login", "/register"].some((path) =>
    location.pathname.startsWith(path),
  );
  const hidden = isDesktop ? hideOnDesktop : hideOnMobile;

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-canvas",
        !(hideOnMobile && hideOnDesktop) &&
          "md:grid md:grid-cols-[minmax(160px,240px)_1fr]",
      )}
    >
      <a
        href="#main"
        className={cn(
          "sr-only focus:not-sr-only",
          "focus:fixed focus:top-3 focus:left-3 focus:z-50",
          "focus:bg-surface focus:text-ink focus:body-bold",
          "focus:px-4 focus:py-3 focus:rounded-xl focus:shadow-lifted",
        )}
      >
        Skip to content
      </a>

      {!hidden && <AppBar />}

      <div className="w-full max-w-full box-border">
        <ResponsiveHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
