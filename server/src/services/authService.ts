import User, { type IUser } from '@models/User';
import Habit from '@models/Habit';
import { hashPassword, verifyPassword } from '@utils/password';
import { createSessionId, verifyRefreshToken } from '@utils/tokens';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '@errors/AppError';
import type {
    ChangePasswordDto,
    DeleteAccountDto,
    LoginDto,
    RegisterDto,
    UpdateProfileDto,
} from '@validation/authSchemas';

/** Everything the caller needs to put a session on the response. */
export interface Session {
    user: IUser;
    tokenVersion: number;
    sessionId: string;
}

/** How many devices may stay signed in at once; the oldest falls off beyond this. */
const MAX_SESSIONS = 10;

const requireUser = async (userId: string | undefined, fields: string[] = []): Promise<IUser> => {
    const query = User.findById(userId);
    if (fields.length) {
        // password and refreshSessions are select:false, so they must be asked for.
        query.select(fields.map(field => `+${field}`).join(' '));
    }

    const user = await query;
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
};

const startSession = async (user: IUser): Promise<Session> => {
    const sessionId = createSessionId();

    user.refreshSessions = [...(user.refreshSessions ?? []), sessionId].slice(-MAX_SESSIONS);
    await user.save();

    return { user, tokenVersion: user.tokenVersion, sessionId };
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

    return startSession(user);
};

export const login = async ({ email, password }: LoginDto): Promise<Session> => {
    const user = await User.findOne({ email }).select('+password +refreshSessions');
    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (!(await verifyPassword(password, user.password))) {
        throw new BadRequestError('Invalid credentials');
    }

    return startSession(user);
};

/**
 * Exchanges a refresh token for a fresh session.
 *
 * The presented session id must still be on the user's list, and is taken off
 * it as the new one goes on. That is what makes rotation mean something: a
 * token cannot be spent twice, and a stolen one stops working the moment the
 * real client next refreshes.
 *
 * The version is checked too, so raising it — as a password change does —
 * retires every session at once.
 */
export const refreshSession = async (token: string | undefined): Promise<Session> => {
    if (!token) {
        throw new UnauthorizedError('Not authenticated');
    }

    const { userId, version, sessionId } = verifyRefreshToken(token);

    const user = await User.findById(userId).select('+refreshSessions');
    if (!user || version !== user.tokenVersion) {
        throw new UnauthorizedError('Session is no longer valid');
    }

    if (!user.refreshSessions?.includes(sessionId)) {
        throw new UnauthorizedError('Session is no longer valid');
    }

    const rotated = createSessionId();
    user.refreshSessions = [
        ...user.refreshSessions.filter(id => id !== sessionId),
        rotated,
    ].slice(-MAX_SESSIONS);
    await user.save();

    return { user, tokenVersion: user.tokenVersion, sessionId: rotated };
};

/** Ends one device's session, leaving any others signed in. */
export const endSession = async (token: string | undefined): Promise<void> => {
    if (!token) {
        return;
    }

    let claims;
    try {
        claims = verifyRefreshToken(token);
    } catch {
        // An unreadable token has nothing to revoke; the cookies still get cleared.
        return;
    }

    await User.findByIdAndUpdate(claims.userId, {
        $pull: { refreshSessions: claims.sessionId },
    });
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

/**
 * Changing a password ends every session, on every device. The caller gets a
 * new one in return, so the person doing it is not signed out of the device
 * they are holding.
 */
export const changePassword = async (
    userId: string | undefined,
    { currentPassword, newPassword }: ChangePasswordDto,
): Promise<Session> => {
    const user = await requireUser(userId, ['password', 'refreshSessions']);

    if (!(await verifyPassword(currentPassword, user.password))) {
        throw new BadRequestError('Current password is incorrect');
    }

    user.password = await hashPassword(newPassword);
    user.tokenVersion += 1;
    user.refreshSessions = [];

    return startSession(user);
};

/**
 * Removes the account and everything belonging to it, after proving the person
 * asking knows the password — a stolen session should not be able to do this.
 */
export const deleteAccount = async (
    userId: string | undefined,
    { password }: DeleteAccountDto,
): Promise<void> => {
    const user = await requireUser(userId, ['password']);

    if (!(await verifyPassword(password, user.password))) {
        throw new BadRequestError('Password is incorrect');
    }

    await Habit.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
};
