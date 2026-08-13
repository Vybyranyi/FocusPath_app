import dotenv from 'dotenv';
import path from 'path';

import mongoose from 'mongoose';
import { connectDB } from '@config/db';
import User from '@models/User';
import { logger } from '@config/logger';

/** Two accounts that fold to one address. Neither is touched; a person decides. */
export interface EmailCollision {
    email: string;
    /** The account that already holds the lower-cased address. */
    keeps: string;
    /** The account left as it was written, because moving it would collide. */
    skipped: string;
}

export interface MigrationReport {
    /** Rows still stored with an address that is not already lower case. */
    scanned: number;
    lowercased: number;
    collisions: EmailCollision[];
}

/** Rows whose stored address differs from its own lower-cased form. */
const MIXED_CASE = { $expr: { $ne: ['$email', { $toLower: '$email' }] } };

/**
 * Folds stored addresses to lower case, to match what the schemas now accept.
 *
 * Without it a row written earlier keeps its capitals while sign-in lower-cases
 * what it is given, and the two no longer meet — the account becomes
 * unreachable. That is the whole reason this exists, so it runs before or with
 * the release that normalises input, not later.
 *
 * A pair that folds to the same address is *not* merged. Which one is the real
 * account, and what becomes of the other's habits, is not something a migration
 * can decide correctly; both are left exactly as they are and reported for
 * someone to resolve by hand.
 *
 * Idempotent: it only looks at rows that are not already lower case, so a second
 * run is a no-op and an interrupted one can simply be repeated.
 *
 * Expects an open connection; the CLI below owns connecting.
 */
export const migrateEmailsToLowercase = async (): Promise<MigrationReport> => {
    // Through the driver, not the model. The model now lower-cases on write,
    // which would quietly rewrite these documents on the way in and out and make
    // the collision check compare normalised values against normalised values. A
    // migration has to see rows as they are stored.
    const users = User.collection;

    const outstanding = await users.find(MIXED_CASE).toArray();
    const collisions: EmailCollision[] = [];
    let lowercased = 0;

    for (const user of outstanding) {
        const email = String(user.email);
        const folded = email.toLowerCase();

        // Re-read per row rather than once up front: an earlier row in this same
        // loop may have just taken the address.
        const holder = await users.findOne({ email: folded, _id: { $ne: user._id } });
        if (holder) {
            collisions.push({
                email: folded,
                keeps: String(holder._id),
                skipped: String(user._id),
            });
            continue;
        }

        await users.updateOne({ _id: user._id }, { $set: { email: folded } });
        lowercased += 1;
    }

    return { scanned: outstanding.length, lowercased, collisions };
};

const run = async () => {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
    await connectDB();

    const report = await migrateEmailsToLowercase();

    if (report.collisions.length > 0) {
        // Loud on purpose: these accounts are still signing in with capitals and
        // will keep doing so until someone chooses which of the pair survives.
        logger.warn(
            { collisions: report.collisions },
            'Some addresses fold onto an account that already exists; left untouched',
        );
    }

    logger.info(
        report,
        report.scanned === 0
            ? 'Nothing to migrate: every address is already lower case'
            : 'Email normalisation complete',
    );

    await mongoose.disconnect();
};

// Only when invoked as a script. Importing this module — as the test does —
// must not reach for a database.
if (require.main === module) {
    run().catch(async (error) => {
        logger.fatal({ err: error }, 'Failed to normalise addresses');
        await mongoose.disconnect().catch(() => undefined);
        process.exit(1);
    });
}
