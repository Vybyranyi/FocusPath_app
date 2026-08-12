import { navIcons, type NavIconName } from "@components/icons/navIconMap";
import { cn } from "@/lib/utils";

export interface IMenuButton {
  icon: NavIconName;
  /** What the destination is called. Becomes the button's accessible name. */
  label: string;
  active?: boolean;
  dot?: boolean;
  onClick?: () => void;
}

export default function MenuButton({
  icon,
  label,
  active,
  dot,
  onClick,
}: IMenuButton) {
  const Icon = navIcons[icon];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      // The bar is the app's primary navigation and every target in it was
      // 24x24 — about a third of the recommended area. The icon keeps its
      // size; the button grows around it.
      className={cn(
        "relative inline-flex items-center justify-center",
        "min-w-11 min-h-11 rounded-xl cursor-pointer",
        "transition-colors duration-(--duration-base)",
        active ? "text-accent" : "text-ink-muted hover:text-ink-2",
      )}
    >
      <Icon className="w-6 h-6" />
      {dot && (
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"
          aria-hidden
        />
      )}
    </button>
  );
}
