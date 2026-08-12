import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Modal from "@components/ui/Modal";
import { changePassword } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useToast } from "@hooks/useToast";

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Required"),
  newPassword: Yup.string().min(8, "At least 8 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Required"),
});

interface IChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Changing a password used to be a card sitting open on the profile page, with
 * three empty fields visible at all times whether or not anyone intended to
 * use them. It is an occasional action, so it asks to be opened.
 */
export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: IChangePasswordDialogProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);
  const { notify } = useToast();

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const result = await dispatch(
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    );

    if (changePassword.fulfilled.match(result)) {
      notify("Password changed");
      onOpenChange(false);
    } else {
      notify("Could not change the password", "danger");
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Change password"
      description="You will stay signed in on this device."
    >
      <Formik
        initialValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
        validationSchema={passwordSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
          <Form className="flex flex-col gap-4">
            <Input
              label="Current password"
              placeholder="Enter current password"
              type="password"
              value={values.currentPassword}
              onChange={handleChange("currentPassword")}
              onClear={() => handleChange("currentPassword")("")}
              onBlur={handleBlur("currentPassword")}
              error={touched.currentPassword ? errors.currentPassword : ""}
            />
            <Input
              label="New password"
              placeholder="Enter new password"
              type="password"
              value={values.newPassword}
              onChange={handleChange("newPassword")}
              onClear={() => handleChange("newPassword")("")}
              onBlur={handleBlur("newPassword")}
              error={touched.newPassword ? errors.newPassword : ""}
            />
            <Input
              label="Confirm new password"
              placeholder="Repeat new password"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              onClear={() => handleChange("confirmPassword")("")}
              onBlur={handleBlur("confirmPassword")}
              error={touched.confirmPassword ? errors.confirmPassword : ""}
            />

            <div className="flex gap-3 pt-1">
              <Button type="outline" size="medium" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="medium"
                htmlType="submit"
                disabled={!(isValid && dirty) || loading}
              >
                {loading ? "Saving…" : "Change password"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
