import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '@models/User';
import Habit from '@models/Habit';
import mongoose from 'mongoose';
import { hashPassword, validatePassword, verifyPassword } from '@utils/password';
import { validateAvatar } from '@utils/avatar';

const jwtSecret = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
    try {
        const { name, surname, birthday, gender, email, password } = req.body;

        if (!name || !surname || !birthday || !gender || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Rejects operator objects such as {"$ne": null} before they reach a
        // query. sanitizeFilter would neutralise them anyway, but only by
        // failing the cast — which surfaces as a 500 rather than a clear refusal.
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email and password must be strings' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordProblem = validatePassword(password);
        if (passwordProblem) {
            return res.status(400).json({ message: passwordProblem });
        }

        // Fields are listed rather than spread from the body: spreading let a
        // caller set any schema path it liked, which becomes privilege
        // escalation the moment a role or flag is added to the model.
        const newUser = new User({
            name,
            surname,
            birthday,
            gender,
            email,
            password: await hashPassword(password),
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser,
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Checked before the lookup rather than after, so a malformed request
        // never reaches the database.
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Rejects operator objects such as {"$ne": null} before they reach a
        // query. sanitizeFilter would neutralise them anyway, but only by
        // failing the cast — which surfaces as a 500 rather than a clear refusal.
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email and password must be strings' });
        }

        // The hash is select:false on the schema, so it has to be asked for.
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

interface AuthRequest extends Request {
    userId?: string;
}

export const verifyToken = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Token is valid',
            user,
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ message: 'Server error during token verification' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { name, surname, birthday, gender, email, avatar } = req.body;

        if (avatar !== undefined) {
            const avatarProblem = validateAvatar(avatar);
            if (avatarProblem) {
                return res.status(400).json({ message: avatarProblem });
            }
        }

        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: userId } });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updated = await User.findByIdAndUpdate(
            userId,
            { name, surname, birthday, gender, email, avatar },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updated,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        const passwordProblem = validatePassword(newPassword);
        if (passwordProblem) {
            return res.status(400).json({ message: passwordProblem });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValid = await verifyPassword(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        await User.findByIdAndUpdate(userId, { password: await hashPassword(newPassword) });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req;

        await Habit.deleteMany({ userId });
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error during account deletion' });
    }
};
