import activity from "@assets/images/icons/activity.svg";
import explore from "@assets/images/icons/explore.svg";
import home from "@assets/images/icons/home.svg";
import plus from "@assets/images/icons/plus.svg";
import profile from "@assets/images/icons/profile.svg";
import Button from "@components/ui/Button";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router";

export default function AppBarDecktop() {
  const isDesktop = useMediaQuery({ query: "(min-width: 769px)" });
  const navigate = useNavigate();

  if (!isDesktop) return null;

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
          type="outline"
          size="medium"
          icon={home}
          onClick={() => navigate("/main")}
        >
          Home
        </Button>
        <Button type="outline" size="medium" icon={explore}>
          Explore
        </Button>
        <Button type="outline" size="medium" icon={activity}>
          Activity
        </Button>
        <Button type="outline" size="medium" icon={profile}>
          Profile
        </Button>
      </div>
    </menu>
  );
}
