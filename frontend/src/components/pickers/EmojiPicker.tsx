import { Emoji } from 'react-apple-emojis';
import OptionPicker, { PreviewFrame } from "@components/pickers/OptionPicker";
import type { Option } from "@/types/ui";

// Each icon's value is the emoji's own name, so no second field is needed to
// carry it — the previous table stored the same string twice per row.
const emojiOptions: readonly Option[] = [
  { label: 'Running', value: 'person running' },
  { label: 'Gym', value: 'person lifting weights' },
  { label: 'Meditation', value: 'person in lotus position' },
  { label: 'Biking', value: 'bicycle' },
  { label: 'Walking', value: 'footprints' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Soccer', value: 'soccer ball' },
  { label: 'Writing', value: 'pencil' },
  { label: 'Studying', value: 'notebook' },
  { label: 'Coding', value: 'laptop' },
  { label: 'Reading', value: 'books' },
  { label: 'Cooking', value: 'cooking' },
  { label: 'Coffee', value: 'hot beverage' },
  { label: 'Vegetables', value: 'broccoli' },
  { label: 'Fruit', value: 'banana' },
  { label: 'Sleeping', value: 'bed' },
  { label: 'Relaxing', value: 'person getting massage' },
  { label: 'Shopping', value: 'shopping bags' },
  { label: 'Money', value: 'money bag' },
  { label: 'Cleaning', value: 'broom' },
  { label: 'Plant Care', value: 'seedling' },
  { label: 'Dog', value: 'dog face' },
  { label: 'Cat', value: 'cat face' },
  { label: 'Travel', value: 'globe showing americas' },
  { label: 'Map', value: 'world map' },
  { label: 'Water Drop', value: 'droplet' },
  { label: 'Fire', value: 'fire' },
  { label: 'Star', value: 'star' },
  { label: 'Heart', value: 'red heart' },
  { label: 'Checkmark', value: 'check mark' },
  { label: 'Trophy', value: 'trophy' },
  { label: 'Book', value: 'open book' },
  { label: 'Apple', value: 'red apple' },
  { label: 'Clock', value: 'alarm clock' },
  { label: 'Smile', value: 'smiling face' },
  { label: 'Moon', value: 'crescent moon' },
  { label: 'Sun', value: 'sun' },
  { label: 'Music', value: 'musical note' },
  { label: 'Camera', value: 'camera' },
  { label: 'Car', value: 'automobile' },
  { label: 'Plane', value: 'airplane' },
  { label: 'Home', value: 'house' },
];

export interface IEmojiPicker {
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function EmojiPicker(props: IEmojiPicker) {
  return (
    <OptionPicker
      {...props}
      options={emojiOptions}
      caption="Icon"
      placeholder="Select Icon"
      maxHeightClassName="max-h-72"
      renderPreview={(option) => (
        <PreviewFrame className="bg-accent-soft">
          {option ? (
            <Emoji name={option.value} className="w-6 h-6" />
          ) : (
            <span className="text-ink-muted text-lg font-bold">?</span>
          )}
        </PreviewFrame>
      )}
    />
  );
}
