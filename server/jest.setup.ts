import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './src/app';

dotenv.config({ path: '.env.test' }); 

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST as string);
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});