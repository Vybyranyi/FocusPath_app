import AILoadingAnimation from "@animation/AILoadingAnimation";
import Button from "@components/ui/Button";
import ColorPicker from "@components/pickers/ColorPicker";
import DurationPicker from "@components/pickers/DurationPicker";
import EmojiPicker from "@components/pickers/EmojiPicker";
import HabitTypePicker from "@components/pickers/HabitTypePicker";
import Input from "@components/ui/Input";
import WeekDatePicker from "@components/pickers/WeekDatePicker";
import { createAIHabit, createHabit } from "@store/habitSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";

export interface IHabit {
  color: string;
  emoji: string;
  habitName: string;
  habitDescription: string;
  startDate: Date | undefined;
  aiEnabled: boolean;
  duration: string;
  habitType: "build" | "quit";
}

const validationSchema = Yup.object({
  color: Yup.string().required("Color is required"),
  emoji: Yup.string().required("Emoji is required"),
  habitName: Yup.string().min(5).max(20).required("Habit name is required"),
  habitDescription: Yup.string()
    .min(10)
    .max(100)
    .required("Habit description is required"),
  startDate: Yup.date()
    .nullable()
    .required("Start date is required")
    .test("not-past", "Start date cannot be in the past", (value) => {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sel = new Date(value);
      sel.setHours(0, 0, 0, 0);
      return sel >= today;
    }),
  aiEnabled: Yup.boolean(),
  duration: Yup.string().when("aiEnabled", {
    is: false,
    then: (s) =>
      s
        .required("Duration is required")
        .matches(/^\d+$/, "Must be a number")
        .test("range", "Must be 1–365 days", (v) => {
          const n = parseInt(v ?? "");
          return n >= 1 && n <= 365;
        }),
    otherwise: (s) => s.notRequired(),
  }),
  habitType: Yup.string()
    .oneOf(["build", "quit"])
    .required("Habit type is required"),
});

const initialValues: IHabit = {
  color: "",
  emoji: "",
  habitName: "",
  habitDescription: "",
  startDate: new Date(),
  aiEnabled: false,
  duration: "",
  habitType: "build",
};

export default function CreateHabit() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isAICreating, setIsAICreating] = useState(false);
  const { error, loading } = useAppSelector((state) => state.habit);

  const handleSubmit = async (values: IHabit) => {
    try {
      if (values.aiEnabled) {
        setIsAICreating(true);
        await dispatch(createAIHabit(values)).unwrap();
      } else {
        await dispatch(createHabit(values)).unwrap();
      }
      navigate("/main");
    } catch (err) {
      console.error("Failed to create habit:", err);
    } finally {
      setIsAICreating(false);
    }
  };

  return (
    <>
      {isAICreating && <AILoadingAnimation />}

      <div className="container">
        <h5 className="hidden md:block mb-4">Create Habit</h5>

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
            setFieldValue,
            setFieldTouched,
          }) => (
            <Form>
              <div
                className={[
                  "flex flex-col gap-4 pt-2 pb-28",
                  "md:grid md:grid-cols-2 md:gap-x-6 md:pt-4 md:pb-0 md:items-start",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4">
                  <ColorPicker
                    value={values.color}
                    error={touched.color ? errors.color : ""}
                    onChange={(v) => handleChange("color")(v)}
                    onBlur={() => handleBlur("color")}
                  />
                  <EmojiPicker
                    value={values.emoji}
                    error={touched.emoji ? errors.emoji : ""}
                    onChange={(v) => handleChange("emoji")(v)}
                    onBlur={() => handleBlur("emoji")}
                  />
                  <Input
                    label="Habit Name"
                    placeholder="Enter Habit Name"
                    type="text"
                    value={values.habitName}
                    onChange={handleChange("habitName")}
                    onBlur={handleBlur("habitName")}
                    error={touched.habitName ? errors.habitName : ""}
                  />
                  <Input
                    label="Habit Description"
                    placeholder="Describe your habit"
                    type="text"
                    value={values.habitDescription}
                    onChange={handleChange("habitDescription")}
                    onBlur={handleBlur("habitDescription")}
                    error={
                      touched.habitDescription ? errors.habitDescription : ""
                    }
                  />
                  <p className="text-xs font-normal text-gray-500">
                    Provide more details about your habit to help the AI generate a better personalized plan.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <WeekDatePicker
                    label="When you want to start?"
                    selectedDate={values.startDate}
                    onDateSelect={(date) => {
                      setFieldValue("startDate", date, true);
                      setFieldTouched("startDate", true, false);
                    }}
                    error={touched.startDate ? errors.startDate : ""}
                  />
                  <DurationPicker
                    aiEnabled={values.aiEnabled}
                    duration={values.duration}
                    onAiToggle={() => {
                      setFieldValue("aiEnabled", !values.aiEnabled);
                      if (!values.aiEnabled) {
                        setFieldValue("duration", "");
                        setFieldTouched("duration", false);
                      }
                    }}
                    onDurationChange={(e) =>
                      setFieldValue("duration", e.target.value)
                    }
                    onDurationBlur={() => setFieldTouched("duration", true)}
                    error={touched.duration ? errors.duration : ""}
                  />
                  <HabitTypePicker
                    value={values.habitType}
                    onSelect={(type) => {
                      setFieldValue("habitType", type);
                      setFieldTouched("habitType", true);
                    }}
                    error={touched.habitType ? errors.habitType : ""}
                  />

                  <div
                    className={[
                      "fixed bottom-3 left-6 right-6 flex gap-4",
                      "md:static md:mt-4 md:pb-4",
                    ].join(" ")}
                  >
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      disabled={loading || values.aiEnabled}
                      onClick={() => setFieldValue("aiEnabled", false)}
                    >
                      {loading && !values.aiEnabled ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      type="ai"
                      size="large"
                      htmlType="submit"
                      disabled={loading}
                      onClick={() => setFieldValue("aiEnabled", true)}
                    >
                      {loading && values.aiEnabled
                        ? "Creating..."
                        : "Create by AI"}
                    </Button>
                  </div>

                  {loading && (
                    <p className="alternative text-primary-black-40 mt-1">
                      Creating habit...
                    </p>
                  )}
                  {error && (
                    <p className="alternative text-error mt-1">{error}</p>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
