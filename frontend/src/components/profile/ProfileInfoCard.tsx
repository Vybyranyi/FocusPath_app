import { useId, useState, type ReactNode } from "react";
import Button from "@components/ui/Button";
import { updateProfile } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { format } from "date-fns";
import { Form, Formik } from "formik";
import { useToast } from "@hooks/useToast";
import { cn } from "@/lib/utils";
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

/**
 * One line of the card, in whichever of its two states.
 *
 * The row owns the layout so that reading and editing produce the *same* rows
 * at the same heights: editing used to swap the whole list for a stack of
 * labelled fields, which changed every measurement on the card and made the
 * page jump under the pointer. Now the value turns into a control in place and
 * only the buttons at the bottom appear.
 */
function Row({
  label,
  children,
  error,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  /** Present while editing, when the row's value is a real form control. */
  htmlFor?: string;
}) {
  return (
    <div className="border-b border-line pb-3 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-4 min-h-11">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="chip text-ink-muted shrink-0">
            {label}
          </label>
        ) : (
          <p className="chip text-ink-muted shrink-0">{label}</p>
        )}
        {children}
      </div>
      {error && (
        <p role="alert" className="alternative text-danger text-right">
          {error}
        </p>
      )}
    </div>
  );
}

/** The look every editable value takes, so a row's height never depends on its type. */
const controlClass = cn(
  "w-full max-w-56 h-9 px-3 rounded-lg text-right",
  "bg-canvas border border-line body-bold text-ink",
  "transition-colors duration-(--duration-fast) focus:border-accent",
);

export default function ProfileInfoCard() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);
  const [isEditing, setIsEditing] = useState(false);
  const { notify } = useToast();
  const fieldId = useId();

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

  return (
    <div className="bg-surface rounded-2xl shadow-lifted p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between min-h-11">
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
        <div className="flex flex-col gap-4">
          <Row label="Name">
            <p className="body-bold truncate">{user.name}</p>
          </Row>
          <Row label="Surname">
            <p className="body-bold truncate">{user.surname}</p>
          </Row>
          <Row label="Email">
            <p className="body-bold truncate">{user.email}</p>
          </Row>
          <Row label="Birthday">
            <p className="body-bold truncate">{formatBirthday(user.birthday)}</p>
          </Row>
          <Row label="Gender">
            <p className="body-bold truncate">
              {user.gender === "male" ? "Male" : "Female"}
            </p>
          </Row>
        </div>
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
            <Form className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <Row
                  label="Name"
                  htmlFor={`${fieldId}-name`}
                  error={touched.name ? errors.name : ""}
                >
                  <input
                    id={`${fieldId}-name`}
                    type="text"
                    className={controlClass}
                    value={values.name}
                    onChange={handleChange("name")}
                    onBlur={handleBlur("name")}
                  />
                </Row>

                <Row
                  label="Surname"
                  htmlFor={`${fieldId}-surname`}
                  error={touched.surname ? errors.surname : ""}
                >
                  <input
                    id={`${fieldId}-surname`}
                    type="text"
                    className={controlClass}
                    value={values.surname}
                    onChange={handleChange("surname")}
                    onBlur={handleBlur("surname")}
                  />
                </Row>

                <Row
                  label="Email"
                  htmlFor={`${fieldId}-email`}
                  error={touched.email ? errors.email : ""}
                >
                  <input
                    id={`${fieldId}-email`}
                    type="email"
                    className={controlClass}
                    value={values.email}
                    onChange={handleChange("email")}
                    onBlur={handleBlur("email")}
                  />
                </Row>

                {/*
                  Appears only once the address has actually been edited: the
                  server asks for a password to move it, and nothing else on
                  this form needs one.
                */}
                {!sameAddress(values.email, user.email) && (
                  <Row
                    label="Current password"
                    htmlFor={`${fieldId}-password`}
                    error={touched.currentPassword ? errors.currentPassword : ""}
                  >
                    <input
                      id={`${fieldId}-password`}
                      type="password"
                      placeholder="Confirm with your password"
                      className={controlClass}
                      value={values.currentPassword}
                      onChange={handleChange("currentPassword")}
                      onBlur={handleBlur("currentPassword")}
                    />
                  </Row>
                )}

                <Row
                  label="Birthday"
                  htmlFor={`${fieldId}-birthdate`}
                  error={touched.birthdate ? errors.birthdate : ""}
                >
                  <input
                    id={`${fieldId}-birthdate`}
                    type="date"
                    className={controlClass}
                    value={values.birthdate}
                    onChange={handleChange("birthdate")}
                    onBlur={handleBlur("birthdate")}
                  />
                </Row>

                <Row
                  label="Gender"
                  htmlFor={`${fieldId}-gender`}
                  error={touched.gender ? errors.gender : ""}
                >
                  <select
                    id={`${fieldId}-gender`}
                    className={controlClass}
                    value={values.gender}
                    onChange={handleChange("gender")}
                    onBlur={handleBlur("gender")}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Row>
              </div>

              {/* The only thing editing adds to the card. */}
              <div className="flex gap-3">
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
