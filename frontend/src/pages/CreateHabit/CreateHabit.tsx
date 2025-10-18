import ColorPicker from '@components/ColorPicker/ColorPicker';
import DurationPicker from '@components/DurationPicker/DurationPicker';
import EmojiPicker from '@components/EmojiPicker/EmojiPicker';
import Input from '@components/Input/Input';
import WeekDatePicker from '@components/WeekDatePicker/WeekDatePicker';
// import Button from '@components/Button/Button';
import styles from '@pages/CreateHabit/CreateHabit.module.scss';
import { Form, Formik } from 'formik';
import * as Yup from "yup";

export interface IHabit {
    color: string;
    emoji: string;
    habitName: string;
    habitDescription: string;
    startDate: Date | undefined;
    aiEnabled: boolean;
    duration: string;
}

export default function CreateHabit() {
    const initialValues: IHabit = {
        color: '',
        emoji: '',
        habitName: '',
        habitDescription: '',
        startDate: new Date(),
        aiEnabled: false,
        duration: '',
    };

    const validationSchema = Yup.object({
        color: Yup.string()
            .required("Color is required"),
        emoji: Yup.string()
            .required("Emoji is required"),
        habitName: Yup.string()
            .required("Habit name is required")
            .min(5, "Habit name must be at least 5 characters")
            .max(20, "Habit name must be at most 20 characters"),
        habitDescription: Yup.string()
            .required("Habit description is required")
            .min(10, "Habit description must be at least 10 characters")
            .max(100, "Habit description must be at most 100 characters"),
        startDate: Yup.date()
            .nullable()
            .required("Start date is required")
            .min(new Date(), "Start date cannot be in the past"),
        aiEnabled: Yup.boolean(),
        duration: Yup.string()
            .when('aiEnabled', {
                is: false,
                then: (schema) => schema
                    .required("Duration is required when AI is disabled")
                    .matches(/^\d+$/, "Duration must be a number")
                    .test('range', 'Duration must be between 1 and 365 days', (value) => {
                        if (!value) return false;
                        const num = parseInt(value);
                        return num >= 1 && num <= 365;
                    }),
                otherwise: (schema) => schema.notRequired()
            }),
    });

    const handleSubmit = (values: IHabit) => {
        console.log('Habit data:', values);
    }

    return (
        <div className={`container ${styles.createHabitPage}`}>
            <h5 className={styles.createHabitTitle}>Create Habit</h5>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                            >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched, isValid, dirty }) => (
                    <Form>
                        <div className={styles.form}>
                            <ColorPicker
                                error={touched.color ? errors.color : ''}
                                value={values.color}
                                onChange={(value) => handleChange('color')(value)}
                                onBlur={() => handleBlur('color')}
                            />

                            <EmojiPicker
                                error={touched.emoji ? errors.emoji : ''}
                                value={values.emoji}
                                onChange={(value) => handleChange('emoji')(value)}
                                onBlur={() => handleBlur('emoji')}
                            />

                            <Input
                                label='Habit Name'
                                placeholder='Enter Habit Name'
                                type='text'
                                value={values.habitName}
                                onChange={handleChange('habitName')}
                                onBlur={handleBlur('habitName')}
                                error={touched.habitName ? errors.habitName : ''}
                            />

                            <Input
                                label='Habit Description'
                                placeholder='Describe your habit'
                                type='text'
                                value={values.habitDescription}
                                onChange={handleChange('habitDescription')}
                                onBlur={handleBlur('habitDescription')}
                                error={touched.habitDescription ? errors.habitDescription : ''}
                            />

                            <WeekDatePicker
                                label="When you want to start?"
                                selectedDate={values.startDate}
                                onDateSelect={(date) => {
                                    setFieldValue('startDate', date, true);
                                    setFieldTouched('startDate', true, false);
                                }}
                                error={touched.startDate ? errors.startDate : ''}
                            />

                            <DurationPicker
                                aiEnabled={values.aiEnabled}
                                duration={values.duration}
                                onAiToggle={() => {
                                    setFieldValue('aiEnabled', !values.aiEnabled);
                                    if (!values.aiEnabled) {
                                        setFieldValue('duration', '');
                                        setFieldTouched('duration', false);
                                    }
                                }}
                                onDurationChange={(e) => {
                                    setFieldValue('duration', e.target.value);
                                }}
                                onDurationBlur={() => {
                                    setFieldTouched('duration', true);
                                }}
                                error={touched.duration ? errors.duration : ''}
                            />
                        </div>

                        {/* <div className={styles.buttonContainer}>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                disabled={!(isValid && dirty)}
                            >
                                Create Habit
                            </Button>
                        </div> */}
                    </Form>
                )}
            </Formik>
        </div>
    )
}