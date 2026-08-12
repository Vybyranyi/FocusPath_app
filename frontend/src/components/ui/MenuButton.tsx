import activity from "@assets/images/icons/activity.svg";
import activityActive from "@assets/images/icons/activity_active.svg";
import explore from "@assets/images/icons/explore.svg";
import exploreActive from "@assets/images/icons/explore_active.svg";
import home from "@assets/images/icons/home.svg";
import homeActive from "@assets/images/icons/home_active.svg";
import profile from "@assets/images/icons/profile.svg";
import profileActive from "@assets/images/icons/profile_active.svg";

const iconsMap = {
  home: { default: home, active: homeActive },
  explore: { default: explore, active: exploreActive },
  activity: { default: activity, active: activityActive },
  profile: { default: profile, active: profileActive },
};

export interface IMenuButton {
  icon: keyof typeof iconsMap;
  active?: boolean;
  dot?: boolean;
  onClick?: () => void;
}

export default function MenuButton({
  icon,
  active,
  dot,
  onClick,
}: IMenuButton) {
  return (
    <button className="relative w-6 h-6 cursor-pointer" onClick={onClick}>
      <img
        src={active ? iconsMap[icon].active : iconsMap[icon].default}
        alt={icon}
        className="w-6 h-6"
      />
      {dot && (
        <span className="absolute -top-1.25 -right-1.25 w-2 h-2 bg-danger rounded-full" />
      )}
    </button>
  );
}
