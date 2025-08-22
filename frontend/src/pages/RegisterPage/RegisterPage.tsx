import styles from "@pages/RegisterPage/RegisterPage.module.scss";
import IconButton from "@components/IconButton/IconButton";
import Input from "@components/Input/Input";
import Button from "@components/Button/Button";
import Header from "@components/Header/Header";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import { useNavigate } from "react-router";
import Select from "@components/Select/Select";

export default function RegisterPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.RegisterPage}>
            <div className={styles.headerContainer}>
                <Header
                    title="Create Account"
                    leftButtonIcon={<IconButton size='large' icon={arrow_left} />}
                />
            </div>
            <h5 className={styles.RegisterTitle}>Create Account</h5>
            <div className="container">
                <div className={styles.form}>
                    <Input label="name" placeholder="Enter your name" type="text" />
                    <Input label="surname" placeholder="Enter your surname" type="text" />
                    <Input label="Birthdate" placeholder="dd.mm.yyyy" type="date" />
                    <Select
                        label="gender"
                        placeholder="Choose your gender"
                        options={[
                            { label: "Male", value: "male" },
                            { label: "Female", value: "female" },
                        ]}
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <p
                    className={`body-bold ${styles.askRedirect}`}
                    onClick={() => navigate('/login')}
                    >
                    Already have an account? Let's log in!</p>
                    <Button type="primary" size="large" >Next</Button>
                </div>
            </div>
        </div>
    );
};