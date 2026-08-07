import { Router } from 'express';
import mongoose from 'mongoose';
import { ok } from '@utils/apiResponse';
import { ServiceUnavailableError } from '@errors/AppError';

const router = Router();

/**
 * What the hosting platform polls to decide whether a deploy came up.
 *
 * It exists separately from `/` because the SPA fallback used to answer only
 * requests that ask for text/html, and a health checker sends `Accept: * / *`
 * — it would get a JSON 404 and mark a perfectly good deploy as failed. `/`
 * itself now exempts the root from that check too, but this endpoint stays
 * anyway: it also verifies the database, which `/` does not.
 *
 * Reports the database too: a process that is listening but cannot reach Mongo
 * serves nothing but 500s, and rolling back to the previous deploy is the right
 * response to that, not leaving it in rotation.
 */
router.get('/', (_req, res) => {
    // 1 is "connected"; anything else means connecting, disconnecting or down.
    if (mongoose.connection.readyState !== 1) {
        throw new ServiceUnavailableError('Database connection is not ready');
    }

    return ok(res, { status: 'ok' });
});

export default router;
