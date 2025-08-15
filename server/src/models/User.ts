import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    surname: string;
    birthday: Date;
    gender: "male" | "female";
    email: string;
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
    password: { type: String, required: true, minlength: 8 },
}, { timestamps: true });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;