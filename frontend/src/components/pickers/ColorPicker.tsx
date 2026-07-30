import OptionPicker, { PreviewFrame } from "@components/pickers/OptionPicker";
import type { Option } from "@/types/ui";

export type ColorOption =
  | 'white' | 'orange' | 'blue' | 'lightblue'
  | 'red' | 'yellow' | 'green' | 'purple' | 'teal';

const colorOptions: readonly Option<ColorOption>[] = [
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
}

export default function ColorPicker(props: IColorPicker) {
  return (
    <OptionPicker
      {...props}
      options={colorOptions}
      caption="Color"
      placeholder="Select Color"
      renderPreview={(option) => (
        <PreviewFrame
          className={
            option
              ? swatchBg[option.value]
              : 'bg-primary-blue-10 text-primary-black-40 text-lg font-bold'
          }
        >
          {!option && '?'}
        </PreviewFrame>
      )}
    />
  );
}
