import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "@routes/authRoutes";
import habitRoutes from "@routes/habitRouter";
import { corsOptions } from "@config/cors";
import { apiLimiter } from "@middlewares/rateLimit";
// Imported for its side effect: applies mongoose-wide query hardening.
import "@config/mongoose";

const app = express();

// Deployments sit behind a single proxy. Without this every client would appear
// to the rate limiters as the proxy's address and be throttled as one visitor.
app.set("trust proxy", 1);

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
app.use(apiLimiter);

//Routes
app.use("/auth", authRoutes);
app.use("/habits", habitRoutes);

app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
});

export default app;
