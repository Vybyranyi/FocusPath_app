import { Response, Request } from 'express';
import Habit from '@models/Habit';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
    userId?: string;
    body: {
        title?: string;
        startDate?: string;
        duration?: number;
        type?: 'build' | 'quit';
        completed?: boolean;
        date?: string;
    };
}

export const createHabit = async (req: AuthRequest, res: Response) => {
    try {
        const { title, startDate, duration, type } = req.body;
        const { userId } = req;

        if (!title || !startDate || !duration || !type || !userId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!['build', 'quit'].includes(type)) {
            return res.status(400).json({ message: 'Type must be either "build" or "quit"' });
        }

        if (duration < 1 || duration > 365) {
            return res.status(400).json({ message: 'Duration must be between 1 and 365 days' });
        }

        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
            return res.status(400).json({ message: 'Invalid start date format' });
        }

        parsedStartDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysDifference = Math.floor((today.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDifference > 0) {
            return res.status(400).json({ message: 'Start date cannot be more than 0 days in the past' });
        }

        const newHabit = new Habit({
            title: title.trim(),
            startDate: parsedStartDate,
            duration,
            type,
            userId,
            currentStreak: 0,
            isCompleted: false,
            dailyCompletions: []
        });

        await newHabit.save();

        res.status(201).json({
            message: 'Habit created successfully',
            habit: {
                ...newHabit.toObject(),
                userId: undefined
            }
        });
    } catch (error) {
        console.error('Create habit error:', error);

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors
            });
        }

        res.status(500).json({ message: 'Server error during habit creation' });
    }
};