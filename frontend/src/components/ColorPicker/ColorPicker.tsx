import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export type ColorOption =
  | 'white' | 'orange' | 'blue' | 'lightblue'
  | 'red' | 'yellow' | 'green' | 'purple' | 'teal';

export interface IColorOption {
  label: string;
  value: ColorOption;
}

const defaultColorOptions: IColorOption[] = [
  { label: 'White',      value: 'white' },
  { label: 'Orange',     value: 'orange' },
  { label: 'Blue',       value: 'blue' },
  { label: 'Light Blue', value: 'lightblue' },
  { label: 'Red',        value: 'red' },
  { label: 'Yellow',     value: 'yellow' },
  { label: 'Green',      value: 'green' },
  { label: 'Purple',     value: 'purple' },
  { label: 'Teal',       value: 'teal' },
];

const swatchBg: Record<ColorOption, string> = {
  white:     'bg-base-white border border-primary-black-20',
  orange:    'bg-s-orange-20',
  blue:      'bg-primary-blue-20',
  lightblue: 'bg-blue-info-20',
  red:       'bg-error-20',
  yellow:    'bg-warning-20',
  green:     'bg-success-20',
  purple:    'bg-s-purple-20',
  teal:      'bg-s-teal-20',
};

export interface IColorPicker {
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function ColorPicker({ disabled, error, value, onChange }: IColorPicker) {
  const [open, setOpen] = useState(false);
  const selected = defaultColorOptions.find(opt => opt.value === value);

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
            {/* Color swatch preview */}
            <span
              className={cn(
                'w-9 h-9 rounded-xl shrink-0 inline-flex items-center justify-center border border-primary-black-10',
                selected ? swatchBg[selected.value] : 'bg-primary-blue-10 text-primary-black-40 text-lg font-bold',
              )}
            >
              {!selected && '?'}
            </span>
            <div>
              <p className="body-bold">{selected?.label ?? 'Select Color'}</p>
              <p className="alternative text-primary-black-40">Color</p>
            </div>
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align="start"
            className={cn(
              'bg-base-white rounded-2xl ring-card p-2 z-50',
              'max-h-64 overflow-y-auto w-(--radix-popover-trigger-width)',
              'shadow-medium',
              'animate-in fade-in-0 zoom-in-95 duration-150',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            )}
          >
            {defaultColorOptions.map(opt => (
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
                <span className={cn('w-9 h-9 rounded-xl shrink-0 border border-primary-black-10', swatchBg[opt.value])} />
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
