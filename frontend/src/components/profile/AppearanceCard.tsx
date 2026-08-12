import SegmentControl from "@components/ui/SegmentControl";
import { useThemeChoice } from "@hooks/useThemeChoice";
import type { ThemeChoice } from "@/lib/theme";

const segments = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

/**
 * Three named options rather than a light/dark switch.
 *
 * "Follow the device" is not a third preference bolted onto a binary — for
 * anyone whose phone dims itself in the evening it is the setting that does
 * the most work, and it is the one everybody starts on. A switch would have
 * to either drop it or express it as a second control, which is two widgets
 * for one decision.
 */
export default function AppearanceCard() {
  const { choice, chooseTheme } = useThemeChoice();

  return (
    <section className="bg-surface rounded-2xl shadow-lifted p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="title font-bold">Appearance</h2>
        <p className="alternative text-ink-2">
          System follows your device setting, so the app dims when it does.
        </p>
      </div>

      <SegmentControl
        segments={segments}
        defaultSelectedId={choice}
        label="Theme"
        onSelect={(id) => chooseTheme(id as ThemeChoice)}
      />
    </section>
  );
}
