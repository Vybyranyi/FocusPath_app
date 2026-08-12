import {
  ActivityIcon,
  ExploreIcon,
  HomeIcon,
  ProfileIcon,
} from "@components/icons/NavIcons";

/**
 * Lives apart from the components themselves so the icon module exports only
 * components — Fast Refresh gives up on a file that mixes the two.
 */
export const navIcons = {
  home: HomeIcon,
  explore: ExploreIcon,
  activity: ActivityIcon,
  profile: ProfileIcon,
} as const;

export type NavIconName = keyof typeof navIcons;
