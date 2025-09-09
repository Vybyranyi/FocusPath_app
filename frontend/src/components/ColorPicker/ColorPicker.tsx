import styles from '@components/ColorPicker/ColorPicker.module.scss';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

export type ColorOption =
  | 'white'
  | 'orange'
  | 'blue'
  | 'lightblue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'teal';

export interface IColorOption {
  label: string;
  value: ColorOption;
}

const defaultColorOptions: IColorOption[] = [
  { label: 'White', value: 'white' },
  { label: 'Orange', value: 'orange' },
  { label: 'Blue', value: 'blue' },
  { label: 'Light Blue', value: 'lightblue' },
  { label: 'Red', value: 'red' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Green', value: 'green' },
  { label: 'Purple', value: 'purple' },
  { label: 'Teal', value: 'teal' },
];

export interface IColorPicker {
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function ColorPicker(props: IColorPicker) {
  const selected = defaultColorOptions.find((opt) => opt.value === props.value);

  const items: MenuProps['items'] = defaultColorOptions.map((opt) => ({
    key: opt.value,
    label: (
      <div
        className={styles.dropdownItem}
        onClick={() => props.onChange?.(opt.value)}
      >
        <span
          className={`${styles.colorSquare} ${styles[opt.value]}`}
        />
        <div>
          <p className="body-bold">{opt.label}</p>
          {/* <p className={`alternative ${styles.grayText}`}>Color</p> */}
        </div>
      </div>
    ),
  }));

  return (
    <div className={styles.wrapper}>
      <Dropdown menu={{ items }} trigger={['click']} disabled={props.disabled}>
        <div className={styles.colorSelect} onBlur={props.onBlur}>
          <span
            className={`${styles.showColor} ${selected ? styles[selected.value] : styles.placeholder}`}
          />
          <div>
            <p className="body-bold">{selected?.label ?? 'Select Color'}</p>
            <p className={`alternative ${styles.grayText}`}>Color</p>
          </div>
        </div>
      </Dropdown>
      {props.error && <div className={styles.error}>{props.error}</div>}
    </div>
  );
}