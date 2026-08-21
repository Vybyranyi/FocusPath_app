import dotenv from 'dotenv';
import path from 'path';

import mongoose from 'mongoose';
import { connectDB } from '@config/db';
import Plan from '@models/Plan';
import Report from '@models/Report';
import { logger } from '@config/logger';

/** One open complaint, flattened with enough of its plan to judge it. */
export interface QueueEntry {
    reportId: string;
    planId: string;
    planTitle: string;
    planStatus: string;
    reason: string;
    comment?: string;
    reportedAt: Date;
}

/**
 * The open moderation queue, oldest first.
 *
 * There is no screen for this, and that is the decision rather than an omission.
 * What protects the library is the AI gate at publication; this queue only holds
 * what got past it, which at these volumes is a handful of rows a week. An admin
 * area inside the SPA would need its own role guard, its own navigation and its
 * own tests — work comparable to the entire Explore page — for a surface with
 * one user.
 *
 * Expects an open connection; the CLI below owns connecting.
 */
export const openReports = async (): Promise<QueueEntry[]> => {
    const reports = await Report.find({ status: 'open' }).sort({ createdAt: 1 });

    const entries: QueueEntry[] = [];

    for (const report of reports) {
        const plan = await Plan.findById(report.planId).select('title status');

        entries.push({
            reportId: String(report._id),
            planId: String(report.planId),
            planTitle: plan?.title ?? '(plan no longer exists)',
            planStatus: plan?.status ?? 'missing',
            reason: report.reason,
            comment: report.comment,
            reportedAt: report.createdAt,
        });
    }

    return entries;
};

const run = async () => {
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
    await connectDB();

    const entries = await openReports();

    if (entries.length === 0) {
        logger.info('No open reports');
    } else {
        for (const entry of entries) {
            logger.info(entry, `${entry.reason}: "${entry.planTitle}" (${entry.planId})`);
        }
        logger.info(
            `${entries.length} open report(s). Remove a plan with: npm run moderation:remove -- <planId>`,
        );
    }

    await mongoose.disconnect();
};

// Only when invoked as a script. Importing this module — as the test does —
// must not reach for a database.
if (require.main === module) {
    run().catch(async (error) => {
        logger.fatal({ err: error }, 'Failed to read the moderation queue');
        await mongoose.disconnect().catch(() => undefined);
        process.exit(1);
    });
}
