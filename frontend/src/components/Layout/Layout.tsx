import AppBarDecktop from "@components/layout/AppBarDecktop";
import AppBarMobile from "@components/layout/AppBarMobile";
import ResponsiveHeader from "@components/layout/ResponsiveHeader";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const hideMobileBar = ["/login", "/register", "/createhabit"].some((p) =>
    location.pathname.startsWith(p),
  );
  const hideDesktopBar = ["/login", "/register"].some((p) =>
    location.pathname.startsWith(p),
  );
  const bothHidden = hideMobileBar && hideDesktopBar;

  return (
    <div
      className={cn(
        "min-h-screen w-full bg-base-bg",
        !bothHidden && "md:grid md:grid-cols-[minmax(160px,240px)_1fr]",
      )}
    >
      {!hideMobileBar && <AppBarMobile />}
      {!hideDesktopBar && <AppBarDecktop />}

      <div className="w-full max-w-full box-border">
        <ResponsiveHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
