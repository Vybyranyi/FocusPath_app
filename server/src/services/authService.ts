import User, { type IUser } from '@models/User';
import Habit from '@models/Habit';
import { hashPassword, verifyPassword } from '@utils/password';
import { generateToken } from '@utils/generateToken';
import { BadRequestError, ConflictError, NotFoundError } from '@errors/AppError';
import type {
    ChangePasswordDto,
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
} from '@validation/authSchemas';

export interface Session {
    token: string;
    user: IUser;
}

const requireUser = async (userId: string | undefined, withPassword = false): Promise<IUser> => {
    const query = User.findById(userId);
    if (withPassword) {
        // The hash is select:false on the schema, so it has to be asked for.
        query.select('+password');
    }

    const user = await query;
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
};

export const register = async (dto: RegisterDto): Promise<Session> => {
    const existing = await User.findOne({ email: dto.email });
    if (existing) {
        throw new ConflictError('User already exists');
    }

    const user = await User.create({
        ...dto,
        password: await hashPassword(dto.password),
    });

    return { token: generateToken(user.id), user };
};

export const login = async ({ email, password }: LoginDto): Promise<Session> => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (!(await verifyPassword(password, user.password))) {
        throw new BadRequestError('Invalid credentials');
    }

    return { token: generateToken(user.id), user };
};

export const getProfile = (userId: string | undefined): Promise<IUser> => requireUser(userId);

export const updateProfile = async (
    userId: string | undefined,
    changes: UpdateProfileDto,
): Promise<IUser> => {
    if (changes.email) {
        const taken = await User.findOne({ email: changes.email, _id: { $ne: userId } });
        if (taken) {
            throw new ConflictError('Email already in use');
        }
    }

    // Safe to apply wholesale: the schema allows only profile fields and has
    // already dropped anything else the request carried.
    const updated = await User.findByIdAndUpdate(userId, changes, {
        new: true,
        runValidators: true,
    });

    if (!updated) {
        throw new NotFoundError('User not found');
    }

    return updated;
};

export const changePassword = async (
    userId: string | undefined,
    { currentPassword, newPassword }: ChangePasswordDto,
): Promise<void> => {
    const user = await requireUser(userId, true);

    if (!(await verifyPassword(currentPassword, user.password))) {
        throw new BadRequestError('Current password is incorrect');
    }

    user.password = await hashPassword(newPassword);
    await user.save();
};

/** Removes the account and everything that belongs to it. */
export const deleteAccount = async (userId: string | undefined): Promise<void> => {
    await Habit.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
};
