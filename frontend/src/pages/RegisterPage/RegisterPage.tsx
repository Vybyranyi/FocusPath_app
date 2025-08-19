import styles from "@pages/RegisterPage/RegisterPage.module.scss";
import IconButton from "@components/IconButton/IconButton";
import Input from "@components/Input/Input";
import Button from "@components/Button/Button";
import Header from "@components/Header/Header";
import arrow_left from "@assets/images/icons/arrow-left.svg";

export default function RegisterPage() {
    return (
        <>
            <Header
                title="Create Account"
                leftButtonIcon={<IconButton size='large' icon={arrow_left} />}
            />
            <div className="container">
                <div className={styles.form}>
                    <Input label="name" placeholder="Enter your name" type="text" />
                    <Input label="surname" placeholder="Enter your surname" type="text" />
                    <Input label="Birthdate" placeholder="mm/dd/yyyy" type="date" />
                </div>
                <div className={styles.buttonContainer}>
                    <Button type="primary" size="large" >Next</Button>
                </div>
            </div>

        </>
    );
};