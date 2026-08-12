/**
 * The four destination icons, inline rather than loaded as `<img>`.
 *
 * They used to ship as eight files — an active and an inactive copy of each,
 * differing only in which two hex values they were painted with. That made
 * them impossible to theme: the inactive fill was `#EAECF0`, which is 1.2:1
 * on white and inverted its meaning in dark mode, where it read brighter than
 * the active blue.
 *
 * Drawn in `currentColor` there is one copy of each shape and the state is
 * just a text colour. The duotone reading survives because the broad shape
 * keeps a lower opacity than the detail sitting on it.
 */

interface NavIconProps {
  className?: string;
}

const TINT = 0.3;

export function HomeIcon({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.14373 20.7821V17.7152C9.14372 16.9381 9.77567 16.3067 10.5584 16.3018H13.4326C14.2189 16.3018 14.8563 16.9346 14.8563 17.7152V20.7732C14.8562 21.4473 15.404 21.9951 16.0829 22H18.0438C18.9596 22.0023 19.8388 21.6428 20.4872 21.0007C21.1356 20.3586 21.5 19.4868 21.5 18.5775V9.86585C21.5 9.13139 21.1721 8.43471 20.6046 7.9635L13.943 2.67427C12.7785 1.74912 11.1154 1.77901 9.98539 2.74538L3.46701 7.9635C2.87274 8.42082 2.51755 9.11956 2.5 9.86585V18.5686C2.5 20.4637 4.04738 22 5.95617 22H7.87229C8.19917 22.0023 8.51349 21.8751 8.74547 21.6464C8.97746 21.4178 9.10793 21.1067 9.10792 20.7821H9.14373Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ExploreIcon({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 11.9999C22 17.5229 17.523 21.9999 12 21.9999C6.477 21.9999 2 17.5229 2 11.9999C2 6.47788 6.477 1.99988 12 1.99988C17.523 1.99988 22 6.47788 22 11.9999Z"
        fill="currentColor"
        fillOpacity={TINT}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.8597 8.70487L14.2397 13.8249C14.1797 14.0349 14.0097 14.2049 13.7997 14.2659L8.69972 15.8649C8.35972 15.9759 8.02972 15.6449 8.13972 15.3049L9.73972 10.1749C9.79972 9.96487 9.96972 9.80487 10.1797 9.73487L15.2997 8.13487C15.6497 8.02487 15.9697 8.35487 15.8597 8.70487Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ActivityIcon({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.2608 9.84822C8.50756 8.70072 10.1719 8 12 8C13.828 8 15.4924 8.70072 16.7391 9.84822L19.81 4.21828C20.3552 3.21872 19.6318 2 18.4932 2H15.1768C14.4505 2 13.7812 2.39378 13.4285 3.02871L11.9999 5.60016L10.5714 3.02871C10.2186 2.39378 9.54937 2 8.82304 2H5.50676C4.36817 2 3.6447 3.21872 4.18992 4.21828L7.2608 9.84822Z"
        fill="currentColor"
        fillOpacity={TINT}
      />
      <path
        d="M19 15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15C5 11.134 8.13401 8 12 8C15.866 8 19 11.134 19 15Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17Z"
        fill="var(--surface)"
      />
    </svg>
  );
}

export function ProfileIcon({ className }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9968 12.5837C14.9348 12.5837 17.2888 10.2287 17.2888 7.29169C17.2888 4.35469 14.9348 1.99969 11.9968 1.99969C9.05983 1.99969 6.70483 4.35469 6.70483 7.29169C6.70483 10.2287 9.05983 12.5837 11.9968 12.5837Z"
        fill="currentColor"
        fillOpacity={TINT}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9968 15.1746C7.68376 15.1746 3.99976 15.8546 3.99976 18.5746C3.99976 21.2956 7.66076 21.9996 11.9968 21.9996C16.3098 21.9996 19.9938 21.3206 19.9938 18.5996C19.9938 15.8786 16.3338 15.1746 11.9968 15.1746Z"
        fill="currentColor"
      />
    </svg>
  );
}
