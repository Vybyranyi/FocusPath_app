import mongoose from "mongoose";
import { logger } from "@config/logger";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        logger.info("MongoDB connected");
    } catch (error) {
        logger.fatal({ err: error }, "MongoDB connection failed");
        process.exit(1);
    }
}