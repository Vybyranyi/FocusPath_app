import arrow_left from "@assets/images/icons/arrow-left.svg";
import calendar from "@assets/images/icons/calendar.svg";
import notification from "@assets/images/icons/notification.svg";
import IconButton from "@components/ui/IconButton";
import { useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import { useLocation, useNavigate } from "react-router";

interface HeaderConfig {
  mobile: {
    visible: boolean;
    title?: string;
    leftButtonIcon?: React.ReactNode;
    rightButtonIcon?: React.ReactNode;
    topContent?: boolean;
    profile?: boolean;
    segmentControl?: boolean;
    showWeekController?: boolean;
  };
  desktop: {
    visible: boolean;
    title?: string;
    leftButtonIcon?: React.ReactNode;
    rightButtonIcon?: React.ReactNode;
    topContent?: boolean;
    profile?: boolean;
    segmentControl?: boolean;
    showWeekController?: boolean;
  };
}

export const useResponsiveHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery({ query: "(min-width: 769px)" });

  const headerConfigs: Record<string, HeaderConfig> = useMemo(
    () => ({
      "/login": {
        mobile: {
          visible: true,
          title: "Continue with E-mail",
        },
        desktop: {
          visible: false,
        },
      },
      "/register": {
        mobile: {
          visible: true,
          title: "Create Account",
          leftButtonIcon: (
            <IconButton
              size="large"
              icon={arrow_left}
              onClick={() => navigate(-1)}
              // onClick={() => setStep(1)}
            />
          ),
        },
        desktop: {
          visible: false,
        },
      },
      "/main": {
        mobile: {
          visible: true,
          leftButtonIcon: <IconButton size="large" icon={calendar} />,
          rightButtonIcon: <IconButton size="large" icon={notification} />,
          topContent: true,
          profile: true,
          // segmentControl: false,
          showWeekController: true,
        },
        desktop: {
          visible: true,
          title: "Label Decktop",
          topContent: true,
          profile: true,
          // segmentControl: true,
          showWeekController: true,
        },
      },
      "/createhabit": {
        mobile: {
          visible: true,
          title: "Create Habit",
          leftButtonIcon: (
            <IconButton
              size="large"
              icon={arrow_left}
              onClick={() => navigate(-1)}
            />
          ),
        },
        desktop: {
          visible: true,
          leftButtonIcon: <IconButton size="large" icon={calendar} />,
          rightButtonIcon: <IconButton size="large" icon={notification} />,
          topContent: true,
          profile: true,
          // segmentControl: true,
        },
      },
      "/profile": {
        mobile: {
          visible: true,
          title: "Profile",
          leftButtonIcon: (
            <IconButton
              size="large"
              icon={arrow_left}
              onClick={() => navigate(-1)}
            />
          ),
        },
        desktop: {
          visible: true,
          leftButtonIcon: <IconButton size="large" icon={calendar} />,
          rightButtonIcon: <IconButton size="large" icon={notification} />,
          topContent: true,
          profile: true,
        },
      },
      "/stats": {
        mobile: {
          visible: true,
          title: "Activity",
          leftButtonIcon: (
            <IconButton
              size="large"
              icon={arrow_left}
              onClick={() => navigate(-1)}
            />
          ),
        },
        desktop: {
          visible: true,
          leftButtonIcon: <IconButton size="large" icon={calendar} />,
          rightButtonIcon: <IconButton size="large" icon={notification} />,
          topContent: true,
          profile: true,
        },
      },
    }),
    [navigate],
  );

  const currentConfig = headerConfigs[location.pathname];
  const activeConfig = isDesktop
    ? currentConfig?.desktop
    : currentConfig?.mobile;

  return activeConfig || { visible: false };
};
