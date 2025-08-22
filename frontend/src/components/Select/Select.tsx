import styles from "@components/Select/Select.module.scss";
import React from "react";

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
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
}

export default function Select(props: ISelectProps) {
    const { label, placeholder, options, disabled, error, value, onChange, onBlur } = props;

    return (
        <div className={`${styles.selectContainer} ${disabled ? styles.disabled : ""}`}>
            <p className={`chip ${styles.selectLabel}`}>{label}</p>
            <div className={styles.selectWrapper}>
                <select
                    className={`${styles.select} ${!value ? styles.placeholder : ""} ${error ? styles.error : ""}`}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <div className={styles.errorPopup}>
                    <span className="alternative">{error}</span>
                </div>
            )}
        </div>
    );
}