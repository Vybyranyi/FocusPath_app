import styles from '@components/Input/Input.module.scss';
import eye_show from '@assets/images/icons/eye_show.svg';
import eye_hide from '@assets/images/icons/eye_hide.svg';
import remove_cross from '@assets/images/icons/remove_cross.svg';
import React, { useState } from 'react';

export interface IInputProps {
    label: string;
    placeholder: string;
    type: "text" | "email" | "password" | "date";
    disabled?: boolean;
}

export default function Input(props: IInputProps) {
    const [value, setValue] = useState<string>("");
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleClear = () => {
        setValue("");
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div className={`${styles.inputContainer} ${props.disabled ? styles.disabled : ""}`}>
            <p className={`chip ${styles.inputLabel}`}>{props.label}</p>
            <div className={styles.inputWrapper}>
                <input
                    className={`${styles.input}`}
                    type={props.type === "password" ? (isPasswordVisible ? "text" : "password") : props.type}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    value={value}
                    onChange={handleChange}
                />
                <div className={styles.inputIcon}>
                    {props.type === "password" &&
                        <img
                            src={isPasswordVisible ? eye_hide : eye_show}
                            onClick={togglePasswordVisibility}
                        />
                    }
                    {value &&
                        <img
                            src={remove_cross}
                            onClick={handleClear}
                        />
                    }
                </div>
            </div>
        </div>
    )
}