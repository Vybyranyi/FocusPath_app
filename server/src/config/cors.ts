import type { CorsOptions } from 'cors';

/** Vite's dev server, so a fresh checkout works without configuring anything. */
const DEFAULT_ORIGIN = 'http://localhost:5173';

const allowlist = (process.env.CORS_ORIGIN ?? DEFAULT_ORIGIN)
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

export const corsOptions: CorsOptions = {
    origin(origin, callback) {
        // No Origin header means this is not a browser cross-origin call —
        // same-origin navigation, curl, a health check — so there is nothing to gate.
        if (!origin || allowlist.includes(origin)) {
            return callback(null, true);
        }

        // Refused by withholding the CORS headers rather than by throwing: the
        // browser blocks the response either way, and this keeps a probe from
        // turning into a 500 with a stack trace behind it.
        callback(null, false);
    },
    // Needed for the cookie-based session that replaces localStorage later on.
    credentials: true,
};
