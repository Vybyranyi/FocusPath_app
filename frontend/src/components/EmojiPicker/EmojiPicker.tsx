import styles from '@components/EmojiPicker/EmojiPicker.module.scss';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Emoji } from 'react-apple-emojis';

export interface IEmojiOption {
  label: string;
  value: string;
  emoji: string;
}

const defaultEmojiOptions: IEmojiOption[] = [
  { label: 'Running', value: 'runner', emoji: 'person running' },
  { label: 'Gym', value: 'weightlifter', emoji: 'person lifting weights' },
  { label: 'Meditation', value: 'lotus', emoji: 'person in lotus position' },
  { label: 'Biking', value: 'bicycle', emoji: 'bicycle' },
  { label: 'Walking', value: 'footprints', emoji: 'footprints' },
  { label: 'Basketball', value: 'basketball', emoji: 'basketball' },
  { label: 'Soccer', value: 'soccer', emoji: 'soccer ball' },

  { label: 'Writing', value: 'pencil', emoji: 'pencil' },
  { label: 'Studying', value: 'notebook', emoji: 'notebook' },
  { label: 'Coding', value: 'laptop', emoji: 'laptop' },
  { label: 'Reading', value: 'books', emoji: 'books' },

  { label: 'Cooking', value: 'cooking', emoji: 'cooking' },
  { label: 'Coffee', value: 'coffee', emoji: 'hot beverage' },
  { label: 'Vegetables', value: 'broccoli', emoji: 'broccoli' },
  { label: 'Fruit', value: 'banana', emoji: 'banana' },

  { label: 'Sleeping', value: 'bed', emoji: 'bed' },
  { label: 'Relaxing', value: 'spa', emoji: 'person getting massage' },

  { label: 'Shopping', value: 'shopping', emoji: 'shopping bags' },
  { label: 'Money', value: 'money', emoji: 'money bag' },
  { label: 'Saving', value: 'piggy', emoji: 'piggy bank' },

  { label: 'Cleaning', value: 'broom', emoji: 'broom' },
  { label: 'Plant Care', value: 'plant', emoji: 'seedling' },

  { label: 'Dog', value: 'dog', emoji: 'dog face' },
  { label: 'Cat', value: 'cat', emoji: 'cat face' },

  { label: 'Travel', value: 'world', emoji: 'globe showing americas' },
  { label: 'Map', value: 'map', emoji: 'world map' },

  { label: 'Water Drop', value: 'droplet', emoji: 'droplet' },
  { label: 'Fire', value: 'fire', emoji: 'fire' },
  { label: 'Star', value: 'star', emoji: 'star' },
  { label: 'Heart', value: 'red heart', emoji: 'red heart' },
  { label: 'Checkmark', value: 'check mark', emoji: 'check mark' },
  { label: 'Trophy', value: 'trophy', emoji: 'trophy' },
  { label: 'Book', value: 'open book', emoji: 'open book' },
  { label: 'Apple', value: 'red apple', emoji: 'red apple' },
  { label: 'Clock', value: 'alarm clock', emoji: 'alarm clock' },
  { label: 'Smile', value: 'smiling face', emoji: 'smiling face' },
  { label: 'Moon', value: 'crescent moon', emoji: 'crescent moon' },
  { label: 'Sun', value: 'sun', emoji: 'sun' },
  { label: 'Music', value: 'musical note', emoji: 'musical note' },
  { label: 'Camera', value: 'camera', emoji: 'camera' },
  { label: 'Car', value: 'automobile', emoji: 'automobile' },
  { label: 'Plane', value: 'airplane', emoji: 'airplane' },
  { label: 'Home', value: 'house', emoji: 'house' },
];


export interface IEmojiPicker {
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function EmojiPicker(props: IEmojiPicker) {
  const selected = defaultEmojiOptions.find((opt) => opt.value === props.value);

  const items: MenuProps['items'] = defaultEmojiOptions.map((opt) => ({
    key: opt.value,
    label: (
      <div
        className={styles.dropdownItem}
        onClick={() => props.onChange?.(opt.value)}
      >
        <span className={styles.emojiSquare}>
          <Emoji className={styles.emoji} name={opt.emoji} />
        </span>
        <div>
          <p className="body-bold">{opt.label}</p>
        </div>
      </div>
    ),
  }));

  return (
    <div className={styles.wrapper}>
      <Dropdown menu={{ items }} trigger={['click']} disabled={props.disabled}>
        <div className={styles.emojiSelect} onBlur={props.onBlur}>
          <span className={styles.showEmoji}>
            {selected ? (
              <Emoji className={styles.emoji} name={selected.emoji} />
            ) : (
              <span className={styles.placeholder}>?</span>
            )}
          </span>
          <div>
            <p className="body-bold">{selected?.label ?? 'Select Icon'}</p>
            <p className={`alternative ${styles.grayText}`}>Icon</p>
          </div>
        </div>
      </Dropdown>
      {props.error && <div className={styles.error}>{props.error}</div>}
    </div>
  );
}