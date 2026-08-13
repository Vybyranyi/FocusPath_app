import { Request, Response } from 'express';
import * as planService from '@services/planService';
import { created, ok } from '@utils/apiResponse';
import { UnauthorizedError } from '@errors/AppError';
import type { TypedRequest } from '@middlewares/validate';
import type { PlanSection } from '@shared/index';
import type {
    PlanParams,
    PublishPlanDto,
    ReportPlanDto,
    UpdatePlanDto,
} from '@validation/planSchemas';

// Thin, as everywhere: these translate HTTP into a service call and back.
// Ownership, moderation and ranking all live in planService.

const requireUserId = (req: Request): string => {
    if (!req.userId) {
        throw new UnauthorizedError();
    }
    return req.userId;
};

/** A query parameter as a non-empty string, or nothing at all. */
const asString = (value: unknown): string | undefined =>
    typeof value === 'string' && value.length > 0 ? value : undefined;

export const listPlans = async (req: Request, res: Response) => {
    // Read from req.query rather than a validated copy: Express 5 discards an
    // assignment to it silently, so the schema checks and the handler parses.
    const limit = asString(req.query.limit);

    return ok(
        res,
        await planService.listPlans({
            category: asString(req.query.category),
            language: asString(req.query.language)?.toLowerCase(),
            section: asString(req.query.section) as PlanSection | undefined,
            cursor: asString(req.query.cursor),
            limit: limit === undefined ? undefined : Number(limit),
        }),
    );
};

/**
 * Two shapes from one route. A caller with a session gets the whole plan; one
 * without gets the first few days and `daysTruncated`, so the wall stands in
 * front of registration rather than in front of the library.
 */
export const getPlan = async (req: TypedRequest<unknown, PlanParams>, res: Response) =>
    ok(res, { plan: await planService.getPlan(req.params.id, Boolean(req.userId)) });

export const publishPlan = async (req: TypedRequest<PublishPlanDto>, res: Response) =>
    created(res, { plan: await planService.publishPlan(requireUserId(req), req.body) });

export const updatePlan = async (
    req: TypedRequest<UpdatePlanDto, PlanParams>,
    res: Response,
) => ok(res, { plan: await planService.updatePlan(requireUserId(req), req.params.id, req.body) });

export const unpublishPlan = async (req: TypedRequest<unknown, PlanParams>, res: Response) =>
    ok(res, { plan: await planService.unpublishPlan(requireUserId(req), req.params.id) });

export const listMyPlans = async (req: Request, res: Response) =>
    ok(res, { plans: await planService.listMyPlans(requireUserId(req)) });

export const reportPlan = async (
    req: TypedRequest<ReportPlanDto, PlanParams>,
    res: Response,
) => {
    await planService.reportPlan(requireUserId(req), req.params.id, req.body);

    // Nothing about the report itself goes back: the reporter learns only that
    // it was filed, and a second one changes nothing they can observe.
    return created(res, { reported: true });
};
