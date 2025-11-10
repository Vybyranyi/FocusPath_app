import { Response, Request } from 'express';
import Habit from '@models/Habit';
import mongoose from 'mongoose';
import { generateHabitPlan } from '../services/openAiService';

interface AuthRequest extends Request {
    userId?: string;
    body: {
        title?: string;
        startDate?: string;
        duration?: number | null;
        type?: 'build' | 'quit';
        color?: string;
        icon?: string;
    };
}

export const createAIHabit = async (req: AuthRequest, res: Response) => {
    try {
        const { title, startDate, duration, type, color, icon } = req.body;
        const { userId } = req;

        // Валідація обов'язкових полів
        if (!title || !startDate || !type || !userId || !color || !icon) {
            return res.status(400).json({ message: 'Title, startDate, type, color, icon and userId are required' });
        }

        if (!['build', 'quit'].includes(type)) {
            return res.status(400).json({ message: 'Type must be either "build" or "quit"' });
        }

        // Перевірка duration якщо вказано
        if (duration !== undefined && duration !== null && duration !== 0) {
            if (duration < 1 || duration > 365) {
                return res.status(400).json({ message: 'Duration must be between 1 and 365 days' });
            }
        }

        // Парсинг та валідація дати
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
            return res.status(400).json({ message: 'Invalid start date format' });
        }

        parsedStartDate.setUTCHours(0, 0, 0, 0);

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const daysDifference = Math.floor((today.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDifference > 0) {
            return res.status(400).json({ message: 'Start date cannot be in the past' });
        }

        const useDuration = duration && duration > 0 ? duration : undefined;
        const aiResponse = await generateHabitPlan(title.trim(), type, useDuration);

        // Генерація плану через OpenAI
        console.log('Requesting AI habit plan:', {
            title: title.trim(),
            type,
            duration: useDuration || 'auto'
        });

        console.log('AI response received:', {
            duration: aiResponse.duration,
            tasksCount: aiResponse.dailyTasks.length
        });

        // Створення масиву dailyCompletions з датами
        const dailyCompletions = aiResponse.dailyTasks.map((task, index) => {
            const completionDate = new Date(parsedStartDate);
            completionDate.setUTCDate(completionDate.getUTCDate() + index);
            return {
                dayTitle: task.dayTitle,
                date: completionDate,
                completed: false
            };
        });

        // Створення звички
        const newHabit = new Habit({
            title: title.trim(),
            startDate: parsedStartDate,
            duration: aiResponse.duration,
            type,
            userId,
            color,
            icon,
            currentStreak: 0,
            isCompleted: false,
            dailyCompletions
        });

        await newHabit.save();

        res.status(201).json({
            message: 'AI-powered habit created successfully',
            habit: {
                ...newHabit.toObject(),
                userId: undefined
            },
            aiGenerated: true
        });
    } catch (error) {
        console.error('Create AI habit error:', error);

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors
            });
        }

        if (error instanceof Error && error.message.includes('OpenAI')) {
            return res.status(503).json({ 
                message: 'AI service temporarily unavailable', 
                error: error.message 
            });
        }

        res.status(500).json({ message: 'Server error during AI habit creation' });
    }
};