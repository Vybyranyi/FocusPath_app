import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import authRoutes from "@routes/authRoutes";
import habitRoutes from "@routes/habitRouter";
import { corsOptions } from "@config/cors";
import { logger } from "@config/logger";
import { apiLimiter } from "@middlewares/rateLimit";
import { csrfProtection } from "@middlewares/csrf";
import { errorHandler, notFoundHandler } from "@middlewares/errorHandler";
// Imported for its side effect: applies mongoose-wide query hardening.
import "@config/mongoose";

const app = express();

// Deployments sit behind a single proxy. Without this every client would appear
// to the rate limiters as the proxy's address and be throttled as one visitor.
app.set("trust proxy", 1);

app.use(pinoHttp({ logger }));
app.use(
    helmet({
        // A cross-origin JSON API by design — the browser app is served from a
        // different origin, which helmet's same-origin default would block.
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
);
app.use(cors(corsOptions));
// Generous enough for a base64 avatar, bounded enough that a body cannot be
// used to exhaust memory. The avatar itself is capped far lower on the way in.
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
// Must run after cookies are parsed and before any route that changes state.
app.use(csrfProtection);
app.use(apiLimiter);

//Routes
app.use("/auth", authRoutes);
app.use("/habits", habitRoutes);

// Both must stay last, and in this order: unmatched requests become a
// NotFoundError, which the error handler then renders like any other failure.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
