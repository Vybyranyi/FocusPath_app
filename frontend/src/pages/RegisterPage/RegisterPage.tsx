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
import { useAppSelector } from "@store/hooks";

export default function RegisterPage() {
    const navigate = useNavigate();

    const { error, loading } = useAppSelector(state => state.auth);

    const initialValues = {
        name: '',
        surname: '',
        birthdate: '',
        gender: '',
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
        birthdate: Yup.string().required('Required'),
        gender: Yup.string().required('Required'),
    });

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
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values) => {
                        console.log("Register with:", values);
                        // const action = await dispatch(loginUser({ email: values.email, password: values.password }));
                        // console.log(action);
                    }}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
                        <Form>
                            <div className={styles.form}>
                                <Input
                                    label="name"
                                    placeholder="Enter your name"
                                    type="text"
                                    value={values.name}
                                    onChange={handleChange('name')}
                                    onBlur={handleBlur("name")}
                                    error={touched.name ? errors.name : ""}
                                />
                                <Input
                                    label="surname"
                                    placeholder="Enter your surname"
                                    type="text"
                                    value={values.surname}
                                    onChange={handleChange('surname')}
                                    onBlur={handleBlur("surname")}
                                    error={touched.surname ? errors.surname : ""}
                                />
                                <Input
                                    label="birthdate"
                                    placeholder="dd.mm.yyyy"
                                    type="date"
                                    value={values.birthdate}
                                    onChange={handleChange('birthdate')}
                                    onBlur={handleBlur("birthdate")}
                                    error={touched.birthdate ? errors.birthdate : ""}
                                />
                                {/* <Select
                                    label="gender"
                                    placeholder="Choose your gender"
                                    options={[
                                        { label: "Male", value: "male" },
                                        { label: "Female", value: "female" },
                                    ]}
                                    value={values.gender}
                                    onChange={handleChange('gender')}
                                    onBlur={handleBlur("gender")}
                                    error={touched.gender ? errors.gender : ""}
                                /> */}
                                {error && (
                                    <p className={`chip ${styles.serverError}`}>{error}</p>
                                )}
                            </div>

                            <div className={styles.buttonContainer}>
                                <p
                                    className={`body-bold ${styles.askRedirect}`}
                                    onClick={() => navigate('/login')}
                                >
                                    Already have an account? Let's log in!
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