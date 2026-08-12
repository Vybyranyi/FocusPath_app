import { Emoji } from "react-apple-emojis";
import { useNavigate } from "react-router";
import Button from "@components/ui/Button";

/**
 * Explore has been in the navigation from the start with no route behind it:
 * the path fell through to the catch-all and bounced the user back to the day
 * view, so the button looked broken rather than unfinished. This says which of
 * the two it is.
 */
export default function ExplorePage() {
  const navigate = useNavigate();

  return (
    <div className="page-gutter max-w-120 mx-auto pt-10 pb-28 md:pb-12 flex flex-col items-center text-center gap-4">
      <span className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center">
        <Emoji name="compass" className="w-8 h-8" />
      </span>

      <h1 className="display-5">Explore is on the way</h1>

      <p className="body-light text-ink-2 max-w-80">
        Ready-made habits to start from, and challenges you can join. Nothing to
        browse yet — for now, your own habits live on the day view.
      </p>

      <div className="w-full max-w-64 flex flex-col gap-3 pt-2">
        <Button type="primary" size="medium" onClick={() => navigate("/createhabit")}>
          Create a habit
        </Button>
        <Button type="outline" size="medium" onClick={() => navigate("/main")}>
          Back to today
        </Button>
      </div>
    </div>
  );
}
