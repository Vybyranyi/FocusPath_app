import CircleLoader from "@components/habit/CircleLoader";
import { Emoji } from "react-apple-emojis";

export default function ProgressBanner() {
  return (
    <div className="bg-blue-gradient flex items-center gap-3 p-4 rounded-2xl">
      <CircleLoader percentages={56} isWhite />
      <div>
        <p className="body-bold text-base-white mb-1 flex items-center gap-1.5">
          Your daily goals almost done!
          <Emoji name="fire" className="w-3 h-3" />
        </p>
        <p className="alternative text-primary-blue-40">1 of 4 completed</p>
      </div>
    </div>
  );
}
