import arrow_left from "@assets/images/icons/arrow-left.svg";
import IconButton from "@components/ui/IconButton";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useIsDesktop } from "@hooks/useIsDesktop";

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
  const isDesktop = useIsDesktop();

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
              label="Go back"
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
          // leftButtonIcon: <IconButton size="large" icon={calendar} />,
          // rightButtonIcon: <IconButton size="large" icon={notification} />,
          topContent: true,
          // profile: true,
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
              label="Go back"
              icon={arrow_left}
              onClick={() => navigate(-1)}
            />
          ),
        },
        desktop: {
          visible: true,
          // leftButtonIcon: <IconButton size="large" icon={calendar} />,
          // rightButtonIcon: <IconButton size="large" icon={notification} />,
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
              label="Go back"
              icon={arrow_left}
              onClick={() => navigate(-1)}
            />
          ),
        },
        // No header at all on desktop: the page opens with its own identity
        // block, and the header would repeat the same avatar and name a
        // hundred pixels above it.
        desktop: {
          visible: false,
        },
      },
      "/explore": {
        mobile: {
          visible: true,
          title: "Explore",
        },
        desktop: {
          visible: true,
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
              label="Go back"
              icon={arrow_left}
              onClick={() => navigate(-1)}
            />
          ),
        },
        desktop: {
          visible: true,
          // leftButtonIcon: <IconButton size="large" icon={calendar} />,
          // rightButtonIcon: <IconButton size="large" icon={notification} />,
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
