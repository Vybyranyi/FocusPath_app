import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import mongoose from 'mongoose';
import { connectDB } from '@config/db';
import User from '@models/User';
import { hashPassword } from '@utils/password';
import { logger } from '@config/logger';

const run = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        logger.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
        logger.info(`Admin user already exists: ${email}`);
        await mongoose.disconnect();
        return;
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
        name: 'Admin',
        surname: 'Admin',
        birthday: new Date('2000-01-01'),
        gender: 'male',
        email,
        password: hashedPassword,
    });

    logger.info(`Admin user created: ${email}`);
    await mongoose.disconnect();
};

run().catch((error) => {
    logger.fatal({ err: error }, 'Failed to seed admin user');
    process.exit(1);
});
