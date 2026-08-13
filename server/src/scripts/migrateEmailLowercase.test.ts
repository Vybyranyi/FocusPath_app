import mongoose from 'mongoose';
import { migrateEmailsToLowercase } from './migrateEmailLowercase';

/**
 * Inserted through the driver rather than the model, because the model now
 * lower-cases on write and would normalise the very thing under test. This is
 * what a row written by the previous release actually looks like.
 */
const insertUser = async (email: string) => {
    const result = await mongoose.connection.collection('users').insertOne({
        name: 'Test',
        surname: 'User',
        birthday: new Date('1990-01-01T00:00:00.000Z'),
        gender: 'male',
        email,
        password: 'not-a-real-hash',
        tokenVersion: 0,
        refreshSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return result.insertedId;
};

const readRaw = async (id: mongoose.Types.ObjectId) =>
    mongoose.connection.collection('users').findOne({ _id: id });

describe('migrateEmailsToLowercase', () => {
    it('folds a stored address to lower case', async () => {
        const id = await insertUser('Ann.Smith@Example.COM');

        const report = await migrateEmailsToLowercase();

        expect(report).toMatchObject({ scanned: 1, lowercased: 1, collisions: [] });
        expect((await readRaw(id))!.email).toBe('ann.smith@example.com');
    });

    it('leaves an address that is already lower case alone', async () => {
        await insertUser('ann@example.com');

        const report = await migrateEmailsToLowercase();

        expect(report).toEqual({ scanned: 0, lowercased: 0, collisions: [] });
    });

    it('reports a pair that folds together and changes neither', async () => {
        const lower = await insertUser('ann@example.com');
        const upper = await insertUser('Ann@example.com');

        const report = await migrateEmailsToLowercase();

        expect(report.lowercased).toBe(0);
        expect(report.collisions).toEqual([
            { email: 'ann@example.com', keeps: String(lower), skipped: String(upper) },
        ]);
        // Both survive as they were: which account is the real one, and what
        // happens to the other's habits, is not a migration's decision.
        expect((await readRaw(lower))!.email).toBe('ann@example.com');
        expect((await readRaw(upper))!.email).toBe('Ann@example.com');
    });

    it('is a no-op the second time', async () => {
        await insertUser('Ann@Example.com');
        await migrateEmailsToLowercase();

        expect(await migrateEmailsToLowercase()).toEqual({
            scanned: 0,
            lowercased: 0,
            collisions: [],
        });
    });
});
