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

export const getAllHabits = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        };

        const habits = await Habit.find({ userId }).select('-userId').sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Habits retrieved successfully',
            habits
        });
    } catch (error) {
        console.error('Get habits error:', error);
        res.status(500).json({ message: 'Server error while retrieving habits' });
    }
};

export const getHabitById = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid habit ID' });
        };

        const habit = await Habit.findOne({ _id: id, userId }).select('-userId');

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        };

        res.status(200).json({
            message: 'Habit retrieved successfully',
            habit
        });

    } catch (error) {
        console.error('Get habit by ID error:', error);
        res.status(500).json({ message: 'Server error while retrieving habit' });
    }
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const { title, startDate, duration, type } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid habit ID' });
        };

        const habit = await Habit.findOne({ _id: id, userId });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        };

        if (type && !['build', 'quit'].includes(type)) {
            return res.status(400).json({ message: 'Type must be either "build" or "quit"' });
        };

        if (duration && (duration < 0 || duration > 365)) {
            return res.status(400).json({ message: 'Duration must be between 0 and 365 days' });
        };

        if (startDate) {
            const parsedStartDate = new Date(startDate);
            if (isNaN(parsedStartDate.getTime())) {
                return res.status(400).json({ message: 'Invalid start date format' });
            }
            parsedStartDate.setHours(0, 0, 0, 0);
            habit.startDate = parsedStartDate;
        };

        if (title) habit.title = title.trim();
        if (duration) habit.duration = duration;
        if (type) habit.type = type;
        habit.updatedAt = new Date();

        await habit.save();

        res.status(200).json({
            message: 'Habit updated successfully',
            habit: {
                ...habit.toObject(),
                userId: undefined
            }
        });

    } catch (error) {
        console.error('Update habit error:', error);

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors
            });
        }

        res.status(500).json({ message: 'Server error during habit update' });
    }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid habit ID' });
        };

        const habit = await Habit.findOneAndDelete({ _id: id, userId });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        };

        res.status(200).json({
            message: 'Habit deleted successfully',
            habitId: id
        });

    } catch (error) {
        console.error('Delete habit error:', error);
        res.status(500).json({ message: 'Server error during habit deletion' });
    }
};

export const markHabitCompletion = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const { date, completed } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid habit ID' });
        };

        if (completed === undefined) {
            return res.status(400).json({ message: 'Completed status is required' });
        };

        const habit = await Habit.findOne({ _id: id, userId });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        };

        const completionDate = date ? new Date(date) : new Date();
        completionDate.setHours(0, 0, 0, 0);

        // перевіряю чи дата в межах тривалості звички
        const startDate = new Date(habit.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + habit.duration - 1);

        if (completionDate < startDate || completionDate > endDate) {
            return res.status(400).json({ message: 'Date is outside habit duration' });
        };

        // перевіряємо чи є запис для цієї дати
        const existingCompletionIndex = habit.dailyCompletions.findIndex(
            dc => new Date(dc.date).getTime() === completionDate.getTime()
        );

        if (existingCompletionIndex > -1) {
            habit.dailyCompletions[existingCompletionIndex].completed = completed;
        } else {
            habit.dailyCompletions.push({ date: completionDate, completed });
        };

        // Оновлення поточної серії
        const sortedCompletions = habit.dailyCompletions
            .filter(dc => dc.completed)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = sortedCompletions.length - 1; i >= 0; i--) {
            const compDate = new Date(sortedCompletions[i].date);
            compDate.setHours(0, 0, 0, 0);
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - currentStreak);

            if (compDate.getTime() === expectedDate.getTime()) {
                currentStreak++;
            } else {
                break;
            }
        };

        habit.currentStreak = currentStreak;

        // Перевірка чи звичка завершена
        const completedDays = habit.dailyCompletions.filter(dc => dc.completed).length;
        if (completedDays >= habit.duration) {
            habit.isCompleted = true;
        }

        habit.updatedAt = new Date();
        await habit.save();

        res.status(200).json({
            message: 'Habit completion marked successfully',
            habit: {
                ...habit.toObject(),
                userId: undefined
            }
        });

    } catch (error) {
        console.error('Mark habit completion error:', error);
        res.status(500).json({ message: 'Server error while marking habit completion' });
    }
};