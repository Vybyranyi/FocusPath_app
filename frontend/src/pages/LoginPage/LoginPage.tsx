import styles from "@pages/LoginPage/LoginPage.module.scss";
import IconButton from "@components/IconButton/IconButton";
import Input from "@components/Input/Input";
import Button from "@components/Button/Button";
import Header from "@components/Header/Header";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import { useNavigate } from "react-router";

export default function LoginPage() {
    const navigate = useNavigate();
    
    return (
        <div className={styles.LoginPage}>
            <div className={styles.headerContainer}>
                <Header
                    title="Continue with E-mail"
                    leftButtonIcon={<IconButton size='large' icon={arrow_left} />}
                />
            </div>
            <h5 className={styles.LoginTitle}>Continue with E-mail</h5>
            <div className="container">
                <div className={styles.form}>
                    <Input label="e-mail" placeholder="Enter your e-mail" type="email" />
                    <Input label="password" placeholder="Enter your password" type="password" />
                    <p className={`body-bold ${styles.forgotPassword}`} onClick={() => alert('This feature is not implemented yet.')}>I forgot my password</p>
                </div>
                <div className={styles.buttonContainer}>
                    <p
                        className={`body-bold ${styles.askRedirect}`}
                        onClick={() => navigate('/register')}
                    >
                        Don’t have account? Let’s create!</p>
                    <Button type="primary" size="large" >Next</Button>
                </div>
            </div>
        </div>
    );
};