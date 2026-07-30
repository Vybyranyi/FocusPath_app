import IconButton from "@components/ui/IconButton";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import Select from "@components/ui/Select";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import { useNavigate } from "react-router";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useEffect, useState } from "react";
import { registerUser } from "@store/authSlice";

export interface IinitialValues {
  name: string;
  surname: string;
  birthdate: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  name: Yup.string().min(2).max(20).required("Required"),
  surname: Yup.string().min(2).max(20).required("Required"),
  birthdate: Yup.string().required("Required"),
  gender: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email"),
  password: Yup.string().min(8, "At least 8 characters"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("password")],
    "Passwords must match",
  ),
});

const initialValues: IinitialValues = {
  name: "",
  surname: "",
  birthdate: "",
  gender: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, error, loading } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user) navigate("/main");
  }, [user, navigate]);

  const handleSubmit = async (values: IinitialValues) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    dispatch(
      registerUser({
        name: values.name,
        surname: values.surname,
        birthday: new Date(values.birthdate),
        gender: values.gender as "male" | "female",
        email: values.email,
        password: values.password,
      }),
    );
  };

  return (
    <div className="md:h-screen md:flex md:flex-col md:justify-center">
      {/* Title container — hidden on mobile, shown on desktop */}
      <div className="hidden md:flex items-center gap-2 w-110.5 mx-auto mb-9">
        {step === 2 && (
          <IconButton
            size="large"
            icon={arrow_left}
            onClick={() => setStep(1)}
          />
        )}
        <h5>Create Account</h5>
      </div>

      <div className="container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isValid,
            dirty,
          }) => (
            <Form>
              <div className="flex flex-col gap-4 pt-2 md:pt-0 md:max-w-110.5 md:mx-auto md:mb-22.5">
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
                      error={
                        touched.confirmPassword ? errors.confirmPassword : ""
                      }
                    />
                  </>
                )}

                {error && <p className="chip text-error">{error}</p>}
              </div>

              <div className="fixed bottom-3 left-6 right-6 md:static md:max-w-86.25 md:mx-auto">
                <p
                  className="body-bold text-primary-blue text-center mb-6 cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Already have an account? Let's log in!
                </p>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  disabled={
                    step === 1
                      ? !(isValid && dirty)
                      : !(isValid && dirty) || loading
                  }
                >
                  {step === 2 && loading
                    ? "Loading..."
                    : step === 1
                      ? "Next"
                      : "Register"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
