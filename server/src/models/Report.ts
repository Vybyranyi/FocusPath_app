import mongoose, { Document, Schema } from 'mongoose';
import type { ReportReason } from '@shared/index';

export const REPORT_REASONS: readonly ReportReason[] = [
    'dangerous',
    'spam',
    'offensive',
    'nonsense',
    'other',
];

export type ReportStatus = 'open' | 'reviewed' | 'actioned';

export const REPORT_STATUSES: readonly ReportStatus[] = ['open', 'reviewed', 'actioned'];

export interface IReport extends Document {
    planId: mongoose.Types.ObjectId;
    reporterUserId: mongoose.Types.ObjectId;
    reason: ReportReason;
    comment?: string;
    status: ReportStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * A complaint about a published plan.
 *
 * There is no screen for these on purpose. The AI gate at publication is what
 * actually protects the library; this queue only holds what slipped through it,
 * which at these volumes is a few rows a week — visible from the same terminal
 * that already runs `seed:admin` and the migrations, through
 * `moderation:queue` and `moderation:remove`.
 */
const ReportSchema: Schema = new Schema({
    planId: { type: mongoose.Types.ObjectId, ref: 'Plan', required: true },
    reporterUserId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    comment: { type: String, required: false, trim: true, maxlength: 500 },
    status: { type: String, enum: REPORT_STATUSES, default: 'open', required: true },
}, { timestamps: true });

ReportSchema.index({ status: 1, createdAt: 1 });

const Report = mongoose.model<IReport>('Report', ReportSchema);

export default Report;
