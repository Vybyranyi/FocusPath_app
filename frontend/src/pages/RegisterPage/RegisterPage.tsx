import styles from "@pages/RegisterPage/RegisterPage.module.scss";
import IconButton from "@components/IconButton/IconButton";
import Input from "@components/Input/Input";
import Button from "@components/Button/Button";
import Header from "@components/Header/Header";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import { useNavigate } from "react-router";
import Select from "@components/Select/Select";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useEffect, useState } from "react";
import { registerUser } from "@store/authSlice";

export default function RegisterPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { user, token, error, loading } = useAppSelector(state => state.auth);

    const [step, setStep] = useState(1);

    useEffect(() => {
        if (user && token) {
            navigate('/main');
        }
    }, [user, token, navigate]);

    const initialValues = {
        name: '',
        surname: '',
        birthdate: '',
        gender: '',
        email: "",
        password: "",
        confirmPassword: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, 'Name must be at least 2 characters')
            .max(20, 'Name must be at most 20 characters')
            .required('Required'),
        surname: Yup.string()
            .min(2, 'Surname must be at least 2 characters')
            .max(20, 'Surname must be at most 20 characters')
            .required('Required'),
        birthdate: Yup.string()
            .required('Required'),
        gender: Yup.string()
            .required('Required'),
        email: Yup.string()
            .email('Invalid email address')
            .when("step", { is: 2, then: (schema) => schema.required("Required") }),
        password: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .when("step", { is: 2, then: (schema) => schema.required("Required") }),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], "Passwords must match")
            .when("step", { is: 2, then: (schema) => schema.required("Required") }),
    });

    return (
        <div className={styles.RegisterPage}>
            <div className={styles.headerContainer}>
                <Header
                    title="Create Account"
                    leftButtonIcon={
                        step === 2 && (
                            <IconButton
                                size='large'
                                icon={arrow_left}
                                onClick={() => setStep(1)}
                            />
                        )
                    }
                />
            </div>
            <h5 className={styles.RegisterTitle}>Create Account</h5>
            <div className="container">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values) => {
                        if (step === 1) {
                            setStep(2);
                        } else {
                            dispatch(
                                registerUser({
                                    name: values.name,
                                    surname: values.surname,
                                    birthday: new Date(values.birthdate),
                                    gender: values.gender as "male" | "female",
                                    email: values.email,
                                    password: values.password,
                                })
                            );
                        }
                    }}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
                        <Form>
                            <div className={styles.form}>
                                {step === 1 && (
                                    <>
                                        <Input
                                            label="name"
                                            placeholder="Enter your name"
                                            type="text"
                                            value={values.name}
                                            onChange={handleChange("name")}
                                            onBlur={handleBlur("name")}
                                            error={touched.name ? errors.name : ""}
                                        />
                                        <Input
                                            label="surname"
                                            placeholder="Enter your surname"
                                            type="text"
                                            value={values.surname}
                                            onChange={handleChange("surname")}
                                            onBlur={handleBlur("surname")}
                                            error={touched.surname ? errors.surname : ""}
                                        />
                                        <Input
                                            label="birthdate"
                                            placeholder="dd.mm.yyyy"
                                            type="date"
                                            value={values.birthdate}
                                            onChange={handleChange("birthdate")}
                                            onBlur={handleBlur("birthdate")}
                                            error={touched.birthdate ? errors.birthdate : ""}
                                        />
                                        <Select
                                            label="gender"
                                            placeholder="Choose your gender"
                                            options={[
                                                { label: "Male", value: "male" },
                                                { label: "Female", value: "female" },
                                            ]}
                                            value={values.gender}
                                            onChange={handleChange("gender")}
                                            onBlur={handleBlur("gender")}
                                            error={touched.gender ? errors.gender : ""}
                                        />
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <Input
                                            label="email"
                                            placeholder="Enter your email"
                                            type="email"
                                            value={values.email}
                                            onChange={handleChange("email")}
                                            onBlur={handleBlur("email")}
                                            error={touched.email ? errors.email : ""}
                                        />
                                        <Input
                                            label="password"
                                            placeholder="Enter your password"
                                            type="password"
                                            value={values.password}
                                            onChange={handleChange("password")}
                                            onBlur={handleBlur("password")}
                                            error={touched.password ? errors.password : ""}
                                        />
                                        <Input
                                            label="confirm password"
                                            placeholder="Repeat your password"
                                            type="password"
                                            value={values.confirmPassword}
                                            onChange={handleChange("confirmPassword")}
                                            onBlur={handleBlur("confirmPassword")}
                                            error={touched.confirmPassword ? errors.confirmPassword : ""}
                                        />
                                    </>
                                )}

                                {error && (<p className={`chip ${styles.serverError}`}>{error}</p>)}
                            </div>

                            <div className={styles.buttonContainer}>
                                <p
                                    className={`body-bold ${styles.askRedirect}`}
                                    onClick={() => navigate('/login')}
                                >
                                    Already have an account? Let's log in!
                                </p>
                                {step === 1 && (
                                    <Button
                                        type="primary"
                                        size="large"
                                        htmlType="submit"
                                        disabled={!(isValid && dirty)}
                                    >
                                        Next
                                    </Button>
                                )}
                                {step === 2 && (
                                    <Button
                                        type="primary"
                                        size="large"
                                        htmlType="submit"
                                        disabled={!(isValid && dirty) || loading}
                                    >
                                        {loading ? "Loading..." : "Register"}
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};