import express from "express";
import cors from "cors";
import authRoutes from "@routes/authRoutes";
import habitRoutes from "@routes/habitRouter";

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/auth", authRoutes);
app.use("/habits", habitRoutes);

export default app;