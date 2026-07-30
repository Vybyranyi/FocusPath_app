import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '@models/User';
import Habit from '@models/Habit';
import { hashPassword, verifyPassword } from '@utils/password';
import { created, ok } from '@utils/apiResponse';
import { BadRequestError, ConflictError, NotFoundError } from '@errors/AppError';
import type { TypedRequest } from '@middlewares/validate';
import type {
    ChangePasswordDto,
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
} from '@validation/authSchemas';

const jwtSecret = process.env.JWT_SECRET as string;

// Shape, types and field limits are enforced by the schemas on the routes, so
// nothing below re-checks them. What remains here is the part a schema cannot
// know: whether the address is taken, whether the password matches.
//
// No try/catch either — Express 5 forwards a rejected promise to the error
// handler, which is the only place that turns a failure into a response.

export const register = async (req: TypedRequest<RegisterDto>, res: Response) => {
    const { name, surname, birthday, gender, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ConflictError('User already exists');
    }

    // The schema strips unknown keys, so the body cannot carry a field the
    // caller was never offered — no spread, and nothing to escalate through.
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

export const login = async (req: TypedRequest<LoginDto>, res: Response) => {
    const { email, password } = req.body;

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

export const updateProfile = async (req: TypedRequest<UpdateProfileDto>, res: Response) => {
    const { userId } = req;
    const { email } = req.body;

    if (email) {
        const existing = await User.findOne({ email, _id: { $ne: userId } });
        if (existing) {
            throw new ConflictError('Email already in use');
        }
    }

    // Safe to hand the body over whole: the schema allows only these six fields
    // and has already dropped anything else.
    const updated = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updated) {
        throw new NotFoundError('User not found');
    }

    return ok(res, { user: updated });
};

export const changePassword = async (req: TypedRequest<ChangePasswordDto>, res: Response) => {
    const { userId } = req;
    const { currentPassword, newPassword } = req.body;

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
