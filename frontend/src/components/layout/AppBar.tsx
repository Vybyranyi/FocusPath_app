import plus from "@assets/images/icons/plus.svg";
import activity from "@assets/images/icons/activity.svg";
import activityActive from "@assets/images/icons/activity_active.svg";
import explore from "@assets/images/icons/explore.svg";
import exploreActive from "@assets/images/icons/explore_active.svg";
import home from "@assets/images/icons/home.svg";
import homeActive from "@assets/images/icons/home_active.svg";
import profile from "@assets/images/icons/profile.svg";
import profileActive from "@assets/images/icons/profile_active.svg";
import Button from "@components/ui/Button";
import MenuButton from "@components/ui/MenuButton";
import { useMediaQuery } from "react-responsive";
import { useNavigate, useLocation } from "react-router";

interface NavItem {
  icon: "home" | "explore" | "activity" | "profile";
  label: string;
  path: string;
  /** Home stays lit across its sub-routes; the rest match exactly. */
  isActive: (pathname: string) => boolean;
  inactiveIcon: string;
  activeIcon: string;
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
    inactiveIcon: home,
    activeIcon: homeActive,
  },
  {
    icon: "explore",
    label: "Explore",
    path: "/explore",
    isActive: (pathname) => pathname === "/explore",
    inactiveIcon: explore,
    activeIcon: exploreActive,
  },
  {
    icon: "activity",
    label: "Activity",
    path: "/stats",
    isActive: (pathname) => pathname === "/stats",
    inactiveIcon: activity,
    activeIcon: activityActive,
  },
  {
    icon: "profile",
    label: "Profile",
    path: "/profile",
    isActive: (pathname) => pathname === "/profile",
    inactiveIcon: profile,
    activeIcon: profileActive,
  },
];

const CREATE_PATH = "/createhabit";

/**
 * Navigation for both layouts. One component rather than two, so a destination
 * cannot exist on one and not the other, and only the layout that is actually
 * on screen subscribes to the router.
 */
export default function AppBar() {
  const isDesktop = useMediaQuery({ query: "(min-width: 769px)" });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (isDesktop) {
    return (
      <menu className="bg-surface shadow-[inset_-1px_0_0_#EAECF0] px-8 h-screen sticky top-0 left-0">
        <div className="flex flex-col gap-3 pt-[15vh]">
          <Button
            type="primary"
            size="medium"
            icon={plus}
            onClick={() => navigate(CREATE_PATH)}
          >
            New habbit
          </Button>

          {navItems.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Button
                key={item.path}
                type="outline"
                isActive={active}
                size="medium"
                icon={active ? item.activeIcon : item.inactiveIcon}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </menu>
    );
  }

  return (
    <menu
      className={[
        "flex justify-between items-center",
        "bg-surface border border-ink-faint rounded-full",
        "px-6 py-3",
        "fixed bottom-3 left-4 right-4 max-w-120 mx-auto z-10",
      ].join(" ")}
    >
      {navItems.slice(0, 2).map((item) => (
        <MenuButton
          key={item.path}
          icon={item.icon}
          active={item.isActive(pathname)}
          onClick={() => navigate(item.path)}
        />
      ))}

      <button
        onClick={() => navigate(CREATE_PATH)}
        className="w-10 h-10 bg-blue-gradient rounded-full p-2.5 mx-2"
      >
        <img src={plus} alt="add" />
      </button>

      {navItems.slice(2).map((item) => (
        <MenuButton
          key={item.path}
          icon={item.icon}
          active={item.isActive(pathname)}
          onClick={() => navigate(item.path)}
        />
      ))}
    </menu>
  );
}
