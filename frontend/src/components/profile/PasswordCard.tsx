import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { changePassword } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Required"),
  newPassword: Yup.string()
    .min(8, "At least 8 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Required"),
});

export default function PasswordCard() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (
    values: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    { resetForm }: { resetForm: () => void },
  ) => {
    const result = await dispatch(
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    );
    if (changePassword.fulfilled.match(result)) {
      resetForm();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-medium p-6 flex flex-col gap-5">
      <p className="title font-bold">Change Password</p>

      <Formik
        initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
        validationSchema={passwordSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
          <Form className="flex flex-col gap-4">
            <Input
              label="current password"
              placeholder="Enter current password"
              type="password"
              value={values.currentPassword}
              onChange={handleChange("currentPassword")}
              onClear={() => handleChange("currentPassword")("")}
              onBlur={handleBlur("currentPassword")}
              error={touched.currentPassword ? errors.currentPassword : ""}
            />
            <Input
              label="new password"
              placeholder="Enter new password"
              type="password"
              value={values.newPassword}
              onChange={handleChange("newPassword")}
              onClear={() => handleChange("newPassword")("")}
              onBlur={handleBlur("newPassword")}
              error={touched.newPassword ? errors.newPassword : ""}
            />
            <Input
              label="confirm new password"
              placeholder="Repeat new password"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              onClear={() => handleChange("confirmPassword")("")}
              onBlur={handleBlur("confirmPassword")}
              error={touched.confirmPassword ? errors.confirmPassword : ""}
            />

            {saved && (
              <p className="chip text-success">Password changed successfully</p>
            )}

            <div className="pt-2">
              <Button
                type="primary"
                size="medium"
                htmlType="submit"
                disabled={!(isValid && dirty) || loading}
              >
                {loading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
