import dotenv from 'dotenv';
import path from 'path';

import mongoose from 'mongoose';
import { connectDB } from '@config/db';
import Plan from '@models/Plan';
import Report from '@models/Report';
import { logger } from '@config/logger';

export interface RemovalReport {
    planTitle: string;
    /** Open reports against the plan that this run closed. */
    reportsClosed: number;
}

/**
 * Pulls a plan out of the library and closes the complaints about it.
 *
 * The removal is soft, like an author's own withdrawal: hard deletion would cut
 * the `fromPlanId` link on every habit taken from this plan and erase the very
 * record a later review would need. `removed` is distinct from `unpublished` so
 * the two are never confused for one another.
 *
 * Expects an open connection; the CLI below owns connecting.
 */
export const removePlan = async (planId: string): Promise<RemovalReport> => {
    if (!mongoose.Types.ObjectId.isValid(planId)) {
        throw new Error(`Not a plan id: ${planId}`);
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
        throw new Error(`No plan with id ${planId}`);
    }

    plan.status = 'removed';
    await plan.save();

    const closed = await Report.updateMany({ planId, status: 'open' }, { $set: { status: 'actioned' } });

    return { planTitle: plan.title, reportsClosed: closed.modifiedCount };
};

const run = async () => {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

    const planId = process.argv[2];
    if (!planId) {
        logger.error('Usage: npm run moderation:remove -- <planId>');
        process.exit(1);
    }

    await connectDB();

    const report = await removePlan(planId);
    logger.info(report, `Removed "${report.planTitle}" from the library`);

    await mongoose.disconnect();
};

if (require.main === module) {
    run().catch(async (error) => {
        logger.fatal({ err: error }, 'Failed to remove the plan');
        await mongoose.disconnect().catch(() => undefined);
        process.exit(1);
    });
}
