import { z } from 'zod';
import { PLAN_CATEGORIES } from '@models/Plan';
import { REPORT_REASONS } from '@models/Report';
import { objectId } from '@validation/common';

export const planParamsSchema = z.object({ id: objectId('plan ID') });
export type PlanParams = z.infer<typeof planParamsSchema>;

const category = z.enum(PLAN_CATEGORIES as [string, ...string[]], 'Unknown category');
const title = z.string().trim().min(1, 'Required').max(100, 'Must be 100 characters or fewer');
const description = z.string().trim().max(500, 'Must be 500 characters or fewer');
const displayName = z.string().trim().min(1).max(30, 'Must be 30 characters or fewer');

/**
 * Publishing takes no content at all — only which habit to publish, what shelf
 * it belongs on, and optionally a name to sign it with.
 *
 * The title, the description, the length, the colours and every day title are
 * read from the habit by the server. If the client could send them it could
 * publish one plan and show itself another, and the content hash — which both
 * the proven badge and the clone statistics rest on — would stop meaning
 * anything at all.
 */
export const publishPlanSchema = z.object({
    habitId: objectId('habit ID'),
    category,
    displayName: displayName.optional(),
});
export type PublishPlanDto = z.infer<typeof publishPlanSchema>;

/**
 * The wrapper is editable; the content is frozen.
 *
 * Changing the days would break both promises the snapshot makes: the plan
 * someone is already walking would change underneath them, and the content
 * would no longer match the source habit the badge is checked against. Anyone
 * wanting different days publishes a different plan.
 */
export const updatePlanSchema = z
    .object({
        title: title.optional(),
        description: description.optional(),
        category: category.optional(),
    })
    .refine(
        body => Object.values(body).some(value => value !== undefined),
        'Provide at least one field to update',
    );
export type UpdatePlanDto = z.infer<typeof updatePlanSchema>;

export const reportPlanSchema = z.object({
    reason: z.enum(REPORT_REASONS as [string, ...string[]], 'Unknown reason'),
    comment: z.string().trim().max(500, 'Must be 500 characters or fewer').optional(),
});
export type ReportPlanDto = z.infer<typeof reportPlanSchema>;

/**
 * Checked, not coerced. Express 5 exposes `req.query` through a getter and
 * silently discards an assignment to it, so `validate` can only reject a bad
 * query — the controller reads the raw strings and parses them itself.
 */
export const plansQuerySchema = z.object({
    category: category.optional(),
    language: z.string().trim().length(2, 'Language must be a two-letter code').optional(),
    section: z.enum(['official', 'proven', 'new'], 'Unknown section').optional(),
    cursor: z.string().min(1).optional(),
    limit: z.coerce
        .number('Limit must be a number')
        .int()
        .min(1, 'Limit must be between 1 and 50')
        .max(50, 'Limit must be between 1 and 50')
        .optional(),
});
