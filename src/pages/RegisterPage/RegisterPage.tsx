import styles from "@pages/RegisterPage/RegisterPage.module.scss";
import IconButton from "@components/IconButton/IconButton";
import Input from "@components/Input/Input";
import Button from "@components/Button/Button";

export default function RegisterPage() {
    return (
        <div className="container">
            <div className={styles.header}>
                <IconButton size="large"></IconButton>
                <h5>Create Account</h5>
            </div>
            <div className={styles.form}>
                <Input label="name" placeholder="Enter your name" type="text" />
                <Input label="surname" placeholder="Enter your surname" type="text" />
                <Input label="Birthdate" placeholder="mm/dd/yyyy" type="date" />
            </div>
            <Button type="primary" size="large" >Next</Button>
        </div>
    );
};