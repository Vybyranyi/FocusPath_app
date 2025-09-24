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
    error?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export default function Input(props: IInputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [inputType, setInputType] = useState<"text" | "email" | "password" | "date">(
        props.type === "date" ? "text" : props.type
    );

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = () => {
        if (props.type === "date") {
            setInputType("date");
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (props.type === "date" && !props.value) {
            setInputType("text");
        }
        props.onBlur?.(event);
    };

    const handleClear = () => {
        props.onChange?.({ target: { value: "" } } as any);
    };

    let currentInputType = props.type === "password"
        ? isPasswordVisible ? "text" : "password"
        : inputType;

    return (
        <div className={`${styles.inputContainer} ${props.disabled ? styles.disabled : ""}`}>
            <p className={`chip ${styles.inputLabel}`}>{props.label}</p>
            <div className={styles.inputWrapper}>
                <input
                    className={`${styles.input} ${props.error ? styles.error : ""}`}
                    type={currentInputType}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    value={props.value}
                    onChange={props.onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <div className={styles.inputIcon}>
                    {props.type === "password" && (
                        <img
                            src={isPasswordVisible ? eye_hide : eye_show}
                            onClick={togglePasswordVisibility}
                            alt="Toggle password visibility"
                        />
                    )}
                    {props.value && (
                        <img
                            src={remove_cross}
                            onClick={handleClear}
                            alt="Clear input"
                        />
                    )}
                </div>
            </div>
            {props.error && (
                <div className={styles.errorPopup}>
                    <span className="alternative">{props.error}</span>
                </div>
            )}
        </div>
    );
}
