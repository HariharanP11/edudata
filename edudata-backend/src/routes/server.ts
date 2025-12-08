import express from "express";
import cors from "cors";
import { connectDB } from "../config/db";

import authRoutes from "./auth.routes";
import institutionsRoutes from "./institutions.routes";
import studentsRoutes from "./students.routes";
import teachersRoutes from "./teachers.routes";
import schemesRoutes from "./schemes.routes";

export const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());

  // routes
  app.use("/api/auth", authRoutes);
  app.use("/api/institutions", institutionsRoutes);
  app.use("/api/students", studentsRoutes);
  app.use("/api/teachers", teachersRoutes);
  app.use("/api/schemes", schemesRoutes);

  await connectDB();

  app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
};
