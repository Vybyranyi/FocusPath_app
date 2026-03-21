import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Emoji } from 'react-apple-emojis';
import { cn } from '@/lib/utils';

export interface IEmojiOption {
  label: string;
  value: string;
  emoji: string;
}

const defaultEmojiOptions: IEmojiOption[] = [
  { label: 'Running',     value: 'person running',           emoji: 'person running' },
  { label: 'Gym',         value: 'person lifting weights',   emoji: 'person lifting weights' },
  { label: 'Meditation',  value: 'person in lotus position', emoji: 'person in lotus position' },
  { label: 'Biking',      value: 'bicycle',                  emoji: 'bicycle' },
  { label: 'Walking',     value: 'footprints',               emoji: 'footprints' },
  { label: 'Basketball',  value: 'basketball',               emoji: 'basketball' },
  { label: 'Soccer',      value: 'soccer ball',              emoji: 'soccer ball' },
  { label: 'Writing',     value: 'pencil',                   emoji: 'pencil' },
  { label: 'Studying',    value: 'notebook',                 emoji: 'notebook' },
  { label: 'Coding',      value: 'laptop',                   emoji: 'laptop' },
  { label: 'Reading',     value: 'books',                    emoji: 'books' },
  { label: 'Cooking',     value: 'cooking',                  emoji: 'cooking' },
  { label: 'Coffee',      value: 'hot beverage',             emoji: 'hot beverage' },
  { label: 'Vegetables',  value: 'broccoli',                 emoji: 'broccoli' },
  { label: 'Fruit',       value: 'banana',                   emoji: 'banana' },
  { label: 'Sleeping',    value: 'bed',                      emoji: 'bed' },
  { label: 'Relaxing',    value: 'person getting massage',   emoji: 'person getting massage' },
  { label: 'Shopping',    value: 'shopping bags',            emoji: 'shopping bags' },
  { label: 'Money',       value: 'money bag',                emoji: 'money bag' },
  { label: 'Cleaning',    value: 'broom',                    emoji: 'broom' },
  { label: 'Plant Care',  value: 'seedling',                 emoji: 'seedling' },
  { label: 'Dog',         value: 'dog face',                 emoji: 'dog face' },
  { label: 'Cat',         value: 'cat face',                 emoji: 'cat face' },
  { label: 'Travel',      value: 'globe showing americas',   emoji: 'globe showing americas' },
  { label: 'Map',         value: 'world map',                emoji: 'world map' },
  { label: 'Water Drop',  value: 'droplet',                  emoji: 'droplet' },
  { label: 'Fire',        value: 'fire',                     emoji: 'fire' },
  { label: 'Star',        value: 'star',                     emoji: 'star' },
  { label: 'Heart',       value: 'red heart',                emoji: 'red heart' },
  { label: 'Checkmark',   value: 'check mark',               emoji: 'check mark' },
  { label: 'Trophy',      value: 'trophy',                   emoji: 'trophy' },
  { label: 'Book',        value: 'open book',                emoji: 'open book' },
  { label: 'Apple',       value: 'red apple',                emoji: 'red apple' },
  { label: 'Clock',       value: 'alarm clock',              emoji: 'alarm clock' },
  { label: 'Smile',       value: 'smiling face',             emoji: 'smiling face' },
  { label: 'Moon',        value: 'crescent moon',            emoji: 'crescent moon' },
  { label: 'Sun',         value: 'sun',                      emoji: 'sun' },
  { label: 'Music',       value: 'musical note',             emoji: 'musical note' },
  { label: 'Camera',      value: 'camera',                   emoji: 'camera' },
  { label: 'Car',         value: 'automobile',               emoji: 'automobile' },
  { label: 'Plane',       value: 'airplane',                 emoji: 'airplane' },
  { label: 'Home',        value: 'house',                    emoji: 'house' },
];

export interface IEmojiPicker {
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function EmojiPicker({ disabled, error, value, onChange }: IEmojiPicker) {
  const [open, setOpen] = useState(false);
  const selected = defaultEmojiOptions.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-1">
      <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
        <Popover.Trigger asChild>
          <div
            className={cn(
              'flex items-center gap-3 bg-base-white p-4 rounded-2xl',
              'ring-card transition-all duration-200 cursor-pointer',
              'hover:ring-card-hover',
              open && 'ring-card-focus',
              disabled && 'cursor-not-allowed opacity-60 hover:ring-card',
            )}
          >
            {/* Emoji preview */}
            <span className="w-9 h-9 rounded-xl shrink-0 inline-flex items-center justify-center bg-primary-blue-10 border border-primary-black-10">
              {selected
                ? <Emoji name={selected.emoji} className="w-6 h-6" />
                : <span className="text-primary-black-40 text-lg font-bold">?</span>
              }
            </span>
            <div>
              <p className="body-bold">{selected?.label ?? 'Select Icon'}</p>
              <p className="alternative text-primary-black-40">Icon</p>
            </div>
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align="start"
            className={cn(
              'bg-base-white rounded-2xl ring-card p-2 z-50',
              'max-h-72 overflow-y-auto w-(--radix-popover-trigger-width)',
              'shadow-medium',
              'animate-in fade-in-0 zoom-in-95 duration-150',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            )}
          >
            {defaultEmojiOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange?.(opt.value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer',
                  'transition-colors duration-150 hover:bg-primary-black-10',
                  value === opt.value && 'bg-primary-blue-10',
                )}
              >
                <span className="w-9 h-9 rounded-xl shrink-0 inline-flex items-center justify-center bg-primary-blue-10 border border-primary-black-10">
                  <Emoji name={opt.emoji} className="w-6 h-6" />
                </span>
                <p className="body-bold">{opt.label}</p>
              </button>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <p className="alternative text-error mt-1">{error}</p>}
    </div>
  );
}
