import styles from "@components/Switch/Switch.module.scss";

export interface ISwitch {
    disabled?: boolean;
    toggled?: boolean;
    onClick?: () => void;
};

export default function Switch(props: ISwitch) {


    return (
        <button
            className={`${styles.toggleSwitch} ${props.toggled ? styles.toggled : ''} ${props.disabled ? styles.disabled : ''}`}
            onClick={props.onClick}
            disabled={props.disabled}
        >
            <div className={styles.toggleThumb}></div>
        </button>
    )
};

// import { Field } from "formik";

// <Field 
//   name="acceptTerms"
//   component={({ field, form, meta }: any) => (
//     <Switch
//       disabled={false}
//       toggled={field.value}
//       onClick={() => form.setFieldValue(field.name, !field.value)}
//     />
//   )}
// />
