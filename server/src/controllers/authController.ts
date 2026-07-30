import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '@models/User';
import Habit from '@models/Habit';
import { hashPassword, validatePassword, verifyPassword } from '@utils/password';
import { validateAvatar } from '@utils/avatar';
import { created, ok } from '@utils/apiResponse';
import { BadRequestError, ConflictError, NotFoundError } from '@errors/AppError';

const jwtSecret = process.env.JWT_SECRET as string;

// No try/catch anywhere below: Express 5 forwards a rejected promise to the
// error handler, which is the only place that turns a failure into a response.

export const register = async (req: Request, res: Response) => {
    const { name, surname, birthday, gender, email, password } = req.body;

    if (!name || !surname || !birthday || !gender || !email || !password) {
        throw new BadRequestError('All fields are required');
    }

    // Rejects operator objects such as {"$ne": null} before they reach a query.
    // sanitizeFilter would neutralise them anyway, but only by failing the cast.
    if (typeof email !== 'string' || typeof password !== 'string') {
        throw new BadRequestError('Email and password must be strings');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ConflictError('User already exists');
    }

    const passwordProblem = validatePassword(password);
    if (passwordProblem) {
        throw new BadRequestError(passwordProblem);
    }

    // Fields are listed rather than spread from the body: spreading let a caller
    // set any schema path it liked, which becomes privilege escalation the
    // moment a role or flag is added to the model.
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

    return created(res, { token, user: newUser });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Checked before the lookup, so a malformed request never reaches the database.
    if (!email || !password) {
        throw new BadRequestError('Email and password are required');
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        throw new BadRequestError('Email and password must be strings');
    }

    // The hash is select:false on the schema, so it has to be asked for.
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
        throw new BadRequestError('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '7d' });

    return ok(res, { token, user });
};

export const verifyToken = async (req: Request, res: Response) => {
    const user = await User.findById(req.userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    return ok(res, { user });
};

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req;
    const { name, surname, birthday, gender, email, avatar } = req.body;

    if (avatar !== undefined) {
        const avatarProblem = validateAvatar(avatar);
        if (avatarProblem) {
            throw new BadRequestError(avatarProblem);
        }
    }

    if (email) {
        const existing = await User.findOne({ email, _id: { $ne: userId } });
        if (existing) {
            throw new ConflictError('Email already in use');
        }
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        { name, surname, birthday, gender, email, avatar },
        { new: true, runValidators: true },
    );

    if (!updated) {
        throw new NotFoundError('User not found');
    }

    return ok(res, { user: updated });
};

export const changePassword = async (req: Request, res: Response) => {
    const { userId } = req;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current and new password are required');
    }

    const passwordProblem = validatePassword(newPassword);
    if (passwordProblem) {
        throw new BadRequestError(passwordProblem);
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
        throw new BadRequestError('Current password is incorrect');
    }

    await User.findByIdAndUpdate(userId, { password: await hashPassword(newPassword) });

    return ok(res, null);
};

export const deleteAccount = async (req: Request, res: Response) => {
    const { userId } = req;

    await Habit.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    return ok(res, null);
};
