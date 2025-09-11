import ColorPicker from '@components/ColorPicker/ColorPicker';
import EmojiPicker from '@components/EmojiPicker/EmojiPicker';
import Input from '@components/Input/Input';
import styles from '@pages/CreateHabit/CreateHabit.module.scss';
import { Form, Formik } from 'formik';
import { Emoji } from 'react-apple-emojis';
import * as Yup from "yup";

export interface IHabit {
    color: string;
    emoji: string;
    habitName: string;
    habitDescription: string;
};

export default function CreateHabit() {
    const initialValues: IHabit = {
        color: '',
        emoji: '',
        habitName: '',
        habitDescription: '',
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
    });

    const handleSubmit = (values: IHabit) => {
        console.log(values);
    }

    return (
        <div className={`container1 ${styles.createHabitPage}`}>
            <h5 className={styles.createHabitTitle}>Create Habit</h5>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
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
                                label='Habit'
                                placeholder='Enter Habit Name'
                                type='text'
                                value={values.habitName}
                                onChange={handleChange('habitName')}
                                onBlur={handleBlur('habitName')}
                                error={touched.habitName ? errors.habitName : ''}
                            />
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}