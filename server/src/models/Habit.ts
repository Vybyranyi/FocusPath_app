import mongoose, { Document, Schema } from "mongoose";
import { ref } from "process";

export interface IHabit extends Document {
    title: string;
    startDate: Date;
    duration: number;
    type: 'build' | 'quit';
    userId: mongoose.Types.ObjectId;
    currentStreak: number;
    isCompleted: boolean;
    dailyCompletions: Array<{
        date: Date;
        completed: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
};

const HabitSchema: Schema = new Schema({
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    type: { type: String, enum: ['build', 'quit'], required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    currentStreak: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    dailyCompletions: [{
        date: { type: Date, required: true },
        completed: { type: Boolean, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});