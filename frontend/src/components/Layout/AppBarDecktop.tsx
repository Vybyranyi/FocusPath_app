import activity from "@assets/images/icons/activity.svg";
import activityActive from "@assets/images/icons/activity_active.svg";
import explore from "@assets/images/icons/explore.svg";
import home from "@assets/images/icons/home.svg";
import homeActive from "@assets/images/icons/home_active.svg";
import plus from "@assets/images/icons/plus.svg";
import profile from "@assets/images/icons/profile.svg";
import profileActive from "@assets/images/icons/profile_active.svg";
import Button from "@components/ui/Button";
import { useMediaQuery } from "react-responsive";
import { useNavigate, useLocation } from "react-router";

export default function AppBarDecktop() {
  const isDesktop = useMediaQuery({ query: "(min-width: 769px)" });
  const navigate = useNavigate();
  const location = useLocation();

  if (!isDesktop) return null;

  const isHome = location.pathname.startsWith("/main");
  const isActivity = location.pathname === "/stats";
  const isProfile = location.pathname === "/profile";

  return (
    <menu className="bg-base-white shadow-[inset_-1px_0_0_#EAECF0] px-8 h-screen sticky top-0 left-0">
      <div className="flex flex-col gap-3 pt-[15vh]">
        <Button
          type="primary"
          size="medium"
          icon={plus}
          onClick={() => navigate("/createhabit")}
        >
          New habbit
        </Button>
        <Button
          type={isHome ? "primary" : "outline"}
          size="medium"
          icon={isHome ? homeActive : home}
          onClick={() => navigate("/main")}
        >
          Home
        </Button>
        <Button type="outline" size="medium" icon={explore}>
          Explore
        </Button>
        <Button
          type={isActivity ? "primary" : "outline"}
          size="medium"
          icon={isActivity ? activityActive : activity}
          onClick={() => navigate("/stats")}
        >
          Activity
        </Button>
        <Button
          type={isProfile ? "primary" : "outline"}
          size="medium"
          icon={isProfile ? profileActive : profile}
          onClick={() => navigate("/profile")}
        >
          Profile
        </Button>
      </div>
    </menu>
  );
}
