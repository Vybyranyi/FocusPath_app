import mongoose, { Document, Schema } from 'mongoose';
import type { User } from '@shared/index';

/**
 * The stored user. Field names and unions come from the shared `User` contract
 * so the two cannot drift; only the storage-level differences are restated here
 * — dates are `Date` in Mongo, and the password hash exists solely on this side.
 */
export interface IUser
    extends Document,
    Omit<User, '_id' | 'birthday' | 'createdAt' | 'updatedAt'> {
    birthday: Date;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    birthday: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    email: { type: String, required: true, unique: true },
    // Excluded from every query by default. The two places that genuinely need
    // it — signing in and changing a password — ask for it with .select('+password').
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, required: false },
}, { timestamps: true });

// Strips the hash on the way out so no controller has to remember to, and drops
// __v, which the client has no use for.
UserSchema.set('toJSON', {
    transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;