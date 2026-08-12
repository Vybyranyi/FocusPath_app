import type { ReactNode } from "react";
import { useAppSelector } from "@store/hooks";
import { Emoji } from "react-apple-emojis";
import default_user from "@assets/images/default_user.png";
import SegmentControl from "@components/ui/SegmentControl";
import WeekSelector from "@components/layout/WeekSelector";

export interface IHeaderProps {
  title?: string;
  leftButtonIcon?: ReactNode;
  rightButtonIcon?: ReactNode;
  topContent?: boolean;
  profile?: boolean;
  segmentControl?: boolean;
  showWeekController?: boolean;
}

const segments = [
  { id: "1", label: "Habits" },
  { id: "2", label: "Challenges" },
];

export default function Header({
  title,
  leftButtonIcon,
  rightButtonIcon,
  topContent,
  profile,
  segmentControl,
  showWeekController,
}: IHeaderProps) {
  // Narrowed to the user: this header does not care about loading or errors.
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="bg-surface shadow-[inset_0_-1px_0_#EAECF0] pb-4 mb-3 md:mb-6">
      <div
        className={[
          "page-gutter flex flex-col gap-3",
          "md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-3 md:pt-8",
        ].join(" ")}
      >
        {/* Status bar — iOS safe area, hidden on desktop */}
        <div className="h-[max(env(safe-area-inset-top),59px)] md:hidden" />

        {/* Title row — visible only on mobile */}
        {(title || leftButtonIcon || rightButtonIcon) && (
          <div className="h-12 grid grid-cols-[auto_1fr_auto] items-center gap-2 md:hidden">
            {leftButtonIcon}
            <h5 className="display-5 text-center">{title}</h5>
            {rightButtonIcon}
          </div>
        )}

        {/* Greeting block */}
        {topContent && (
          <div className="h-12 flex items-center justify-between md:col-start-1">
            <div>
              <p className="title">
                {`Hi, ${user?.name}`}
                <Emoji name="waving hand" className="inline w-4.5 h-4.5 ml-1" />
              </p>
              <p className="body-light text-ink-muted mt-1">
                Let's make habits together!
              </p>
            </div>
            <Emoji
              name="smiling face with halo"
              className="w-6 h-6 bg-info-soft p-3 rounded-full md:hidden"
            />
          </div>
        )}

        {/* Profile block */}
        {profile && (
          <div className="flex gap-2 md:col-start-2 md:flex-row-reverse">
            <img
              src={user?.avatar || default_user}
              alt="User profile"
              className="w-14 h-14 rounded-full object-cover md:w-12 md:h-12"
            />
            <div className="flex items-center">
              <p className="title">{`${user?.name} ${user?.surname}`}</p>
              {/* <span className="inline-flex items-center gap-1 bg-warning-soft px-1 py-0.5 rounded-lg mt-1 md:mt-0">
                <img src={medal_gold} alt="" className="w-4 h-4" />
                <p className="body-bold text-warning">1452 Points</p>
              </span> */}
            </div>
            {/* Desktop action buttons */}
            <div className="hidden md:flex gap-2 mr-15">
              {leftButtonIcon}
              {rightButtonIcon}
            </div>
          </div>
        )}

        {/* Segment control */}
        {segmentControl && (
          <div className="md:col-start-1">
            <SegmentControl
              segments={segments}
              defaultSelectedId="1"
            />
          </div>
        )}

        {/* Week selector */}
        {showWeekController && (
          <div className="md:col-start-1">
            <WeekSelector />
          </div>
        )}
      </div>
    </header>
  );
}
