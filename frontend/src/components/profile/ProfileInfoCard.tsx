import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Select from "@components/ui/Select";
import { updateProfile } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useToast } from "@hooks/useToast";
import * as Yup from "yup";

/** Addresses are case-insensitive, and the server stores them folded. */
const sameAddress = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Built per user rather than shared, because whether the password is required
 * depends on the address currently on the account — which the form itself does
 * not know.
 */
const buildProfileSchema = (storedEmail: string) =>
  Yup.object({
    name: Yup.string().min(2).max(20).required("Required"),
    surname: Yup.string().min(2).max(20).required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    birthdate: Yup.string().required("Required"),
    gender: Yup.string().required("Required"),
    // The server refuses an address change without it. Asked for here so the
    // refusal never reaches the user as a failed save.
    currentPassword: Yup.string().when("email", {
      is: (email: string) => Boolean(email) && !sameAddress(email, storedEmail),
      then: (schema) => schema.required("Required to change your email"),
      otherwise: (schema) => schema,
    }),
  });

function formatBirthday(iso: string) {
  try {
    return format(new Date(iso), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

function toBirthdateInput(iso: string) {
  try {
    return format(new Date(iso), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

export default function ProfileInfoCard() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);
  const [isEditing, setIsEditing] = useState(false);
  const { notify } = useToast();

  if (!user) return null;

  const handleSubmit = async (values: {
    name: string;
    surname: string;
    email: string;
    birthdate: string;
    gender: string;
    currentPassword: string;
  }) => {
    const result = await dispatch(
      updateProfile({
        name: values.name,
        surname: values.surname,
        email: values.email,
        birthday: values.birthdate,
        gender: values.gender as "male" | "female",
        avatar: user.avatar,
        // Sent only when it is actually needed, so an ordinary edit does not
        // carry a password it has no use for.
        ...(sameAddress(values.email, user.email)
          ? {}
          : { currentPassword: values.currentPassword }),
      }),
    );
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
      notify("Profile saved");
    } else {
      // The server's own words when it has any: "current password is incorrect"
      // is the difference between trying again and not knowing what went wrong.
      notify(
        typeof result.payload === "string"
          ? result.payload
          : "Could not save your profile",
        "danger",
      );
    }
  };

  const fields = [
    { label: "Name", value: user.name },
    { label: "Surname", value: user.surname },
    { label: "Email", value: user.email },
    { label: "Birthday", value: formatBirthday(user.birthday) },
    { label: "Gender", value: user.gender === "male" ? "Male" : "Female" },
  ];

  return (
    <div className="bg-surface rounded-2xl shadow-lifted p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="title font-bold">Personal information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-accent body-bold hover:opacity-70 transition-opacity"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"
              />
            </svg>
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <>
          <div className="flex flex-col gap-4">
            {fields.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <p className="chip text-ink-muted">{label}</p>
                <p className="body-bold">{value}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Formik
          initialValues={{
            name: user.name,
            surname: user.surname,
            email: user.email,
            birthdate: toBirthdateInput(user.birthday),
            gender: user.gender,
            currentPassword: "",
          }}
          validationSchema={buildProfileSchema(user.email)}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
            <Form className="flex flex-col gap-4">
              <Input
                label="Name"
                placeholder="Enter your name"
                type="text"
                value={values.name}
                onChange={handleChange("name")}
                onClear={() => handleChange("name")("")}
                onBlur={handleBlur("name")}
                error={touched.name ? errors.name : ""}
              />
              <Input
                label="Surname"
                placeholder="Enter your surname"
                type="text"
                value={values.surname}
                onChange={handleChange("surname")}
                onClear={() => handleChange("surname")("")}
                onBlur={handleBlur("surname")}
                error={touched.surname ? errors.surname : ""}
              />
              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                onClear={() => handleChange("email")("")}
                onBlur={handleBlur("email")}
                error={touched.email ? errors.email : ""}
              />
              <Input
                label="Date of birth"
                placeholder="dd.mm.yyyy"
                type="date"
                value={values.birthdate}
                onChange={handleChange("birthdate")}
                onClear={() => handleChange("birthdate")("")}
                onBlur={handleBlur("birthdate")}
                error={touched.birthdate ? errors.birthdate : ""}
              />
              {/*
                Appears only once the address has actually been edited: the
                server asks for a password to move it, and nothing else on this
                form needs one.
              */}
              {!sameAddress(values.email, user.email) && (
                <Input
                  label="Current password"
                  placeholder="Confirm with your password"
                  type="password"
                  value={values.currentPassword}
                  onChange={handleChange("currentPassword")}
                  onClear={() => handleChange("currentPassword")("")}
                  onBlur={handleBlur("currentPassword")}
                  error={touched.currentPassword ? errors.currentPassword : ""}
                />
              )}

              <Select
                label="Gender"
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

              <div className="flex gap-3 pt-2">
                <Button
                  type="outline"
                  size="medium"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="medium"
                  htmlType="submit"
                  disabled={!(isValid && dirty) || loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}
