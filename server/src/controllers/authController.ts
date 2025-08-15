import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@models/User';
import mongoose from 'mongoose';

const jwtSecret = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
    try {
        const { name, surname, birthday, gender, email, password } = req.body;

        if (!name || !surname || !birthday || !gender || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            ...req.body,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                ...newUser.toObject(),
                password: undefined,
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};