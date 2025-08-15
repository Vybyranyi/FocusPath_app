import express from "express";
import cors from "cors";
import authRoutes from "@routes/authRoutes";

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/auth", authRoutes);

export default app;