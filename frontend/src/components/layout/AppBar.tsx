import plus from "@assets/images/icons/plus.svg";
import Button from "@components/ui/Button";
import MenuButton from "@components/ui/MenuButton";
import { navIcons, type NavIconName } from "@components/icons/navIconMap";
import { useMediaQuery } from "react-responsive";
import { useNavigate, useLocation } from "react-router";

interface NavItem {
  icon: NavIconName;
  label: string;
  path: string;
  /** Home stays lit across its sub-routes; the rest match exactly. */
  isActive: (pathname: string) => boolean;
}

/**
 * The one list of destinations.
 *
 * Mobile and desktop each used to carry their own copy, and they had already
 * drifted: the mobile Explore button was rendered with no handler at all, so it
 * did nothing when tapped.
 */
const navItems: readonly NavItem[] = [
  {
    icon: "home",
    label: "Home",
    path: "/main",
    isActive: (pathname) => pathname.startsWith("/main"),
  },
  {
    icon: "explore",
    label: "Explore",
    path: "/explore",
    isActive: (pathname) => pathname === "/explore",
  },
  {
    icon: "activity",
    label: "Activity",
    path: "/stats",
    isActive: (pathname) => pathname === "/stats",
  },
  {
    icon: "profile",
    label: "Profile",
    path: "/profile",
    isActive: (pathname) => pathname === "/profile",
  },
];

const CREATE_PATH = "/createhabit";
const CREATE_LABEL = "New habit";

/**
 * Navigation for both layouts. One component rather than two, so a destination
 * cannot exist on one and not the other, and only the layout that is actually
 * on screen subscribes to the router.
 *
 * This was a `<menu>`, which the spec defines as a list and which expects
 * `<li>` children rather than a run of buttons, and nothing told a screen
 * reader which destination was the current one.
 */
export default function AppBar() {
  const isDesktop = useMediaQuery({ query: "(min-width: 769px)" });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (isDesktop) {
    return (
      <nav
        aria-label="Main"
        className="bg-surface shadow-[inset_-1px_0_0_var(--line)] px-8 h-screen sticky top-0 left-0"
      >
        <div className="flex flex-col gap-3 pt-[15vh]">
          <Button
            type="primary"
            size="medium"
            icon={plus}
            onClick={() => navigate(CREATE_PATH)}
          >
            {CREATE_LABEL}
          </Button>

          <ul className="contents">
            {navItems.map((item) => {
              const active = item.isActive(pathname);
              const Icon = navIcons[item.icon];
              return (
                <li key={item.path} className="contents">
                  <Button
                    type="outline"
                    isActive={active}
                    current={active}
                    size="medium"
                    iconNode={
                      <Icon
                        className={active ? "w-5 h-5 text-accent" : "w-5 h-5 text-ink-muted"}
                      />
                    }
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main"
      className={[
        "bg-surface border border-line-strong rounded-full",
        "px-4 py-2",
        "fixed bottom-3 left-4 right-4 max-w-120 mx-auto z-10",
      ].join(" ")}
    >
      <ul className="flex justify-between items-center">
        {navItems.slice(0, 2).map((item) => (
          <li key={item.path}>
            <MenuButton
              icon={item.icon}
              label={item.label}
              active={item.isActive(pathname)}
              onClick={() => navigate(item.path)}
            />
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => navigate(CREATE_PATH)}
            aria-label={CREATE_LABEL}
            className="inline-flex items-center justify-center w-12 h-12 bg-blue-gradient rounded-full mx-2 cursor-pointer"
          >
            <img src={plus} alt="" aria-hidden className="w-5 h-5" />
          </button>
        </li>

        {navItems.slice(2).map((item) => (
          <li key={item.path}>
            <MenuButton
              icon={item.icon}
              label={item.label}
              active={item.isActive(pathname)}
              onClick={() => navigate(item.path)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
