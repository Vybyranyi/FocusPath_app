import mongoose, { Document, Schema } from "mongoose";
import type { Habit } from '@shared/index';

/**
 * The stored habit. Scalar fields and the `type` union come from the shared
 * `Habit` contract; restated below are only the parts that differ in storage —
 * dates as `Date`, subdocument ids as `ObjectId`, and the `userId` owner link,
 * which is stripped from every response.
 */
export interface IHabit
    extends Document,
    Omit<Habit, '_id' | 'startDate' | 'steps' | 'dailyCompletions' | 'createdAt' | 'updatedAt'> {
    startDate: Date;
    userId: mongoose.Types.ObjectId;
    dailyCompletions: Array<{
        dayTitle: string;
        date: Date;
        completed: boolean;
    }>;
    steps?: Array<{
        _id?: mongoose.Types.ObjectId;
        title: string;
        completed: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const HabitSchema: Schema = new Schema({
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    type: { type: String, enum: ['build', 'quit'], required: true },
    color: { type: String },
    icon: { type: String },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    currentStreak: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    dailyCompletions: [{
        dayTitle: { type: String, required: true },
        date: { type: Date, required: true },
        completed: { type: Boolean, required: true }
    }],
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    steps: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Індекси для швидкого пошуку
HabitSchema.index({ userId: 1, startDate: 1 });
HabitSchema.index({ userId: 1, isCompleted: 1 });

// Метод для перевірки чи потрібно виконати звичку сьогодні
HabitSchema.methods.shouldCompleteToday = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(this.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceStart >= 0 && daysSinceStart < this.duration && !this.isCompleted;
};

// Метод для отримання очікуваної кінцевої дати
HabitSchema.methods.getExpectedEndDate = function() {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + this.duration - 1);
    return endDate;
};

const Habit = mongoose.model<IHabit>('Habit', HabitSchema);

export default Habit;