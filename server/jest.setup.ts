import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Environment is loaded by jest.env.ts (`setupFiles`), which runs before this
// file and before any module under test is imported. That order matters:
// several modules read process.env at import time, JWT_SECRET among them.

let mongod: MongoMemoryServer;

// Generous timeout because the very first run downloads a mongod binary
// (~100 MB). It is cached afterwards, so subsequent runs start in about a second.
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
}, 120_000);

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});
