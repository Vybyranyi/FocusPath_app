import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB } from '@config/db';
import User from '@models/User';

const run = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
        console.log(`Admin user already exists: ${email}`);
        await mongoose.disconnect();
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name: 'Admin',
        surname: 'Admin',
        birthday: new Date('2000-01-01'),
        gender: 'male',
        email,
        password: hashedPassword,
    });

    console.log(`Admin user created: ${email}`);
    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
});
