import styles from "@pages/LoginPage/LoginPage.module.scss";
import IconButton from "@components/IconButton/IconButton";
import Input from "@components/Input/Input";
import Button from "@components/Button/Button";
import Header from "@components/Header/Header";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import { useNavigate } from "react-router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { loginUser } from "@store/authSlice";
import { useEffect } from "react";

export default function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { user, token, error, loading } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (user && token) {
            navigate('/main');
        }
    }, [user, token, navigate]);

    const initialValues = {
        email: '',
        password: ''
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid e-mail address')
            .required('Required'),
        password: Yup.string()
        .min(8, 'Password must be at least 8 characters').required('Required'),
    });

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
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values) => {
                        dispatch(loginUser({ email: values.email, password: values.password }));
                    }}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
                        <Form>
                            <div className={styles.form}>
                                <Input
                                    label="e-mail"
                                    placeholder="Enter your e-mail"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange('email')}
                                    onBlur={handleBlur("email")}
                                    error={touched.email ? errors.email : ""}
                                />
                                <Input
                                    label="Password"
                                    placeholder="Enter your password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange("password")}
                                    onBlur={handleBlur("password")}
                                    error={touched.password ? errors.password : ""}
                                />
                                {error && (
                                    <p className={`chip ${styles.serverError}`}>{error}</p>
                                )}
                                <p
                                    className={`body-bold ${styles.forgotPassword}`}
                                    onClick={() => alert('This feature is not implemented yet.')}
                                >
                                    I forgot my password
                                </p>
                            </div>

                            <div className={styles.buttonContainer}>
                                <p
                                    className={`body-bold ${styles.askRedirect}`}
                                    onClick={() => navigate('/register')}
                                >
                                    Don’t have account? Let’s create!
                                </p>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    disabled={!(isValid && dirty) || loading}
                                >
                                    {loading ? "Loading..." : "Next"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};