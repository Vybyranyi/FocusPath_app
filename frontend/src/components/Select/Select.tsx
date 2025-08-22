import styles from "@components/Select/Select.module.scss";
import React, { useState } from "react";

export interface ISelectOption {
    label: string;
    value: string;
}

export interface ISelectProps {
    label: string;
    placeholder: string;
    options: ISelectOption[];
    disabled?: boolean;
    error?: string;
}

export default function Select(props: ISelectProps) {
    const [value, setValue] = useState<string>("");

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(event.target.value);
    };

    return (
        <div className={`${styles.selectContainer} ${props.disabled ? styles.disabled : ""}`}>
            <p className={`chip ${styles.selectLabel}`}>{props.label}</p>
            <div className={styles.selectWrapper}>
                <select
                    className={`${styles.select} ${!value ? styles.placeholder : ""} ${props.error ? styles.error : ""}`}
                    value={value}
                    onChange={handleChange}
                    disabled={props.disabled}
                >
                    <option value="" disabled hidden>
                        {props.placeholder}
                    </option>
                    {props.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            {props.error && (
                <div className={styles.errorPopup}>
                    <span className="alternative">{props.error}</span>
                </div>
            )}
        </div>
    );
}
